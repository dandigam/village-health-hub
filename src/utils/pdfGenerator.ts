/**
 * Simple PDF Generator for Purchase Orders, Goods Receipts, and Invoices.
 * Clean, minimal design — no hard colors.
 */
import jsPDF from 'jspdf';
import { format } from 'date-fns';

interface WarehouseInfo {
  name?: string;
  email?: string;
  phoneNumber?: string;
  authorizedPerson?: string;
  licenceNumber?: string;
  state?: string;
  district?: string;
  mandal?: string;
  village?: string;
  pinCode?: string;
}

interface SupplierInfo {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  gstNo?: string;
}

interface PDFTableRow {
  sno: number;
  name: string;
  type?: string;
  qty: number;
  batch?: string;
  expiry?: string;
  unit?: string;
  hsnCode?: string;
}

interface PDFOptions {
  title: string;
  docNumber: string;
  date: string;
  warehouse?: WarehouseInfo;
  supplier?: SupplierInfo;
  rows: PDFTableRow[];
  columns: { key: string; label: string; align?: 'left' | 'center' | 'right'; width?: number }[];
  meta?: { label: string; value: string }[];
  footer?: string[];
  fileName: string;
}

// Muted color palette
const COLORS = {
  dark: [40, 40, 40] as [number, number, number],
  mid: [100, 100, 100] as [number, number, number],
  light: [150, 150, 150] as [number, number, number],
  border: [200, 200, 200] as [number, number, number],
  headerBg: [245, 245, 245] as [number, number, number],
  altRow: [250, 250, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  titleBg: [55, 65, 81] as [number, number, number],
};

export function generatePDF(options: PDFOptions) {
  const { title, docNumber, date, warehouse, supplier, rows, columns, meta, footer, fileName } = options;
  const doc = new jsPDF({ orientation: 'portrait' });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentW = pageW - margin * 2;

  let y = margin;

  // ─── HEADER BAR ───
  doc.setFillColor(...COLORS.titleBg);
  doc.rect(0, 0, pageW, 28, 'F');

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.white);
  doc.text(title, margin, 18);

  // Doc number on right
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(docNumber, pageW - margin, 12, { align: 'right' });
  doc.setFontSize(9);
  doc.text(`Date: ${date}`, pageW - margin, 20, { align: 'right' });

  y = 36;

  // ─── WAREHOUSE & SUPPLIER INFO ───
  if (warehouse || supplier) {
    const halfW = contentW / 2 - 4;

    // Warehouse (left)
    if (warehouse) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.mid);
      doc.text('FROM:', margin, y);
      y += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text(warehouse.name || 'Warehouse', margin, y);
      y += 4.5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.mid);

      const addressParts = [warehouse.village, warehouse.mandal, warehouse.district, warehouse.state, warehouse.pinCode].filter(Boolean);
      if (addressParts.length) {
        const addressText = addressParts.join(', ');
        const lines = doc.splitTextToSize(addressText, halfW);
        doc.text(lines, margin, y);
        y += lines.length * 3.5;
      }
      if (warehouse.phoneNumber) { doc.text(`Ph: ${warehouse.phoneNumber}`, margin, y); y += 3.5; }
      if (warehouse.email) { doc.text(`Email: ${warehouse.email}`, margin, y); y += 3.5; }
      if (warehouse.licenceNumber) { doc.text(`Licence: ${warehouse.licenceNumber}`, margin, y); y += 3.5; }
    }

    // Supplier (right)
    if (supplier) {
      let sy = 36;
      const sx = margin + halfW + 8;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.mid);
      doc.text('TO:', sx, sy);
      sy += 5;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.dark);
      doc.text(supplier.name, sx, sy);
      sy += 4.5;

      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.mid);

      if (supplier.address) {
        const lines = doc.splitTextToSize(supplier.address, halfW);
        doc.text(lines, sx, sy);
        sy += lines.length * 3.5;
      }
      if (supplier.phone) { doc.text(`Ph: ${supplier.phone}`, sx, sy); sy += 3.5; }
      if (supplier.email) { doc.text(`Email: ${supplier.email}`, sx, sy); sy += 3.5; }
      if (supplier.gstNo) { doc.text(`GST: ${supplier.gstNo}`, sx, sy); sy += 3.5; }

      y = Math.max(y, sy);
    }

    y += 4;

    // Separator
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.4);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  // ─── META INFO (optional key-value pairs) ───
  if (meta && meta.length > 0) {
    const colCount = Math.min(meta.length, 4);
    const colW = contentW / colCount;

    meta.forEach((m, i) => {
      const mx = margin + (i % colCount) * colW;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...COLORS.light);
      doc.text(m.label.toUpperCase(), mx, y);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...COLORS.dark);
      doc.text(m.value, mx, y + 4.5);
    });

    y += 12;

    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 6;
  }

  // ─── TABLE ───
  // Calculate column widths
  const totalDefinedWidth = columns.reduce((s, c) => s + (c.width || 0), 0);
  const flexCols = columns.filter(c => !c.width);
  const remainingW = contentW - totalDefinedWidth;
  const flexW = flexCols.length > 0 ? remainingW / flexCols.length : 0;
  const colWidths = columns.map(c => c.width || flexW);

  // Header
  doc.setFillColor(...COLORS.headerBg);
  doc.rect(margin, y - 4, contentW, 8, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...COLORS.mid);

  let cx = margin + 2;
  columns.forEach((col, i) => {
    const align = col.align || 'left';
    const tx = align === 'right' ? cx + colWidths[i] - 4 : align === 'center' ? cx + colWidths[i] / 2 : cx;
    doc.text(col.label.toUpperCase(), tx, y, { align });
    cx += colWidths[i];
  });
  y += 7;

  // Border under header
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 3, pageW - margin, y - 3);

  // Rows
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  let pageNum = 1;

  rows.forEach((row, idx) => {
    if (y > pageH - 30) {
      addPageFooter(doc, pageW, pageH, margin, warehouse, pageNum);
      doc.addPage();
      pageNum++;
      y = margin + 10;
    }

    // Alternate row background
    if (idx % 2 === 0) {
      doc.setFillColor(...COLORS.altRow);
      doc.rect(margin, y - 4, contentW, 7, 'F');
    }

    cx = margin + 2;
    doc.setTextColor(...COLORS.dark);

    columns.forEach((col, i) => {
      const align = col.align || 'left';
      const tx = align === 'right' ? cx + colWidths[i] - 4 : align === 'center' ? cx + colWidths[i] / 2 : cx;
      const val = String((row as any)[col.key] ?? '—');
      doc.text(val, tx, y, { align });
      cx += colWidths[i];
    });

    y += 7;
  });

  // Bottom border
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, y - 3, pageW - margin, y - 3);
  y += 6;

  // ─── FOOTER NOTES ───
  if (footer && footer.length > 0) {
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...COLORS.mid);
    doc.text('Terms & Conditions:', margin, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...COLORS.light);

    footer.forEach((line) => {
      if (y > pageH - 20) {
        addPageFooter(doc, pageW, pageH, margin, warehouse, pageNum);
        doc.addPage();
        pageNum++;
        y = margin + 10;
      }
      doc.text(`• ${line}`, margin + 2, y);
      y += 3.5;
    });
  }

  // Add footer to all pages
  const totalPages = pageNum;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    addPageFooter(doc, pageW, pageH, margin, warehouse, p, totalPages);
  }

  doc.save(fileName);
}

