/**
 * Procurement Module Types
 * Types for Purchase Orders, Goods Receipts, and receiving workflows.
 */

export type PurchaseOrderStatus = 'draft' | 'sent' | 'partially_received' | 'received' | 'closed';

export interface PurchaseOrderItem {
  medicineId: string;
  medicineName: string;
  requestedQty: number;
  receivedQty: number;
  pendingQty: number;
  strength?: string;
  unit?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  items: PurchaseOrderItem[];
  status: PurchaseOrderStatus;
  priority?: 'normal' | 'urgent';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface GoodsReceiptItem {
  medicineId: string;
  medicineName: string;
  receivedQty: number;
  batchNumber: string;
  expiryDate: string;
  hsnCode?: string;
  strength?: string;
  unit?: string;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  poId: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  warehouseId: string;
  items: GoodsReceiptItem[];
  invoiceNumber?: string;
  invoiceAmount?: number;
  invoiceDocUrl?: string;
  receivedBy: string;
  receivedDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}
