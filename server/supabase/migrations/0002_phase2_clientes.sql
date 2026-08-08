-- Phase 2: clientes (CPF/CNPJ), sequential code from 100, and a private
-- storage bucket for the optional identity document.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

create sequence if not exists clientes_codigo_seq start 100;

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  codigo integer not null unique default nextval('clientes_codigo_seq'),
  tipo_documento text not null check (tipo_documento in ('CPF', 'CNPJ')),
  -- Digits only (no mask), unique across CPF and CNPJ alike since the two
  -- formats never collide.
  documento text not null unique,
  nome text not null,
  nome_fantasia text,
  email text,
  telefone text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  -- Object path inside the private 'clientes-documentos' bucket; null when
  -- no document was uploaded (upload is optional, see charter principle V
  -- equivalent for this flow: the server only ever writes what the user
  -- explicitly attached).
  documento_arquivo_path text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_clientes_documento on clientes(documento);

alter table clientes enable row level security;

-- Private bucket: every read/write goes through the server's service_role
-- key (signed URLs for retrieval), never a public URL or the anon key.
insert into storage.buckets (id, name, public)
values ('clientes-documentos', 'clientes-documentos', false)
on conflict (id) do nothing;
