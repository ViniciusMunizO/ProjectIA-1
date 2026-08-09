-- Phase 6: Pedidos e Orçamentos — a sales document tied to a cliente, with
-- one or more produto lines priced off that produto's most recent entrada
-- de estoque cost plus a margin. tipo = 'PEDIDO' decrements stock on save
-- (atomically, in the same transaction); tipo = 'ORCAMENTO' never touches
-- stock.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

create sequence if not exists pedidos_codigo_seq start 10000;

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  codigo integer not null unique default nextval('pedidos_codigo_seq'),
  -- Free-form customer/internal reference — distinct from codigo, which is
  -- the system's own sequential identifier (section 5.1 of the spec lists
  -- both as separate fields).
  numero_pedido text,
  tipo text not null check (tipo in ('ORCAMENTO', 'PEDIDO')),
  cliente_id uuid not null references clientes(id),
  observacoes text,
  -- Sum of every item's preco_total, computed inside fn_create_pedido
  -- rather than trusted from the client.
  valor_total numeric(12, 2) not null default 0,
  data_emissao date not null default current_date,
  created_by uuid references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_by uuid references users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index if not exists idx_pedidos_cliente on pedidos(cliente_id);

create table if not exists pedidos_itens (
  id uuid primary key default gen_random_uuid(),
  pedido_id uuid not null references pedidos(id) on delete cascade,
  produto_id uuid not null references produtos(id),
  quantidade integer not null check (quantidade > 0),
  -- Snapshot of the produto's per-unit entrada cost at the moment this
  -- pedido was created (see fn_create_pedido) — never trusted from the
  -- client, since it directly determines the sale price.
  custo_unitario numeric(12, 2) not null check (custo_unitario >= 0),
  margem_percentual numeric(7, 2) not null check (margem_percentual >= 0),
  preco_unitario numeric(12, 2) not null check (preco_unitario >= 0),
  preco_total numeric(12, 2) not null check (preco_total >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_pedidos_itens_pedido on pedidos_itens(pedido_id);
create index if not exists idx_pedidos_itens_produto on pedidos_itens(produto_id);

alter table pedidos enable row level security;
alter table pedidos_itens enable row level security;

-- Creates a pedido/orçamento and every one of its itens in a single
-- transaction. p_itens is a jsonb array of {produto_id, quantidade,
-- margem_percentual} — the client never sends a cost or a price, only what
-- it's asking for; jsonb_to_recordset gives each field a fixed declared
-- type, so this is parameter binding, not string-built SQL.
create or replace function fn_create_pedido(
  p_tipo text,
  p_cliente_id uuid,
  p_numero_pedido text,
  p_observacoes text,
  p_created_by uuid,
  p_itens jsonb
) returns uuid
language plpgsql
as $$
declare
  v_pedido_id uuid;
  v_valor_total numeric := 0;
  v_item record;
  v_item_preco_unitario numeric;
  v_item_preco_total numeric;
  v_produto_auditado boolean;
  v_quantidade_estoque integer;
  v_quantidade_caixa integer;
  v_custo_unidade numeric;
  v_ultima_unidade_medida text;
  v_ultimo_custo numeric;
begin
  if jsonb_array_length(p_itens) = 0 then
    raise exception 'O pedido precisa ter ao menos um item.';
  end if;

  insert into pedidos (codigo, numero_pedido, tipo, cliente_id, observacoes, valor_total, created_by, updated_by)
  values (nextval('pedidos_codigo_seq'), p_numero_pedido, p_tipo, p_cliente_id, p_observacoes, 0, p_created_by, p_created_by)
  returning id into v_pedido_id;

  for v_item in
    select * from jsonb_to_recordset(p_itens) as x(
      produto_id uuid,
      quantidade integer,
      margem_percentual numeric
    )
  loop
    select auditado, quantidade_estoque, quantidade_caixa
      into v_produto_auditado, v_quantidade_estoque, v_quantidade_caixa
    from produtos where id = v_item.produto_id;

    if v_produto_auditado is null then
      raise exception 'Produto não encontrado.';
    end if;
    -- Belt-and-suspenders: the server already filters the search to
    -- auditado produtos and re-checks before calling this function, but the
    -- database is the actual enforcement boundary for the Fase 3.1 rule.
    if not v_produto_auditado then
      raise exception 'Produto não auditado não pode ser usado em um pedido/orçamento.';
    end if;

    -- Cost is always looked up here, never accepted from p_itens — it's
    -- the same "custo de entrada" figure shown on the Produtos page,
    -- derived from that produto's most recent notas_entrada_itens row.
    select item.custo_unitario, item.unidade_medida
      into v_ultimo_custo, v_ultima_unidade_medida
    from notas_entrada_itens item
    join notas_entrada nota on nota.id = item.nota_entrada_id
    where item.produto_id = v_item.produto_id
    order by nota.created_at desc
    limit 1;

    if v_ultimo_custo is null then
      raise exception 'Produto sem custo de entrada registrado — não é possível gerar pedido.';
    end if;

    v_custo_unidade := case
      when v_ultima_unidade_medida = 'CX' then v_ultimo_custo / coalesce(v_quantidade_caixa, 1)
      else v_ultimo_custo
    end;

    if p_tipo = 'PEDIDO' and coalesce(v_quantidade_estoque, 0) < v_item.quantidade then
      raise exception 'Estoque insuficiente para o produto solicitado.';
    end if;

    v_item_preco_unitario := v_custo_unidade * (1 + v_item.margem_percentual / 100);
    v_item_preco_total := v_item_preco_unitario * v_item.quantidade;
    v_valor_total := v_valor_total + v_item_preco_total;

    insert into pedidos_itens (
      pedido_id, produto_id, quantidade, custo_unitario, margem_percentual, preco_unitario, preco_total
    ) values (
      v_pedido_id, v_item.produto_id, v_item.quantidade, v_custo_unidade, v_item.margem_percentual,
      v_item_preco_unitario, v_item_preco_total
    );

    if p_tipo = 'PEDIDO' then
      update produtos set quantidade_estoque = quantidade_estoque - v_item.quantidade
      where id = v_item.produto_id;
    end if;
  end loop;

  update pedidos set valor_total = v_valor_total where id = v_pedido_id;

  return v_pedido_id;
end;
$$;
