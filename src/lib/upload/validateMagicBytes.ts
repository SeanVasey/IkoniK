/**
 * Detects the real MIME type of a file by inspecting its magic bytes (file
 * signature), rather than trusting client-declared Content-Type headers.
 *
 * Only types in ACCEPTED_IMAGE_TYPES are recognised — everything else returns
 * `null`, which callers should treat as "reject".
 */

/** Minimum number of header bytes needed to identify any supported format. */
export const MAGIC_BYTES_LENGTH = 12;

interface MagicSignature {
  mime: string;
  /** Byte offsets → expected values. Gaps are allowed (e.g. WebP skips 4-7). */
  bytes: Array<{ offset: number; values: number[] }>;
}

const SIGNATURES: MagicSignature[] = [
  {
    // PNG: 89 50 4E 47 0D 0A 1A 0A
    mime: 'image/png',
    bytes: [{ offset: 0, values: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] }],
  },
  {
    // JPEG: FF D8 FF
    mime: 'image/jpeg',
    bytes: [{ offset: 0, values: [0xff, 0xd8, 0xff] }],
  },
  {
    // WebP: "RIFF" at 0-3, "WEBP" at 8-11
    mime: 'image/webp',
    bytes: [
      { offset: 0, values: [0x52, 0x49, 0x46, 0x46] },
      { offset: 8, values: [0x57, 0x45, 0x42, 0x50] },
    ],
  },
  {
    // GIF: "GIF8" (covers GIF87a and GIF89a)
    mime: 'image/gif',
    bytes: [{ offset: 0, values: [0x47, 0x49, 0x46, 0x38] }],
  },
];

/**
 * Inspect the first bytes of `header` and return the detected MIME type, or
 * `null` if the bytes don't match any allowed image format.
 *
 * @param header - At least {@link MAGIC_BYTES_LENGTH} bytes from the start of the file.
 */
export function detectMimeFromBytes(header: Uint8Array): string | null {
  if (header.length < MAGIC_BYTES_LENGTH) return null;

  for (const sig of SIGNATURES) {
    let match = true;
    for (const rule of sig.bytes) {
      for (let i = 0; i < rule.values.length; i++) {
        if (header[rule.offset + i] !== rule.values[i]) {
          match = false;
          break;
        }
      }
      if (!match) break;
    }
    if (match) return sig.mime;
  }

  return null;
}
