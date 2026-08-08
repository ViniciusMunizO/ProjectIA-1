-- Removes the old generic "cadastro pessoal" feature (nome/cpf/email/telefone
-- self-registration), superseded by the VMO clientes module. Nothing else
-- references this table.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).

drop table if exists cadastros;
