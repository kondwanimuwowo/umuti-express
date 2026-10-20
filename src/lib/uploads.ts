export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export function fileExtension(file: File) {
  return file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
}

/** A file picked in a form, checked for presence, size and type. */
export function checkUpload(file: unknown, label: string): { file: File } | { error: string } {
  if (!(file instanceof File) || file.size === 0) return { error: `Upload the ${label}.` };
  if (file.size > MAX_UPLOAD_BYTES) return { error: `The ${label} is larger than 8MB.` };
  if (!ACCEPTED.includes(file.type)) return { error: `The ${label} must be a JPEG, PNG, WebP or PDF.` };
  return { file };
}
