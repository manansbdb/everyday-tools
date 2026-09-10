/** Client-side size limits (bytes). Soft limits for browser memory safety. */
export const LIMITS = {
  IMAGE_MAX_BYTES: 25 * 1024 * 1024, // 25 MB per image
  IMAGE_MAX_FILES: 20,
  PDF_MAX_BYTES: 50 * 1024 * 1024, // 50 MB per PDF
  PDF_MAX_FILES: 30,
  PDF_MAX_PAGES_SPLIT: 500,
} as const

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/bmp',
] as const

export const CONVERT_OUTPUT_FORMATS = ['image/png', 'image/jpeg', 'image/webp'] as const

export type ConvertOutputFormat = (typeof CONVERT_OUTPUT_FORMATS)[number]
