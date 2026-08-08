const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type FileValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

const CLIENTE_DOC_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const CLIENTE_DOC_MIME_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);

// Mirrors the server's magic-byte allowlist (PDF/JPG/PNG) in documento-upload.service.ts.
// This check is a UX convenience only — the server never trusts the name or
// declared type and re-verifies the file's actual bytes.
export const validateClienteDocumento = (file: File): FileValidationResult => {
  const hasAllowedExtension = CLIENTE_DOC_EXTENSIONS.some((extension) =>
    file.name.toLowerCase().endsWith(extension),
  );

  if (!hasAllowedExtension || !CLIENTE_DOC_MIME_TYPES.has(file.type)) {
    return { valid: false, reason: 'Envie um arquivo PDF, JPG ou PNG' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, reason: 'O arquivo deve ter no máximo 5 MB' };
  }

  return { valid: true };
};

export const formatFileSize = (bytes: number): string => {
  const kilobytes = bytes / 1024;
  if (kilobytes < 1024) {
    return `${kilobytes.toFixed(0)} KB`;
  }
  return `${(kilobytes / 1024).toFixed(1)} MB`;
};
