import type { ApiProfile, TaskParams } from '../types'
import { dataUrlToBlob, imageDataUrlToPngBlob, maskDataUrlToPngBlob } from './canvasImage'
import { buildApiUrl, readClientDevProxyConfig, shouldUseApiProxy } from './devProxy'
import { normalizeImageSize } from './size'
import {
  assertImageInputPayloadSize,
  assertMaskEditFileSize,
  type CallApiOptions,
  type CallApiResult,
  fetchImageUrlAsDataUrl,
  getApiErrorMessage,
  MIME_MAP,
  readJsonResponse,
} from './imageApiShared'

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }, { once: true })
  })
}

function getByPath(source: unknown, path: string | undefined): unknown {
  if (!path) return source
  return path.split('.').filter(Boolean).reduce<unknown>((current, key) => {
    if (current == null) return undefined
    if (/^\d+$/.test(key) && Array.isArray(current)) return current[Number(key)]
    if (typeof current === 'object') return (current as Record<string, unknown>)[key]
    return undefined
  }, source)
}

function getAllByPath(source: unknown, path: string): unknown[] {
  const parts = path.split('.').filter(Boolean)
  let current: unknown[] = [source]

  for (const key of parts) {
    const next: unknown[] = []
    for (const item of current) {
      if (item == null) continue
      if (key === '*') {
        if (Array.isArray(item)) next.push(...item)
        else if (typeof item === 'object') next.push(...Object.values(item as Record<string, unknown>))
        continue
      }
      if (/^\d+$/.test(key) && Array.isArray(item)) {
        next.push(item[Number(key)])
        continue
      }
      if (typeof item === 'object') next.push((item as Record<string, unknown>)[key])
    }
    current = next
  }

  return current.flatMap((item) => Array.isArray(item) ? item : [item]).filter((item) => item != null)
}

function createRequestHeaders(profile: ApiProfile): Record<string, string> {
  return { Authorization: `Bearer ${profile.apiKey}` }
}

function readTaskId(payload: unknown): string | null {
  const value = getByPath(payload, 'data.0.task_id') ?? getByPath(payload, 'task_id')
  const taskId = typeof value === 'string' ? value.trim() : String(value ?? '').trim()
  return taskId || null
}

function readTaskState(payload: unknown): 'success' | 'failure' | 'pending' {
  const status = getByPath(payload, 'data.status')
  const normalized = typeof status === 'string' ? status.trim().toLowerCase() : ''
  if (['completed', 'success', 'succeeded'].includes(normalized)) return 'success'
  if (['failed', 'failure', 'cancelled', 'canceled'].includes(normalized)) return 'failure'
  return 'pending'
}

function readTaskImageUrls(payload: unknown): string[] {
  return getAllByPath(payload, 'data.result.images.*.url.*').filter((value): value is string =>
    typeof value === 'string' && /^https?:\/\//i.test(value),
  )
}

