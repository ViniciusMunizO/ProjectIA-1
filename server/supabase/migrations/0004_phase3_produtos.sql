-- Phase 3: produtos, 4-digit sequential code from 1000, with the
-- "controlado" (Medicamento-only) and "auditado" business rules.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

create sequence if not exists produtos_codigo_seq start 1000;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'categoria_produto') then
    create type categoria_produto as enum ('MEDICAMENTO', 'MATERIAL_HOSPITALAR', 'OUTROS');
  end if;
end
$$;

create table if not exists produtos (
  id uuid primary key default gen_random_uuid(),
  codigo integer not null unique default nextval('produtos_codigo_seq'),
  nome text not null,
  nome_comercial text not null,
  marca text not null,
  descricao text not null,
  categoria categoria_produto not null,
  ean text,
  registro_anvisa text,
  codigo_barras text not null,
  quantidade_caixa integer not null check (quantidade_caixa > 0),
  -- Only meaningful when categoria = MEDICAMENTO; the app forces this false
  -- for every other category, both on write and in the check below.
  controlado boolean not null default false,
  check (controlado = false or categoria = 'MEDICAMENTO'),
  -- Gates whether the product may be used in a stock entry or an order
  -- (Fase 4/5). Only ADMIN/FARMACEUTICO may flip this true; enforced in the
  -- application layer, not here, since row-level security only ever sees
  -- the service_role key.
  auditado boolean not null default false,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

alter table produtos enable row level security;
