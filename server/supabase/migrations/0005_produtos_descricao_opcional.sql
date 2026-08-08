-- Descrição do produto deixa de ser obrigatória.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: DROP NOT NULL is idempotent (no-op if already nullable).

alter table produtos alter column descricao drop not null;
