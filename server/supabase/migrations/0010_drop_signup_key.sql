-- Signup no longer requires an access key: every self-registered account
-- already lands with role = null and requireRole already blocks any
-- role-less account from everything, so an ADMIN/GERENTE assigning a role
-- from the Usuários panel is the only gate that ever mattered. The key was
-- a redundant second gate — this drops its now-unused table.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: idempotent.

drop table if exists signup_key;
