const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export type FileValidationResult =
  | { readonly valid: true }
  | { readonly valid: false; readonly reason: string };

const hasAllowedExtension = (fileName: string): boolean =>
  ALLOWED_EXTENSIONS.some((extension) => fileName.toLowerCase().endsWith(extension));

export const validateCadastroFile = (file: File): FileValidationResult => {
  if (!hasAllowedExtension(file.name) || !ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, reason: 'Envie um arquivo PDF ou Word (.pdf, .doc, .docx)' };
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
