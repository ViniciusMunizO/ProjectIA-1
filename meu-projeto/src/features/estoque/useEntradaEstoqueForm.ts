import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { notaEntradaSchema } from '../../../../shared/src/schemas/entrada-estoque.schemas';
import type { Fornecedor } from '../../../../shared/src/types/fornecedor.types';
import type { NotaEntrada } from '../../../../shared/src/types/entrada-estoque.types';
import type { Produto } from '../../../../shared/src/types/produto.types';
import { ApiRequestError } from '../../lib/api-client';
import { createEntradaEstoque } from '../../lib/estoque-api';
import { listFornecedores } from '../../lib/fornecedores-api';
import { listProdutos } from '../../lib/produtos-api';
import {
  emptyItemComposer,
  type DraftItem,
  type ItemComposerErrors,
  type ItemComposerState,
} from './entrada-form-state';

type UseEntradaEstoqueFormOptions = {
  readonly onSuccess: (nota: NotaEntrada) => void;
};

let nextLocalId = 1;

export const useEntradaEstoqueForm = ({ onSuccess }: UseEntradaEstoqueFormOptions) => {
  const [produtos, setProdutos] = useState<readonly Produto[]>([]);
  const [fornecedores, setFornecedores] = useState<readonly Fornecedor[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [fornecedorId, setFornecedorId] = useState('');
  const [isAddingFornecedor, setIsAddingFornecedor] = useState(false);

  const [composer, setComposer] = useState<ItemComposerState>(emptyItemComposer);
  const [composerErrors, setComposerErrors] = useState<ItemComposerErrors>({});
  const [itens, setItens] = useState<readonly DraftItem[]>([]);

  const [valorFrete, setValorFrete] = useState('');
  const [desconto, setDesconto] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOptions = async (): Promise<void> => {
    setIsLoadingOptions(true);
    setOptionsError(null);
    try {
      const [produtosResponse, fornecedoresResponse] = await Promise.all([listProdutos(), listFornecedores()]);
      setProdutos(produtosResponse.produtos);
      setFornecedores(fornecedoresResponse.fornecedores);
    } catch (err) {
      setOptionsError(
        err instanceof ApiRequestError ? err.message : 'Não foi possível carregar produtos e fornecedores',
      );
    } finally {
      setIsLoadingOptions(false);
    }
  };

  useEffect(() => {
    void loadOptions();
  }, []);

  // Fase 3.1: a produto not marked auditado must never be selectable in a
  // stock entry. The server re-checks this independently — this filter is
  // only what makes the search box show the right options.
  const produtosAuditados = useMemo(() => produtos.filter((produto) => produto.auditado), [produtos]);

  const setComposerField = <K extends keyof ItemComposerState>(key: K, value: ItemComposerState[K]): void =>
    setComposer((current) => ({ ...current, [key]: value }));

  const handleCodigoProdutoChange = (value: string): void => {
    setComposerErrors((current) => ({ ...current, codigoProduto: undefined }));

    if (!value.trim()) {
      setComposer((current) => ({ ...current, codigoProduto: value, produtoId: null, produtoNome: null, produtoMarca: null }));
      return;
    }

    const codigo = Number(value);
    const match = produtosAuditados.find((produto) => produto.codigo === codigo);

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

    const existsButNotAudited = produtos.some((produto) => produto.codigo === codigo);
    setComposer((current) => ({ ...current, codigoProduto: value, produtoId: null, produtoNome: null, produtoMarca: null }));
    if (codigo && existsButNotAudited) {
      setComposerErrors((current) => ({
        ...current,
        codigoProduto: 'Este produto precisa estar auditado para ser usado em uma entrada de estoque.',
      }));
    }
  };

  const custoTotalComposer = (Number(composer.quantidade) || 0) * (Number(composer.custoUnitario) || 0);

  const handleAddItem = (): void => {
    const errors: ItemComposerErrors = {};

    if (!composer.produtoId || !composer.produtoNome) {
      errors.codigoProduto = 'Busque um produto auditado pelo código';
    }
    if (!composer.lote.trim()) {
      errors.lote = 'Lote obrigatório';
    }
    if (!composer.validade) {
      errors.validade = 'Validade obrigatória';
    }
    const quantidade = Number(composer.quantidade);
    if (!quantidade || quantidade <= 0) {
      errors.quantidade = 'Deve ser maior que zero';
    }
    const custoUnitario = Number(composer.custoUnitario);
    if (composer.custoUnitario === '' || custoUnitario < 0 || Number.isNaN(custoUnitario)) {
      errors.custoUnitario = 'Custo unitário inválido';
    }

    if (Object.keys(errors).length > 0) {
      setComposerErrors(errors);
      return;
    }

    const produto = produtosAuditados.find((p) => p.id === composer.produtoId);
    if (!produto) {
      setComposerErrors({ codigoProduto: 'Busque um produto auditado pelo código' });
      return;
    }

    const draft: DraftItem = {
      localId: String(nextLocalId++),
      produtoId: produto.id,
      produtoCodigo: produto.codigo,
      produtoNome: produto.nome,
      produtoMarca: produto.marca,
      lote: composer.lote.trim(),
      dataFabricacao: composer.dataFabricacao,
      validade: composer.validade,
      unidadeMedida: composer.unidadeMedida,
      quantidade,
      custoUnitario,
      custoTotal: quantidade * custoUnitario,
    };

    setItens((current) => [...current, draft]);
    setComposer(emptyItemComposer);
    setComposerErrors({});
  };

  const handleRemoveItem = (localId: string): void => setItens((current) => current.filter((item) => item.localId !== localId));

  const custoTotalNota = useMemo(() => itens.reduce((sum, item) => sum + item.custoTotal, 0), [itens]);

  const handleFornecedorCreated = (fornecedor: Fornecedor): void => {
    setFornecedores((current) => [fornecedor, ...current]);
    setFornecedorId(fornecedor.id);
    setIsAddingFornecedor(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    setFormError(null);

    const parsed = notaEntradaSchema.safeParse({
      fornecedorId,
      valorFrete: valorFrete || 0,
      desconto: desconto || 0,
      itens: itens.map((item) => ({
        produtoId: item.produtoId,
        lote: item.lote,
        dataFabricacao: item.dataFabricacao || undefined,
        validade: item.validade,
        unidadeMedida: item.unidadeMedida,
        quantidade: item.quantidade,
        custoUnitario: item.custoUnitario,
      })),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? 'Dados inválidos');
      return;
    }

    setIsSubmitting(true);
    try {
      const { nota } = await createEntradaEstoque(parsed.data);
      onSuccess(nota);
      setItens([]);
      setValorFrete('');
      setDesconto('');
      setFornecedorId('');
    } catch (err) {
      setFormError(err instanceof ApiRequestError ? err.message : 'Não foi possível salvar a entrada de estoque');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isLoadingOptions,
    optionsError,
    fornecedores,
    fornecedorId,
    setFornecedorId,
    isAddingFornecedor,
    setIsAddingFornecedor,
    handleFornecedorCreated,
    composer,
    setComposerField,
    handleCodigoProdutoChange,
    composerErrors,
    custoTotalComposer,
    handleAddItem,
    itens,
    handleRemoveItem,
    custoTotalNota,
    valorFrete,
    setValorFrete,
    desconto,
    setDesconto,
    formError,
    isSubmitting,
    handleSubmit,
  };
};
