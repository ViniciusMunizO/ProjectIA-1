import { randomUUID } from 'node:crypto';
import { supabase } from '../../db/supabase.js';
import { AppError } from '../../lib/http-error.js';

const BUCKET = 'clientes-documentos';
const MAX_SIZE_BYTES = 5 * 1024 * 1024;
const SIGNED_URL_TTL_SECONDS = 60;

type AllowedType = {
  readonly mime: string;
  readonly ext: string;
  readonly matchesSignature: (buffer: Buffer) => boolean;
};

// Checked against the file's own bytes, never the client-supplied filename
// or Content-Type (both attacker-controlled and trivially spoofed).
const ALLOWED_TYPES: readonly AllowedType[] = [
  {
    mime: 'application/pdf',
    ext: 'pdf',
    matchesSignature: (buffer) => buffer.subarray(0, 4).toString('latin1') === '%PDF',
  },
  {
    mime: 'image/png',
    ext: 'png',
    matchesSignature: (buffer) =>
      buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  },
  {
    mime: 'image/jpeg',
    ext: 'jpg',
    matchesSignature: (buffer) => buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])),
  },
];

// Validated up front, before any row is written, so a rejected file never
// leaves a cliente record half-created.
export const validateDocumento = (file: {
  readonly buffer: Buffer;
  readonly size: number;
}): AllowedType => {
  if (file.size > MAX_SIZE_BYTES) {
    throw new AppError(400, 'Arquivo muito grande. O limite é 5 MB.');
  }

  const matched = ALLOWED_TYPES.find((type) => type.matchesSignature(file.buffer));
  if (!matched) {
    throw new AppError(400, 'Tipo de arquivo não suportado. Envie um PDF, JPG ou PNG.');
  }

  return matched;
};

export const storeClienteDocumento = async (
  clienteId: string,
  buffer: Buffer,
  type: AllowedType,
): Promise<string> => {
  // Server-generated key: the client's original filename never becomes part
  // of the storage path, so there is nothing for path traversal, overwrite,
  // or an alternate-stream trick to act on.
  const path = `${clienteId}/${randomUUID()}.${type.ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, buffer, {
    contentType: type.mime,
    upsert: false,
  });

  if (error) {
    throw new AppError(502, 'Cliente cadastrado, mas não foi possível enviar o documento agora.');
  }

  return path;
};

export const getClienteDocumentoSignedUrl = async (path: string): Promise<string> => {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    throw new AppError(502, 'Não foi possível gerar o link do documento agora.');
  }

  return data.signedUrl;
};