function readUploadedImageUrl(payload: unknown): string | null {
  const direct = getByPath(payload, 'url')
  if (typeof direct === 'string' && /^https?:\/\//i.test(direct)) return direct

  const nested = getByPath(payload, 'data.url')
  if (typeof nested === 'string' && /^https?:\/\//i.test(nested)) return nested

  return null
}

const APIMART_SIZE_FIELD_MAP = new Map<string, { size: string; resolution?: string }>([
  ['1024x1024', { size: '1:1', resolution: '1k' }],
  ['2048x2048', { size: '1:1', resolution: '2k' }],
  ['3840x3840', { size: '1:1', resolution: '4k' }],
  ['1536x1024', { size: '3:2', resolution: '1k' }],
  ['3072x2048', { size: '3:2', resolution: '2k' }],
  ['1024x1536', { size: '2:3', resolution: '1k' }],
  ['2048x3072', { size: '2:3', resolution: '2k' }],
  ['1365x1024', { size: '4:3', resolution: '1k' }],
  ['2730x2048', { size: '4:3', resolution: '2k' }],
  ['1024x1365', { size: '3:4', resolution: '1k' }],
  ['2048x2730', { size: '3:4', resolution: '2k' }],
  ['1280x1024', { size: '5:4', resolution: '1k' }],
  ['2560x2048', { size: '5:4', resolution: '2k' }],
  ['1024x1280', { size: '4:5', resolution: '1k' }],
  ['2048x2560', { size: '4:5', resolution: '2k' }],
  ['1820x1024', { size: '16:9', resolution: '1k' }],
  ['3640x2048', { size: '16:9', resolution: '2k' }],
  ['3840x2160', { size: '16:9', resolution: '4k' }],
  ['1024x1820', { size: '9:16', resolution: '1k' }],
  ['2048x3640', { size: '9:16', resolution: '2k' }],
  ['2160x3840', { size: '9:16', resolution: '4k' }],
  ['2048x1024', { size: '2:1', resolution: '1k' }],
  ['3840x1920', { size: '2:1', resolution: '2k' }],
  ['1024x2048', { size: '1:2', resolution: '1k' }],
  ['1920x3840', { size: '1:2', resolution: '2k' }],
  ['3072x1024', { size: '3:1', resolution: '1k' }],
  ['3840x1280', { size: '3:1', resolution: '2k' }],
  ['1024x3072', { size: '1:3', resolution: '1k' }],
  ['1280x3840', { size: '1:3', resolution: '2k' }],
  ['2400x1024', { size: '21:9', resolution: '1k' }],
  ['3840x1645', { size: '21:9', resolution: '2k' }],
  ['1024x2400', { size: '9:21', resolution: '1k' }],
  ['1645x3840', { size: '9:21', resolution: '2k' }],
])

const APIMART_RATIO_VALUES = new Set([
  '1:1',
  '3:2',
  '2:3',
  '4:3',
  '3:4',
  '5:4',
  '4:5',
  '16:9',
  '9:16',
  '2:1',
  '1:2',
  '3:1',
  '1:3',
  '21:9',
  '9:21',
])

function isOfficialModel(model: string): boolean {
  return model.trim().toLowerCase() === 'gpt-image-2-official'
}

function mapSizeToApimartFields(size: string): { size: string; resolution?: string } {
  const normalized = normalizeImageSize(size || 'auto')
  if (!normalized || normalized === 'auto') return { size: 'auto' }
  if (APIMART_RATIO_VALUES.has(normalized)) return { size: normalized }
  return APIMART_SIZE_FIELD_MAP.get(normalized) ?? { size: normalized }
}

async function uploadImage(profile: ApiProfile, blob: Blob, filename: string, signal: AbortSignal): Promise<string> {
  const proxyConfig = readClientDevProxyConfig()
  const useApiProxy = shouldUseApiProxy(profile.apiProxy, proxyConfig)
  const formData = new FormData()
  formData.append('file', blob, filename)

  const response = await fetch(buildApiUrl(profile.baseUrl, 'uploads/images', proxyConfig, useApiProxy), {
    method: 'POST',
    headers: createRequestHeaders(profile),
    cache: 'no-store',
    body: formData,
    signal,
  })

  if (!response.ok) throw new Error(await getApiErrorMessage(response))

  const payload = await readJsonResponse(response)
  const url = readUploadedImageUrl(payload)
  if (!url) {
    const err = new Error('APIMart 图片上传成功，但响应中没有返回可用的图片 URL。')
    ;(err as any).rawResponsePayload = JSON.stringify(payload, null, 2)
    throw err
  }
  return url
}

async function uploadInputImages(
  profile: ApiProfile,
  inputImageDataUrls: string[],
  maskDataUrl: string | undefined,
  signal: AbortSignal,
): Promise<{ imageUrls: string[]; maskUrl?: string }> {
  const imageBlobs: Blob[] = []
  for (let i = 0; i < inputImageDataUrls.length; i++) {
    const dataUrl = inputImageDataUrls[i]
    imageBlobs.push(maskDataUrl && i === 0 ? await imageDataUrlToPngBlob(dataUrl) : await dataUrlToBlob(dataUrl))
  }

  const maskBlob = maskDataUrl ? await maskDataUrlToPngBlob(maskDataUrl) : null
  if (maskDataUrl) {
    assertMaskEditFileSize('遮罩主图文件', imageBlobs[0]?.size ?? 0)
    assertMaskEditFileSize('遮罩文件', maskBlob?.size ?? 0)
  }
  assertImageInputPayloadSize(imageBlobs.reduce((sum, blob) => sum + blob.size, 0) + (maskBlob?.size ?? 0))

  const imageUrls: string[] = []
  for (let i = 0; i < imageBlobs.length; i++) {
    const blob = imageBlobs[i]
    const ext = blob.type.split('/')[1] || 'png'
    imageUrls.push(await uploadImage(profile, blob, `input-${i + 1}.${ext}`, signal))
  }

  const maskUrl = maskBlob ? await uploadImage(profile, maskBlob, 'mask.png', signal) : undefined
  return { imageUrls, maskUrl }
}

function createGenerationBody(
  profile: ApiProfile,
  prompt: string,
  params: TaskParams,
  imageUrls: string[],
  maskUrl?: string,
): Record<string, unknown> {
  const sizeFields = mapSizeToApimartFields(params.size)
  const officialModel = isOfficialModel(profile.model)
  const body: Record<string, unknown> = {
    model: profile.model,
    prompt,
    ...sizeFields,
    output_format: params.output_format,
    quality: params.quality,
  }

  if (params.n > 1) body.n = params.n
  if (officialModel) {
    body.background = params.background
    body.moderation = params.moderation
    if (params.output_format !== 'png' && params.output_compression != null) {
      body.output_compression = params.output_compression
    }
  } else if (params.official_fallback) {
    body.official_fallback = true
  }
  if (imageUrls.length) body.image_urls = imageUrls
  if (maskUrl) body.mask_url = maskUrl

  return body
}

async function extractTaskImages(payload: unknown, mime: string, signal: AbortSignal): Promise<CallApiResult> {
  const rawImageUrls = readTaskImageUrls(payload)
  const images: string[] = []
  try {
    for (const url of rawImageUrls) {
      images.push(await fetchImageUrlAsDataUrl(url, mime, signal))
    }
  } catch (err) {
    if (rawImageUrls.length > 0 && err instanceof Error) {
      (err as any).rawImageUrls = rawImageUrls
    }
    throw err
  }

  if (!images.length) {
    const err = new Error('APIMart 任务已完成，但没有返回可识别的图片 URL。')
    ;(err as any).rawResponsePayload = JSON.stringify(payload, null, 2)
    throw err
  }

  return { images, asyncTask: true, ...(rawImageUrls.length ? { rawImageUrls } : {}) }
}

export async function getApimartQueuedImageResult(
  profile: ApiProfile,
  taskId: string,
  params: TaskParams,
  signal?: AbortSignal,
): Promise<CallApiResult> {
  const mime = MIME_MAP[params.output_format] || 'image/png'
  const controller = new AbortController()
  const activeSignal = signal ?? controller.signal
  const proxyConfig = readClientDevProxyConfig()
  const useApiProxy = shouldUseApiProxy(profile.apiProxy, proxyConfig)

  while (true) {
    const response = await fetch(buildApiUrl(profile.baseUrl, `tasks/${encodeURIComponent(taskId)}?language=zh`, proxyConfig, useApiProxy), {
      method: 'GET',
      headers: createRequestHeaders(profile),
      cache: 'no-store',
      signal: activeSignal,
    })

    if (!response.ok) throw new Error(await getApiErrorMessage(response))

    const payload = await readJsonResponse(response)
    const state = readTaskState(payload)
    if (state === 'success') return extractTaskImages(payload, mime, activeSignal)
    if (state === 'failure') {
      const message = getByPath(payload, 'data.error.message') || getByPath(payload, 'data.fail_reason') || getByPath(payload, 'message') || getByPath(payload, 'error.message')
      const err = new Error(typeof message === 'string' && message.trim() ? message : 'APIMart 图片任务失败')
      ;(err as any).rawResponsePayload = JSON.stringify(payload, null, 2)
      throw err
    }

    await sleep(5_000, activeSignal)
  }
}

export async function callApimartImageApi(opts: CallApiOptions, profile: ApiProfile): Promise<CallApiResult> {
  const { prompt, params, inputImageDataUrls } = opts
  const mime = MIME_MAP[params.output_format] || 'image/png'
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), profile.timeout * 1000)
  const proxyConfig = readClientDevProxyConfig()
  const useApiProxy = shouldUseApiProxy(profile.apiProxy, proxyConfig)

  try {
    const uploaded = inputImageDataUrls.length || opts.maskDataUrl
      ? await uploadInputImages(profile, inputImageDataUrls, opts.maskDataUrl, controller.signal)
      : { imageUrls: [] }
    const body = createGenerationBody(profile, prompt, params, uploaded.imageUrls, uploaded.maskUrl)

    const response = await fetch(buildApiUrl(profile.baseUrl, 'images/generations', proxyConfig, useApiProxy), {
      method: 'POST',
      headers: {
        ...createRequestHeaders(profile),
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
      body: JSON.stringify(body),
      signal: controller.signal,
    })

    if (!response.ok) throw new Error(await getApiErrorMessage(response))

    const payload = await readJsonResponse(response)
    const taskId = readTaskId(payload)
    if (!taskId) {
      const err = new Error('APIMart 没有返回任务 ID。')
      ;(err as any).rawResponsePayload = JSON.stringify(payload, null, 2)
      throw err
    }

    opts.onApimartTaskEnqueued?.({ taskId })
    return getApimartQueuedImageResult(profile, taskId, params, controller.signal)
  } finally {
    clearTimeout(timeoutId)
  }
}
