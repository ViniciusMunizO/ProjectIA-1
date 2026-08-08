-- Phase 4: fornecedores, sequential code from 10, used by the future
-- Entrada de Estoque (Fase 5).
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

create sequence if not exists fornecedores_codigo_seq start 10;

create table if not exists fornecedores (
  id uuid primary key default gen_random_uuid(),
  codigo integer not null unique default nextval('fornecedores_codigo_seq'),
  cnpj text not null unique,
  razao_social text not null,
  nome_fantasia text,
  cep text,
  logradouro text,
  numero text,
  complemento text,
  bairro text,
  cidade text,
  uf text,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_fornecedores_cnpj on fornecedores(cnpj);

alter table fornecedores enable row level security;
