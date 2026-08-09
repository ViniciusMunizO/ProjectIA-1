import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { pedidoSchema } from '../../../../shared/src/schemas/pedido.schemas';
import type { Cliente } from '../../../../shared/src/types/cliente.types';
import type { Pedido, TipoPedido } from '../../../../shared/src/types/pedido.types';
import type { Produto } from '../../../../shared/src/types/produto.types';
import { ApiRequestError } from '../../lib/api-client';
import { listClientes } from '../../lib/clientes-api';
import { createPedido } from '../../lib/pedidos-api';
import { listProdutos } from '../../lib/produtos-api';
import { useEntradasEstoqueList } from '../estoque/useEntradasEstoqueList';
import { computeCustosPorProduto } from '../produtos/produto-custos';
import { emptyItemComposer, type DraftItem, type ItemComposerErrors, type ItemComposerState } from './pedido-form-state';

type UsePedidoFormOptions = {
  readonly onSuccess: (pedido: Pedido) => void;
};

let nextLocalId = 1;

export const usePedidoForm = ({ onSuccess }: UsePedidoFormOptions) => {
  const [produtos, setProdutos] = useState<readonly Produto[]>([]);
  const [clientes, setClientes] = useState<readonly Cliente[]>([]);
  const { entradas } = useEntradasEstoqueList();
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [tipo, setTipo] = useState<TipoPedido>('ORCAMENTO');
  const [clienteId, setClienteId] = useState('');
  const [numeroPedido, setNumeroPedido] = useState('');
  const [observacoes, setObservacoes] = useState('');
  const [margemPadrao, setMargemPadrao] = useState('0');

  const [composer, setComposer] = useState<ItemComposerState>(() => emptyItemComposer('0'));
  const [composerErrors, setComposerErrors] = useState<ItemComposerErrors>({});
  const [itens, setItens] = useState<readonly DraftItem[]>([]);

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = async (): Promise<void> => {
    setIsLoadingOptions(true);
    setOptionsError(null);
    try {
      const [produtosResponse, clientesResponse] = await Promise.all([listProdutos(), listClientes()]);
      setProdutos(produtosResponse.produtos);
      setClientes(clientesResponse.clientes);
    } catch (err) {
      setOptionsError(err instanceof ApiRequestError ? err.message : 'Não foi possível carregar produtos e clientes');
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    void loadOptions();
  }, []);

  const custosPorProduto = useMemo(() => {
    const quantidadeCaixaPorProduto = new Map(produtos.map((produto) => [produto.id, produto.quantidadeCaixa]));
    return computeCustosPorProduto(entradas, quantidadeCaixaPorProduto);
  }, [produtos, entradas]);

  // Fase 6 (5.4): a Pedido only ever offers auditado produtos that have
  // stock; an Orçamento offers every auditado produto regardless of stock.
  const produtosDisponiveis = useMemo(
    () =>
      produtos.filter((produto) => produto.auditado && (tipo === 'ORCAMENTO' || produto.quantidadeEstoque > 0)),
    [produtos, tipo],
  );

  const setComposerField = <K extends keyof ItemComposerState>(key: K, value: ItemComposerState[K]): void =>
    setComposer((current) => ({ ...current, [key]: value }));

  const handleCodigoProdutoChange = (value: string): void => {
    setComposerErrors((current) => ({ ...current, codigoProduto: undefined }));

    if (!value.trim()) {
      setComposer((current) => ({ ...current, codigoProduto: value, produtoId: null, produtoNome: null, produtoMarca: null }));
      return;
    }

    const codigo = Number(value);
    const match = produtosDisponiveis.find((produto) => produto.codigo === codigo);

    if (match) {
      setComposer((current) => ({
        ...current,
        codigoProduto: value,
        produtoId: match.id,
        produtoNome: match.nome,
        produtoMarca: match.marca,
      }));
      return;
    }

    setComposer((current) => ({ ...current, codigoProduto: value, produtoId: null, produtoNome: null, produtoMarca: null }));
    if (!codigo) {
      return;
    }

    const produtoExistente = produtos.find((produto) => produto.codigo === codigo);
    if (!produtoExistente) {
      return;
    }
    if (!produtoExistente.auditado) {
      setComposerErrors((current) => ({
        ...current,
        codigoProduto: 'Este produto precisa estar auditado para ser usado em um pedido.',
      }));
    } else if (tipo === 'PEDIDO') {
      setComposerErrors((current) => ({ ...current, codigoProduto: 'Este produto está sem estoque disponível.' }));
    }
  };

  const produtoSelecionado = composer.produtoId
    ? (produtosDisponiveis.find((produto) => produto.id === composer.produtoId) ?? null)
    : null;

  // custoPreview is always expressed in whichever unidade the item is being
  // sold in — the same convention the RPC uses for the custo_unitario it
  // records, so what's previewed here matches what gets saved.
  const custoUnidade = composer.produtoId ? (custosPorProduto.get(composer.produtoId)?.custoUnidade ?? null) : null;
  const custoPreview =
    custoUnidade !== null && produtoSelecionado
      ? composer.unidadeMedida === 'CX'
        ? custoUnidade * produtoSelecionado.quantidadeCaixa
        : custoUnidade
      : null;
  const precoUnitarioPreview =
    custoPreview !== null ? custoPreview * (1 + (Number(composer.margemPercentual) || 0) / 100) : null;
  const precoTotalPreview =
    precoUnitarioPreview !== null ? precoUnitarioPreview * (Number(composer.quantidade) || 0) : null;

  const handleAddItem = (): void => {
    const errors: ItemComposerErrors = {};

    if (!composer.produtoId || !composer.produtoNome) {
      errors.codigoProduto = 'Busque um produto pelo código';
    } else if (custoPreview === null) {
      errors.codigoProduto = 'Produto sem custo de entrada registrado — não é possível usá-lo em um pedido.';
    }
    const quantidade = Number(composer.quantidade);
    if (!quantidade || quantidade <= 0) {
      errors.quantidade = 'Deve ser maior que zero';
    }
    const margemPercentual = Number(composer.margemPercentual);
    if (composer.margemPercentual === '' || margemPercentual < 0 || Number.isNaN(margemPercentual)) {
      errors.margemPercentual = 'Margem inválida';
    }

    if (Object.keys(errors).length > 0) {
      setComposerErrors(errors);
      return;
    }

    const produto = produtosDisponiveis.find((p) => p.id === composer.produtoId);
    if (!produto || custoPreview === null) {
      setComposerErrors({ codigoProduto: 'Busque um produto pelo código' });
      return;
    }

    const precoUnitario = custoPreview * (1 + margemPercentual / 100);
    const draft: DraftItem = {
      localId: String(nextLocalId++),
      produtoId: produto.id,
      produtoCodigo: produto.codigo,
      produtoNome: produto.nome,
      produtoMarca: produto.marca,
      quantidade,
      unidadeMedida: composer.unidadeMedida,
      margemPercentual,
      custoUnitario: custoPreview,
      precoUnitario,
      precoTotal: precoUnitario * quantidade,
    };

    setItens((current) => [...current, draft]);
    setComposer(emptyItemComposer(margemPadrao));
    setComposerErrors({});
  };

  const handleRemoveItem = (localId: string): void => setItens((current) => current.filter((item) => item.localId !== localId));

  const valorTotal = useMemo(() => itens.reduce((sum, item) => sum + item.precoTotal, 0), [itens]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = pedidoSchema.safeParse({
      tipo,
      clienteId,
      numeroPedido: numeroPedido || undefined,
      observacoes: observacoes || undefined,
      itens: itens.map((item) => ({
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        unidadeMedida: item.unidadeMedida,
        margemPercentual: item.margemPercentual,
      })),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setIsSubmitting(true);
    try {
      const { pedido } = await createPedido(parsed.data);
      onSuccess(pedido);
      setItens([]);
      setClienteId('');
      setNumeroPedido('');
      setObservacoes('');
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar o pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoadingOptions,
    optionsError,
    clientes,
    tipo,
    setTipo,
    clienteId,
    setClienteId,
    numeroPedido,
    setNumeroPedido,
    observacoes,
    setObservacoes,
    margemPadrao,
    setMargemPadrao,
    composer,
    setComposerField,
    handleCodigoProdutoChange,
    composerErrors,
    custoPreview,
    precoUnitarioPreview,
    precoTotalPreview,
    handleAddItem,
    itens,
    handleRemoveItem,
    valorTotal,
    formError,
    isSubmitting,
    handleSubmit,
  };
};
