import type { ClaudeModel } from '@/lib/types';

/** Application name */
export const APP_NAME = 'IkoniK' as const;

/** Marketing tagline */
export const APP_TAGLINE = 'Claude-Powered Vector Graphics Studio' as const;

/** Brand identifier */
export const BRAND = 'VASEY/AI' as const;

/** Available Claude models for vector generation */
export const MODELS: readonly ClaudeModel[] = [
  {
    id: 'claude-opus-4-6',
    name: 'Opus 4.6',
    description: 'Most capable',
  },
  {
    id: 'claude-sonnet-4-6',
    name: 'Sonnet 4.6',
    description: 'Fast & efficient',
  },
] as const;

/** Human-readable labels for fidelity levels */
export const FIDELITY_LABELS: Record<string, string> = {
  exact_trace: 'Exact Trace',
  faithful_recreation: 'Faithful Recreation',
  interpretation: 'Interpretation',
} as const;

/** Maximum upload file size in bytes (10 MB) */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/** MIME types accepted for image uploads */
export const ACCEPTED_IMAGE_TYPES: readonly string[] = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
] as const;
