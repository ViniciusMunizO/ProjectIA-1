-- Adds unidade_medida (CX/UN) to pedidos_itens, mirroring the same choice
-- already available on Entrada de Estoque, and updates fn_create_pedido to
-- convert to units when decrementing produtos.quantidade_estoque and to
-- price on whichever unit the item is actually sold in.
--
-- Run this once in the Supabase project's SQL Editor (Database > SQL Editor).
-- Safe to re-run: every statement is idempotent.

alter table pedidos_itens add column if not exists unidade_medida text not null default 'UN'
  check (unidade_medida in ('CX', 'UN'));

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
  v_custo_base numeric;
  v_unidades_removidas integer;
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
      margem_percentual numeric,
      unidade_medida text
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
    -- derived from that produto's most recent notas_entrada_itens row, and
    -- always normalized to a per-unit figure first.
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

    -- Re-expressed in whichever unit this pedido item is actually being
    -- sold in, so the margin and the recorded custo_unitario line up with
    -- quantidade and preco_unitario.
    v_custo_base := case
      when v_item.unidade_medida = 'CX' then v_custo_unidade * coalesce(v_quantidade_caixa, 1)
      else v_custo_unidade
    end;

    v_unidades_removidas := case
      when v_item.unidade_medida = 'CX' then v_item.quantidade * coalesce(v_quantidade_caixa, 1)
      else v_item.quantidade
    end;

    if p_tipo = 'PEDIDO' and coalesce(v_quantidade_estoque, 0) < v_unidades_removidas then
      raise exception 'Estoque insuficiente para o produto solicitado.';
    end if;

    v_item_preco_unitario := v_custo_base * (1 + v_item.margem_percentual / 100);
    v_item_preco_total := v_item_preco_unitario * v_item.quantidade;
    v_valor_total := v_valor_total + v_item_preco_total;

    insert into pedidos_itens (
      pedido_id, produto_id, quantidade, unidade_medida, custo_unitario, margem_percentual, preco_unitario, preco_total
    ) values (
      v_pedido_id, v_item.produto_id, v_item.quantidade, v_item.unidade_medida, v_custo_base, v_item.margem_percentual,
      v_item_preco_unitario, v_item_preco_total
    );

    if p_tipo = 'PEDIDO' then
      update produtos set quantidade_estoque = quantidade_estoque - v_unidades_removidas
      where id = v_item.produto_id;
    end if;
  end loop;

  update pedidos set valor_total = v_valor_total where id = v_pedido_id;

  return v_pedido_id;
end;
$$;
