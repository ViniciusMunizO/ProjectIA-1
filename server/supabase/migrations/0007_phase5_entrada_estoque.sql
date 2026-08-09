-- Phase 5: Entrada de Estoque (Nota de Entrada) — receives stock from a
-- fornecedor into one or more produtos, and is the first thing that ever
-- makes produtos.quantidade_estoque a real number instead of the "not
-- tracked yet" placeholder the Produtos page showed since Fase 3.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

alter table produtos add column if not exists quantidade_estoque integer not null default 0;

create sequence if not exists notas_entrada_codigo_seq start 1;

create table if not exists notas_entrada (
  id uuid primary key default gen_random_uuid(),
  codigo integer not null unique default nextval('notas_entrada_codigo_seq'),
  fornecedor_id uuid not null references fornecedores(id),
  data_emissao date not null default current_date,
  valor_frete numeric(12, 2) not null default 0 check (valor_frete >= 0),
  desconto numeric(12, 2) not null default 0 check (desconto >= 0),
  -- Sum of every item's custo_total, computed inside
  -- fn_create_entrada_estoque rather than trusted from the client.
  custo_total numeric(12, 2) not null default 0,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_notas_entrada_fornecedor on notas_entrada(fornecedor_id);

create table if not exists notas_entrada_itens (
  id uuid primary key default gen_random_uuid(),
  nota_entrada_id uuid not null references notas_entrada(id) on delete cascade,
  produto_id uuid not null references produtos(id),
  lote text not null,
  data_fabricacao date,
  validade date not null,
  unidade_medida text not null check (unidade_medida in ('CX', 'UN')),
  quantidade integer not null check (quantidade > 0),
  custo_unitario numeric(12, 2) not null check (custo_unitario >= 0),
  custo_total numeric(12, 2) not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_notas_entrada_itens_nota on notas_entrada_itens(nota_entrada_id);
create index if not exists idx_notas_entrada_itens_produto on notas_entrada_itens(produto_id);

alter table notas_entrada enable row level security;
alter table notas_entrada_itens enable row level security;

-- Creates a nota de entrada and every one of its itens in a single
-- transaction (a stored procedure's body is implicitly one transaction), so
-- a failure partway through — a non-audited produto, a bad item — leaves
-- nothing behind rather than a half-saved note with stock only partially
-- updated. p_itens is a jsonb array; jsonb_to_recordset gives each field a
-- fixed declared type, so this is parameter binding, not string-built SQL.
create or replace function fn_create_entrada_estoque(
  p_fornecedor_id uuid,
  p_valor_frete numeric,
  p_desconto numeric,
  p_created_by uuid,
  p_itens jsonb
) returns uuid
language plpgsql
as $$
declare
  v_nota_id uuid;
  v_custo_total numeric := 0;
  v_item record;
  v_item_custo_total numeric;
  v_quantidade_caixa integer;
  v_unidades_adicionadas integer;
  v_produto_auditado boolean;
begin
  if jsonb_array_length(p_itens) = 0 then
    raise exception 'A nota precisa ter ao menos um item.';
  end if;

  insert into notas_entrada (fornecedor_id, valor_frete, desconto, custo_total, created_by, updated_by)
  values (p_fornecedor_id, p_valor_frete, p_desconto, 0, p_created_by, p_created_by)
  returning id into v_nota_id;

  for v_item in
    select * from jsonb_to_recordset(p_itens) as x(
      produto_id uuid,
      lote text,
      data_fabricacao date,
      validade date,
      unidade_medida text,
      quantidade integer,
      custo_unitario numeric
    )
  loop
    select auditado, quantidade_caixa into v_produto_auditado, v_quantidade_caixa
    from produtos where id = v_item.produto_id;

    if v_produto_auditado is null then
      raise exception 'Produto não encontrado.';
    end if;
    -- Belt-and-suspenders: the server already filters the search to
    -- auditado produtos and re-checks before calling this function, but the
    -- database is the actual enforcement boundary for the Fase 3.1 rule.
    if not v_produto_auditado then
      raise exception 'Produto não auditado não pode ser usado em uma entrada de estoque.';
    end if;

    v_item_custo_total := v_item.quantidade * v_item.custo_unitario;
    v_custo_total := v_custo_total + v_item_custo_total;

    insert into notas_entrada_itens (
      nota_entrada_id, produto_id, lote, data_fabricacao, validade,
      unidade_medida, quantidade, custo_unitario, custo_total
    ) values (
      v_nota_id, v_item.produto_id, v_item.lote, v_item.data_fabricacao, v_item.validade,
      v_item.unidade_medida, v_item.quantidade, v_item.custo_unitario, v_item_custo_total
    );

    v_unidades_adicionadas := case
      when v_item.unidade_medida = 'CX' then v_item.quantidade * coalesce(v_quantidade_caixa, 1)
      else v_item.quantidade
    end;

    update produtos set quantidade_estoque = quantidade_estoque + v_unidades_adicionadas
    where id = v_item.produto_id;
  end loop;

  update notas_entrada set custo_total = v_custo_total where id = v_nota_id;

  return v_nota_id;
end;
$$;
