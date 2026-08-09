import { jsPDF } from 'jspdf';
import { formatCnpj } from '../../../shared/src/validators/cnpj';
import { formatCpf } from '../../../shared/src/validators/cpf';
import type { Pedido } from '../../../shared/src/types/pedido.types';

// Section 5.7 of the spec: the PDF header carries VMO's own name/address,
// not the logged-in user's — kept as a single constant so it only needs
// updating in one place if the company's registered address ever changes.
const COMPANY_NAME = 'VMO Distribuidora';
const COMPANY_ADDRESS = 'Rua Azul Marinho, 5855 — Bairro Suzane, Maringá/PR';

const formatMoney = (value: number): string => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const formatDate = (iso: string): string => new Date(`${iso}T00:00:00`).toLocaleDateString('pt-BR');

const formatDocumento = (documento: string, tipo: 'CPF' | 'CNPJ'): string =>
  tipo === 'CNPJ' ? formatCnpj(documento) : formatCpf(documento);

const loadLogoDataUrl = async (): Promise<string | null> => {
  try {
    const response = await fetch('/logo.png');
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export const generatePedidoPdf = async (pedido: Pedido): Promise<void> => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  let y = 48;

  const logoDataUrl = await loadLogoDataUrl();
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, 'PNG', marginX, y, 48, 48);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(COMPANY_NAME, marginX + 58, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(COMPANY_ADDRESS, marginX + 58, y + 32);

  y += 70;
  doc.setDrawColor(200);
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 24;

  const titulo = pedido.tipo === 'PEDIDO' ? 'PEDIDO' : 'ORÇAMENTO';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${titulo} #${pedido.codigo}`, marginX, y);
  y += 22;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Data de emissão: ${formatDate(pedido.dataEmissao)}`, marginX, y);
  if (pedido.numeroPedido) {
    doc.text(`Número do pedido: ${pedido.numeroPedido}`, pageWidth - marginX, y, { align: 'right' });
  }
  y += 16;
  doc.text(`Emitido por: ${pedido.createdByNome ?? '—'}`, marginX, y);
  y += 24;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('Cliente', marginX, y);
  y += 16;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(pedido.clienteNome, marginX, y);
  y += 14;
  doc.text(`${pedido.clienteTipoDocumento}: ${formatDocumento(pedido.clienteDocumento, pedido.clienteTipoDocumento)}`, marginX, y);
  if (pedido.clienteEndereco) {
    y += 14;
    doc.text(pedido.clienteEndereco, marginX, y);
  }
  y += 28;

  const columns = [
    { label: 'Produto', x: marginX, width: 210 },
    { label: 'Qtd.', x: marginX + 220, width: 40 },
    { label: 'Un.', x: marginX + 270, width: 40 },
    { label: 'Preço unit.', x: marginX + 330, width: 80 },
    { label: 'Total', x: marginX + 420, width: 80 },
  ];

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  for (const column of columns) {
    doc.text(column.label, column.x, y);
  }
  y += 6;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 14;

  doc.setFont('helvetica', 'normal');
  for (const item of pedido.itens) {
    if (y > 760) {
      doc.addPage();
      y = 48;
    }
    doc.text(`${item.produtoCodigo} · ${item.produtoNome}`, columns[0]!.x, y, { maxWidth: columns[0]!.width });
    doc.text(String(item.quantidade), columns[1]!.x, y);
    doc.text(item.unidadeMedida, columns[2]!.x, y);
    doc.text(formatMoney(item.precoUnitario), columns[3]!.x, y);
    doc.text(formatMoney(item.precoTotal), columns[4]!.x, y);
    y += 18;
  }

  y += 6;
  doc.line(marginX, y, pageWidth - marginX, y);
  y += 20;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`Valor total: ${formatMoney(pedido.valorTotal)}`, pageWidth - marginX, y, { align: 'right' });
  y += 28;

  if (pedido.observacoes) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Observações', marginX, y);
    y += 14;
    doc.setFont('helvetica', 'normal');
    const lines = doc.splitTextToSize(pedido.observacoes, pageWidth - marginX * 2);
    doc.text(lines, marginX, y);
  }

  doc.save(`${titulo.toLowerCase()}-${pedido.codigo}.pdf`);
};
