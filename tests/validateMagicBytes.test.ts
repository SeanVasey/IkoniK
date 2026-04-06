import { describe, it, expect } from 'vitest'
import { detectMimeFromBytes, MAGIC_BYTES_LENGTH } from '@/lib/upload/validateMagicBytes'

describe('detectMimeFromBytes', () => {
  function padToMinLength(bytes: number[]): Uint8Array {
    const padded = new Uint8Array(Math.max(bytes.length, MAGIC_BYTES_LENGTH))
    padded.set(bytes)
    return padded
  }

  it('detects PNG files', () => {
    const bytes = padToMinLength([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    expect(detectMimeFromBytes(bytes)).toBe('image/png')
  })

  it('detects JPEG files', () => {
    const bytes = padToMinLength([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])
    expect(detectMimeFromBytes(bytes)).toBe('image/jpeg')
  })

  it('detects WebP files', () => {
    const riff = [0x52, 0x49, 0x46, 0x46] // "RIFF"
    const size = [0x00, 0x00, 0x00, 0x00]
    const webp = [0x57, 0x45, 0x42, 0x50] // "WEBP"
    const bytes = padToMinLength([...riff, ...size, ...webp])
    expect(detectMimeFromBytes(bytes)).toBe('image/webp')
  })

  it('detects GIF files', () => {
    const bytes = padToMinLength([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
    expect(detectMimeFromBytes(bytes)).toBe('image/gif')
  })

  it('rejects unknown file types', () => {
    const bytes = padToMinLength([0x00, 0x00, 0x00, 0x00])
    expect(detectMimeFromBytes(bytes)).toBeNull()
  })

  it('rejects too-short headers', () => {
    const bytes = new Uint8Array([0x89, 0x50])
    expect(detectMimeFromBytes(bytes)).toBeNull()
  })
})
