-- Phase 1: users with roles, sessions, rotating signup key, and the existing
-- cadastros feature, migrated from the previous better-sqlite3 schema.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('ADMIN', 'GERENTE', 'FUNCIONARIO', 'FARMACEUTICO');
  end if;
end
$$;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text not null unique,
  password_hash text not null,
  -- null = self-registered, awaiting an ADMIN/GERENTE to assign a role.
  role user_role,
  blocked_until timestamptz,
  created_by uuid references users(id) on delete set null,
  created_ip text,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create table if not exists sessions (
  id text primary key,
  public_id uuid not null unique default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_sessions_user_id on sessions(user_id);

-- Singleton row: the current self-signup access key. Lazily rotated by the
-- server whenever an ADMIN requests it and it has expired (id is pinned to 1
-- so there is always at most one row).
create table if not exists signup_key (
  id smallint primary key default 1,
  key_value text not null,
  expires_at timestamptz not null,
  generated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint signup_key_singleton check (id = 1)
);

create table if not exists cadastros (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  nome text not null,
  cpf text not null,
  email text not null,
  telefone text not null,
  created_at timestamptz not null default now(),
  unique (user_id, cpf)
);

create index if not exists idx_cadastros_user_id on cadastros(user_id);

-- The server only ever talks to Postgres with the service_role key, which
-- bypasses RLS entirely. Enabling RLS with no policies is a deny-all backstop
-- in case the anon/public key is ever pointed at these tables directly.
alter table users enable row level security;
alter table sessions enable row level security;
alter table signup_key enable row level security;
alter table cadastros enable row level security;
