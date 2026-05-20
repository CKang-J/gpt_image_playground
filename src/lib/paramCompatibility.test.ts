import { describe, expect, it } from 'vitest'
import { DEFAULT_PARAMS } from '../types'
import { createDefaultApimartProfile, createDefaultFalProfile, DEFAULT_SETTINGS, normalizeSettings } from './apiProfiles'
import { getOutputImageLimitForSettings, normalizeParamsForSettings } from './paramCompatibility'

describe('parameter compatibility', () => {
  it('limits OpenAI output count to 10', () => {
    const settings = normalizeSettings(DEFAULT_SETTINGS)

    expect(getOutputImageLimitForSettings(settings)).toBe(10)
    expect(normalizeParamsForSettings({ ...DEFAULT_PARAMS, n: 12 }, settings).n).toBe(10)
  })

  it('limits fal.ai output count to 4', () => {
    const falProfile = createDefaultFalProfile({ apiKey: 'fal-key' })
    const settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      profiles: [falProfile],
      activeProfileId: falProfile.id,
    })

    expect(getOutputImageLimitForSettings(settings)).toBe(4)
    expect(normalizeParamsForSettings({ ...DEFAULT_PARAMS, n: 8 }, settings).n).toBe(4)
  })

  it('limits APIMart output count by model and preserves model-specific params', () => {
    const standardProfile = createDefaultApimartProfile({ apiKey: 'apimart-key', model: 'gpt-image-2' })
    const standardSettings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      profiles: [standardProfile],
      activeProfileId: standardProfile.id,
    })
    const standardParams = normalizeParamsForSettings({
      ...DEFAULT_PARAMS,
      n: 4,
      background: 'transparent',
      official_fallback: true,
      moderation: 'low',
      output_format: 'webp',
      output_compression: 80,
    }, standardSettings)

    expect(getOutputImageLimitForSettings(standardSettings)).toBe(1)
    expect(standardParams).toMatchObject({
      n: 1,
      background: 'auto',
      official_fallback: true,
      moderation: 'auto',
      output_compression: null,
    })

    const officialProfile = createDefaultApimartProfile({ apiKey: 'apimart-key', model: 'gpt-image-2-official' })
    const officialSettings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      profiles: [officialProfile],
      activeProfileId: officialProfile.id,
    })
    const officialParams = normalizeParamsForSettings({
      ...DEFAULT_PARAMS,
      n: 8,
      background: 'transparent',
      official_fallback: true,
      moderation: 'low',
      output_format: 'webp',
      output_compression: 80,
    }, officialSettings)

    expect(getOutputImageLimitForSettings(officialSettings)).toBe(4)
    expect(officialParams).toMatchObject({
      n: 4,
      background: 'transparent',
      official_fallback: false,
      moderation: 'low',
      output_compression: 80,
    })
  })

  it('only replaces fal.ai auto size in text-to-image mode', () => {
    const falProfile = createDefaultFalProfile({ apiKey: 'fal-key' })
    const settings = normalizeSettings({
      ...DEFAULT_SETTINGS,
      profiles: [falProfile],
      activeProfileId: falProfile.id,
    })

    expect(normalizeParamsForSettings({ ...DEFAULT_PARAMS, size: 'auto' }, settings).size).toBe('1360x1024')
    expect(normalizeParamsForSettings({ ...DEFAULT_PARAMS, size: 'auto' }, settings, { hasInputImages: true }).size).toBe('auto')
  })
})
