import { describe, it, expect } from 'vitest'
import {
  APP_NAME,
  APP_TAGLINE,
  BRAND,
  MODELS,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
  UPLOAD_BUCKET,
  PROXY_SIZE_LIMIT,
} from '@/lib/constants'

describe('constants', () => {
  it('has correct app name', () => {
    expect(APP_NAME).toBe('IkoniK')
  })

  it('has a tagline', () => {
    expect(APP_TAGLINE).toBeTruthy()
  })

  it('has a brand identifier', () => {
    expect(BRAND).toBe('VASEY/AI')
  })

  it('defines valid Claude models', () => {
    expect(MODELS.length).toBeGreaterThan(0)
    for (const model of MODELS) {
      expect(model.id).toBeTruthy()
      expect(model.name).toBeTruthy()
      expect(model.id).toMatch(/^claude-/)
    }
  })

  it('sets max file size to 10 MB', () => {
    expect(MAX_FILE_SIZE).toBe(10 * 1024 * 1024)
  })

  it('accepts standard image MIME types', () => {
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/png')
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/jpeg')
    expect(ACCEPTED_IMAGE_TYPES).toContain('image/webp')
  })

  it('defines an upload bucket', () => {
    expect(UPLOAD_BUCKET).toBeTruthy()
  })

  it('sets proxy size limit below max', () => {
    expect(PROXY_SIZE_LIMIT).toBeLessThan(MAX_FILE_SIZE)
  })
})
