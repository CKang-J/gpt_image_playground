import { afterEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_PARAMS } from '../types'
import { DEFAULT_SETTINGS } from './apiProfiles'
import { callImageApi } from './api'

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII='

describe('callImageApi', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it.each([false, true])(
    'adds the prompt rewrite guard on Responses API when Codex CLI mode is %s',
    async (codexCli) => {
      const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
        output: [{
          type: 'image_generation_call',
          result: 'aW1hZ2U=',
        }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

      await callImageApi({
        settings: { ...DEFAULT_SETTINGS, apiKey: 'test-key', apiMode: 'responses', codexCli },
        prompt: 'prompt',
        params: { ...DEFAULT_PARAMS },
        inputImageDataUrls: [],
      })

      const [, init] = fetchMock.mock.calls[0]
      const body = JSON.parse(String((init as RequestInit).body))
      expect(body.input).toBe('Use the following text as the complete prompt. Do not rewrite it:\nprompt')
    },
  )

  it('records actual params returned on Images API responses in Codex CLI mode', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      output_format: 'png',
      quality: 'medium',
      size: '1033x1522',
      data: [{
        b64_json: 'aW1hZ2U=',
        revised_prompt: '移除靴子',
      }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const result = await callImageApi({
      settings: { ...DEFAULT_SETTINGS, apiKey: 'test-key', codexCli: true },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(result.actualParams).toEqual({
      output_format: 'png',
      quality: 'medium',
      size: '1033x1522',
    })
    expect(result.actualParamsList).toEqual([{
      output_format: 'png',
      quality: 'medium',
      size: '1033x1522',
    }])
    expect(result.revisedPrompts).toEqual(['移除靴子'])
  })

  it('does not synthesize actual quality in Codex CLI mode when the API omits it', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      output_format: 'png',
      size: '1033x1522',
      data: [{ b64_json: 'aW1hZ2U=' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    const result = await callImageApi({
      settings: { ...DEFAULT_SETTINGS, apiKey: 'test-key', codexCli: true },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(result.actualParams).toEqual({
      output_format: 'png',
      size: '1033x1522',
    })
    expect(result.actualParams?.quality).toBeUndefined()
    expect(result.actualParamsList).toEqual([{
      output_format: 'png',
      size: '1033x1522',
    }])
  })

  it('uses the same-origin API proxy path when API proxy is enabled', async () => {
    vi.stubEnv('VITE_API_PROXY_AVAILABLE', 'true')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{ b64_json: 'aW1hZ2U=' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        apiKey: 'test-key',
        apiProxy: true,
        baseUrl: 'http://api.example.com/v1',
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api-proxy/images/generations',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('uses the same-origin API proxy path when API proxy is locked', async () => {
    vi.stubEnv('VITE_API_PROXY_AVAILABLE', 'true')
    vi.stubEnv('VITE_API_PROXY_LOCKED', 'true')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{ b64_json: 'aW1hZ2U=' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        apiKey: 'test-key',
        apiProxy: false,
        baseUrl: 'http://api.example.com/v1',
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(fetchMock).toHaveBeenCalledWith(
      '/api-proxy/images/generations',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('does not add cache request headers that require extra CORS allow-list entries', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{ b64_json: 'aW1hZ2U=' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await callImageApi({
      settings: { ...DEFAULT_SETTINGS, apiKey: 'test-key' },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    const [, init] = fetchMock.mock.calls[0]
    const headers = (init as RequestInit).headers as Record<string, string>
    expect(headers).not.toHaveProperty('Pragma')
    expect(headers).not.toHaveProperty('Cache-Control')
    expect((init as RequestInit).cache).toBe('no-store')
  })

  it('explains likely API/proxy misconfiguration when a successful response is HTML', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<!doctype html><html><body>Not the API</body></html>', {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    }))

    await expect(callImageApi({
      settings: { ...DEFAULT_SETTINGS, apiKey: 'test-key' },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })).rejects.toThrow('接口返回了 HTML 页面而不是 JSON')
  })

  it('polls OpenAI-compatible image tasks that return task_id before image URLs', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: [{ task_id: 'task-123' }],
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'completed',
          result: {
            images: [{ url: ['https://cdn.example.com/result.png'] }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(Uint8Array.from(atob(tinyPngBase64), (char) => char.charCodeAt(0)), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }))

    const result = await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        apiKey: 'test-key',
        baseUrl: 'https://api.apimart.ai/v1',
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.apimart.ai/v1/images/generations')
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.apimart.ai/v1/tasks/task-123?language=zh')
    expect(result.images[0]).toMatch(/^data:image\/png;base64,/)
    expect(result.rawImageUrls).toEqual(['https://cdn.example.com/result.png'])
  })

  it('uses APIMart upload and generation task APIs for image edits', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(Uint8Array.from(atob(tinyPngBase64), (char) => char.charCodeAt(0)), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ url: 'https://cdn.apimart.ai/input.png' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ task_id: 'task-apimart' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'completed',
          result: {
            images: [{ url: ['https://cdn.apimart.ai/result.png'] }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(Uint8Array.from(atob(tinyPngBase64), (char) => char.charCodeAt(0)), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }))
    const onApimartTaskEnqueued = vi.fn()

    const result = await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        baseUrl: 'https://api.apimart.ai/v1',
        model: 'gpt-image-2',
        apiKey: 'test-key',
        profiles: [{
          ...DEFAULT_SETTINGS.profiles[0],
          id: 'apimart-profile',
          provider: 'apimart',
          baseUrl: 'https://api.apimart.ai/v1',
          apiKey: 'test-key',
          model: 'gpt-image-2',
          apiMode: 'images',
        }],
        activeProfileId: 'apimart-profile',
      },
      prompt: 'edit prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [`data:image/png;base64,${tinyPngBase64}`],
      onApimartTaskEnqueued,
    })

    expect(fetchMock.mock.calls[1][0]).toBe('https://api.apimart.ai/v1/uploads/images')
    expect((fetchMock.mock.calls[1][1] as RequestInit).body).toBeInstanceOf(FormData)
    expect(((fetchMock.mock.calls[1][1] as RequestInit).body as FormData).get('file')).toBeInstanceOf(Blob)
    expect(fetchMock.mock.calls[2][0]).toBe('https://api.apimart.ai/v1/images/generations')
    expect(fetchMock.mock.calls[2][1]).toMatchObject({ method: 'POST' })
    expect(JSON.parse(String((fetchMock.mock.calls[2][1] as RequestInit).body))).toMatchObject({
      model: 'gpt-image-2',
      prompt: 'edit prompt',
      image_urls: ['https://cdn.apimart.ai/input.png'],
    })
    expect(fetchMock.mock.calls[3][0]).toBe('https://api.apimart.ai/v1/tasks/task-apimart?language=zh')
    expect(onApimartTaskEnqueued).toHaveBeenCalledWith({ taskId: 'task-apimart' })
    expect(result.images[0]).toMatch(/^data:image\/png;base64,/)
  })

  it('sends APIMart generation-only parameters for the standard model', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ task_id: 'task-apimart-standard' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'completed',
          result: {
            images: [{ url: ['https://cdn.apimart.ai/standard-result.png'] }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(Uint8Array.from(atob(tinyPngBase64), (char) => char.charCodeAt(0)), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }))

    await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        baseUrl: 'https://api.apimart.ai/v1',
        apiKey: 'test-key',
        model: 'gpt-image-2',
        profiles: [{
          ...DEFAULT_SETTINGS.profiles[0],
          id: 'apimart-standard-profile',
          provider: 'apimart',
          baseUrl: 'https://api.apimart.ai/v1',
          apiKey: 'test-key',
          model: 'gpt-image-2',
          apiMode: 'images',
        }],
        activeProfileId: 'apimart-standard-profile',
      },
      prompt: 'prompt',
      params: {
        ...DEFAULT_PARAMS,
        size: '3840x1280',
        official_fallback: true,
        n: 1,
      },
      inputImageDataUrls: [],
    })

    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      model: 'gpt-image-2',
      prompt: 'prompt',
      size: '3:1',
      resolution: '2k',
      output_format: 'png',
      quality: 'auto',
      official_fallback: true,
    })
  })

  it('maps APIMart official model parameters to its task generation schema', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: [{ task_id: 'task-apimart-official' }] }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'completed',
          result: {
            images: [{ url: ['https://cdn.apimart.ai/official-result.webp'] }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(Uint8Array.from(atob(tinyPngBase64), (char) => char.charCodeAt(0)), {
        status: 200,
        headers: { 'Content-Type': 'image/png' },
      }))

    await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        baseUrl: 'https://api.apimart.ai/v1',
        apiKey: 'test-key',
        model: 'gpt-image-2-official',
        profiles: [{
          ...DEFAULT_SETTINGS.profiles[0],
          id: 'apimart-official-profile',
          provider: 'apimart',
          baseUrl: 'https://api.apimart.ai/v1',
          apiKey: 'test-key',
          model: 'gpt-image-2-official',
          apiMode: 'images',
        }],
        activeProfileId: 'apimart-official-profile',
      },
      prompt: 'prompt',
      params: {
        ...DEFAULT_PARAMS,
        size: '2048x2048',
        quality: 'high',
        background: 'transparent',
        output_format: 'webp',
        output_compression: 80,
        moderation: 'low',
        n: 4,
      },
      inputImageDataUrls: [],
    })

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.apimart.ai/v1/images/generations')
    expect(JSON.parse(String((fetchMock.mock.calls[0][1] as RequestInit).body))).toEqual({
      model: 'gpt-image-2-official',
      prompt: 'prompt',
      size: '1:1',
      resolution: '2k',
      output_format: 'webp',
      quality: 'high',
      background: 'transparent',
      n: 4,
      moderation: 'low',
      output_compression: 80,
    })
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.apimart.ai/v1/tasks/task-apimart-official?language=zh')
  })

  it('ignores stored API proxy settings when the current deployment has no proxy', async () => {
    vi.stubEnv('VITE_API_PROXY_AVAILABLE', 'false')
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{ b64_json: 'aW1hZ2U=' }],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }))

    await callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        apiKey: 'test-key',
        apiProxy: true,
        baseUrl: 'http://api.example.com/v1',
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.example.com/v1/images/generations',
      expect.objectContaining({ method: 'POST' }),
    )
  })

  it('polls custom async tasks immediately and keeps polling after transient network errors', async () => {
    vi.useFakeTimers()
    const onCustomTaskEnqueued = vi.fn()
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'task-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'SUCCESS',
          data: {
            data: [{ b64_json: 'aW1hZ2U=' }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const promise = callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        baseUrl: 'https://api.example.com/v1',
        customProviders: [{
          id: 'custom-async',
          name: 'Custom Async',
          template: 'http-image',
          submit: {
            path: 'images/generations',
            method: 'POST',
            contentType: 'json',
            query: { async: 'true' },
            body: { model: '$profile.model', prompt: '$prompt' },
            taskIdPath: 'task_id',
          },
          poll: {
            path: 'images/tasks/{task_id}',
            method: 'GET',
            intervalSeconds: 1,
            statusPath: 'data.status',
            successValues: ['SUCCESS'],
            failureValues: ['FAILURE'],
            errorPath: 'data.fail_reason',
            result: {
              imageUrlPaths: ['data.data.data.*.url'],
              b64JsonPaths: ['data.data.data.*.b64_json'],
            },
          },
        }],
        profiles: [{
          ...DEFAULT_SETTINGS.profiles[0],
          id: 'profile-custom',
          provider: 'custom-async',
          baseUrl: 'https://api.example.com/v1',
          apiKey: 'test-key',
          model: 'model',
          timeout: 60,
        }],
        activeProfileId: 'profile-custom',
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
      onCustomTaskEnqueued,
    })

    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2))
    expect(onCustomTaskEnqueued).toHaveBeenCalledWith({ taskId: 'task-1' })
    expect(fetchMock.mock.calls[1][0]).toBe('https://api.example.com/v1/images/tasks/task-1')
    await vi.advanceTimersByTimeAsync(1000)

    await expect(promise).resolves.toEqual({
      images: ['data:image/png;base64,aW1hZ2U='],
    })
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('does not apply submit timeout to custom async polling after receiving a task id', async () => {
    vi.useFakeTimers()
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(JSON.stringify({ task_id: 'task-1' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { status: 'IN_PROGRESS' } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))
      .mockResolvedValueOnce(new Response(JSON.stringify({
        data: {
          status: 'SUCCESS',
          data: {
            data: [{ b64_json: 'aW1hZ2U=' }],
          },
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }))

    const promise = callImageApi({
      settings: {
        ...DEFAULT_SETTINGS,
        baseUrl: 'https://api.example.com/v1',
        customProviders: [{
          id: 'custom-async',
          name: 'Custom Async',
          template: 'http-image',
          submit: {
            path: 'images/generations',
            method: 'POST',
            contentType: 'json',
            query: { async: 'true' },
            body: { model: '$profile.model', prompt: '$prompt' },
            taskIdPath: 'task_id',
          },
          poll: {
            path: 'images/tasks/{task_id}',
            method: 'GET',
            intervalSeconds: 5,
            statusPath: 'data.status',
            successValues: ['SUCCESS'],
            failureValues: ['FAILURE'],
            result: {
              b64JsonPaths: ['data.data.data.*.b64_json'],
            },
          },
        }],
        profiles: [{
          ...DEFAULT_SETTINGS.profiles[0],
          id: 'profile-custom',
          provider: 'custom-async',
          baseUrl: 'https://api.example.com/v1',
          apiKey: 'test-key',
          model: 'model',
          timeout: 1,
        }],
        activeProfileId: 'profile-custom',
        timeout: 1,
      },
      prompt: 'prompt',
      params: { ...DEFAULT_PARAMS },
      inputImageDataUrls: [],
    })

    await vi.advanceTimersByTimeAsync(6000)

    await expect(promise).resolves.toEqual({
      images: ['data:image/png;base64,aW1hZ2U='],
    })
  })
})
