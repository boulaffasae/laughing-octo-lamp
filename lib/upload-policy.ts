// Leave room for multipart overhead below Vercel's 4.5 MB request limit.
export const MAX_FILE_BYTES = 4 * 1024 * 1024;
export const MAX_BODY_BYTES = MAX_FILE_BYTES + 64 * 1024;
export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;