function addPageFooter(
  doc: jsPDF, pageW: number, pageH: number, margin: number,
  warehouse?: WarehouseInfo, pageNum?: number, totalPages?: number
) {
  const footerY = pageH - 10;

  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 3, pageW - margin, footerY - 3);

  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...COLORS.light);

  const genDate = format(new Date(), 'dd MMM yyyy, hh:mm a');
  doc.text(`Generated: ${genDate}`, margin, footerY);

  if (warehouse?.name) {
    doc.text(warehouse.name, pageW / 2, footerY, { align: 'center' });
  }

  if (pageNum && totalPages) {
    doc.text(`Page ${pageNum} of ${totalPages}`, pageW - margin, footerY, { align: 'right' });
  }
}

// ─── CONVENIENCE GENERATORS ─────────────────────────────────

export function downloadPurchaseOrderPDF(order: any, warehouse?: WarehouseInfo) {
  const items = order.items || [];
  const rows: PDFTableRow[] = items.map((item: any, idx: number) => ({
    sno: idx + 1,
    name: `${item.medicineName}${item.strength ? ` ${item.strength}` : ''}`,
    type: item.medicineType || '—',
    qty: item.requestedQuantity || item.requestedQty || 0,
    received: item.receivedQuantity || item.receivedQty || 0,
    pending: (item.requestedQuantity || item.requestedQty || 0) - (item.receivedQuantity || item.receivedQty || 0),
  }));

  const totalReq = rows.reduce((s, r) => s + r.qty, 0);

  generatePDF({
    title: 'PURCHASE ORDER',
    docNumber: order.purchaseOrder || order.poNumber || `PO-${order.id}`,
    date: order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—',
    warehouse,
    supplier: {
      name: order.supplierName || '—',
      phone: order.supplierPhone,
      email: order.supplierEmail,
    },
    meta: [
      { label: 'Status', value: (order.status || '').replace(/_/g, ' ') },
      { label: 'Priority', value: order.isPriority ? 'Urgent' : 'Normal' },
      { label: 'Total Items', value: String(items.length) },
      { label: 'Total Qty', value: String(totalReq) },
    ],
    columns: [
      { key: 'sno', label: 'S.No', width: 14, align: 'center' },
      { key: 'name', label: 'Medicine Name' },
      { key: 'type', label: 'Type', width: 28 },
      { key: 'qty', label: 'Requested', width: 24, align: 'center' },
      { key: 'received', label: 'Received', width: 24, align: 'center' },
      { key: 'pending', label: 'Pending', width: 22, align: 'center' },
    ],
    rows,
    footer: [
      'Goods should be delivered within the agreed timeline.',
      'All items must meet quality and packaging standards.',
      'Partial deliveries are accepted and tracked separately.',
      'This document is system-generated.',
    ],
    fileName: `${order.purchaseOrder || order.poNumber || `PO-${order.id}`}.pdf`,
  });
}

export function downloadGoodsReceiptPDF(receipt: any, warehouse?: WarehouseInfo) {
  const items = receipt.items || [];
  const rows = items.map((item: any, idx: number) => ({
    sno: idx + 1,
    name: `${item.medicineName}${item.strength && item.unit ? ` ${item.strength}${item.unit}` : ''}`,
    qty: item.receivedQty || 0,
    batch: item.batchNumber || '—',
    expiry: item.expiryDate ? format(new Date(item.expiryDate), 'dd MMM yyyy') : '—',
    hsnCode: item.hsnCode || '—',
  }));

  generatePDF({
    title: 'GOODS RECEIPT NOTE',
    docNumber: receipt.receiptNumber || `GRN-${receipt.id}`,
    date: receipt.receivedDate ? format(new Date(receipt.receivedDate), 'dd MMM yyyy') : '—',
    warehouse,
    supplier: {
      name: receipt.supplierName || '—',
    },
    meta: [
      { label: 'PO Number', value: receipt.poNumber || '—' },
      { label: 'Invoice No', value: receipt.invoiceNumber || '—' },
      { label: 'Invoice Amount', value: receipt.invoiceAmount ? `₹${receipt.invoiceAmount.toLocaleString()}` : '—' },
      { label: 'Received By', value: receipt.receivedBy || '—' },
    ],
    columns: [
      { key: 'sno', label: 'S.No', width: 14, align: 'center' },
      { key: 'name', label: 'Medicine Name' },
      { key: 'qty', label: 'Qty', width: 18, align: 'center' },
      { key: 'batch', label: 'Batch No', width: 30 },
      { key: 'expiry', label: 'Expiry', width: 28 },
      { key: 'hsnCode', label: 'HSN', width: 22 },
    ],
    rows,
    footer: [
      'Quantities verified against purchase order at time of receipt.',
      'Batch numbers and expiry dates recorded as provided by supplier.',
      'This document is system-generated.',
    ],
    fileName: `${receipt.receiptNumber || `GRN-${receipt.id}`}.pdf`,
  });
}

export function downloadInvoicePDF(invoice: any, warehouse?: WarehouseInfo, supplierInfo?: any) {
  const items = invoice.items || [];
  const rows = items.map((item: any, idx: number) => ({
    sno: idx + 1,
    name: item.medicineName || '—',
    type: item.medicineType || '—',
    batch: item.batchNo || '—',
    expiry: item.expDate ? format(new Date(item.expDate), 'dd MMM yyyy') : '—',
    qty: item.quantity || 0,
  }));

  const totalQty = rows.reduce((s: any, r: any) => s + r.qty, 0);

  generatePDF({
    title: 'STOCK ENTRY / INVOICE',
    docNumber: invoice.invoiceNumber || `INV-${invoice.id}`,
    date: invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : '—',
    warehouse,
    supplier: {
      name: invoice.supplierName || supplierInfo?.name || '—',
      address: supplierInfo?.address,
      phone: supplierInfo?.phone || supplierInfo?.phoneNumber,
      email: supplierInfo?.email,
    },
    meta: [
      { label: 'Amount', value: invoice.invoiceAmount ? `₹${Number(invoice.invoiceAmount).toLocaleString()}` : '—' },
      { label: 'Payment Mode', value: invoice.paymentMode || '—' },
      { label: 'Total Items', value: String(items.length) },
      { label: 'Total Qty', value: String(totalQty) },
    ],
    columns: [
      { key: 'sno', label: 'S.No', width: 14, align: 'center' },
      { key: 'name', label: 'Medicine Name' },
      { key: 'type', label: 'Type', width: 26 },
      { key: 'batch', label: 'Batch No', width: 30 },
      { key: 'expiry', label: 'Expiry', width: 28 },
      { key: 'qty', label: 'Qty', width: 18, align: 'center' },
    ],
    rows,
    footer: [
      'Stock entry recorded and verified against supplier invoice.',
      'All batch numbers and expiry dates as per supplier documentation.',
      'This document is system-generated.',
    ],
    fileName: `${invoice.invoiceNumber || `Invoice-${invoice.id}`}.pdf`,
  });
}
