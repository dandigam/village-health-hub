import type { PurchaseOrder, GoodsReceipt } from '@/types/procurement';

export const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: '1', poNumber: 'PO-2026-001', supplierId: '1', supplierName: 'MedPlus Distributors',
    warehouseId: '1', status: 'received', priority: 'normal', createdBy: 'Venkatesh D',
    items: [
      { medicineId: '1', medicineName: 'Paracetamol 500mg', requestedQty: 200, receivedQty: 200, pendingQty: 0, strength: '500', unit: 'mg' },
      { medicineId: '7', medicineName: 'Cetirizine 10mg', requestedQty: 500, receivedQty: 500, pendingQty: 0, strength: '10', unit: 'mg' },
    ],
    createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-12T00:00:00Z',
  },
  {
    id: '2', poNumber: 'PO-2026-002', supplierId: '2', supplierName: 'HealthCare Supplies',
    warehouseId: '1', status: 'sent', priority: 'urgent', createdBy: 'Venkatesh D',
    items: [
      { medicineId: '3', medicineName: 'Metformin 500mg', requestedQty: 100, receivedQty: 0, pendingQty: 100, strength: '500', unit: 'mg' },
      { medicineId: '8', medicineName: 'Omeprazole 20mg', requestedQty: 150, receivedQty: 0, pendingQty: 150, strength: '20', unit: 'mg' },
    ],
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-02-01T00:00:00Z',
  },
  {
    id: '3', poNumber: 'PO-2026-003', supplierId: '3', supplierName: 'PharmaChem India',
    warehouseId: '2', status: 'partially_received', priority: 'normal', createdBy: 'Suresh K',
    items: [
      { medicineId: '5', medicineName: 'Amoxicillin 250mg', requestedQty: 80, receivedQty: 50, pendingQty: 30, strength: '250', unit: 'mg' },
      { medicineId: '9', medicineName: 'Ranitidine 150mg', requestedQty: 200, receivedQty: 100, pendingQty: 100, strength: '150', unit: 'mg' },
    ],
    createdAt: '2026-02-10T00:00:00Z', updatedAt: '2026-02-15T00:00:00Z',
  },
  {
    id: '4', poNumber: 'PO-2026-004', supplierId: '1', supplierName: 'MedPlus Distributors',
    warehouseId: '1', status: 'draft', priority: 'normal', createdBy: 'Venkatesh D',
    items: [
      { medicineId: '2', medicineName: 'Ibuprofen 400mg', requestedQty: 300, receivedQty: 0, pendingQty: 300, strength: '400', unit: 'mg' },
    ],
    createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
  },
  {
    id: '5', poNumber: 'PO-2026-005', supplierId: '2', supplierName: 'HealthCare Supplies',
    warehouseId: '1', status: 'closed', priority: 'normal', createdBy: 'Venkatesh D',
    items: [
      { medicineId: '4', medicineName: 'Amlodipine 5mg', requestedQty: 150, receivedQty: 150, pendingQty: 0, strength: '5', unit: 'mg' },
      { medicineId: '6', medicineName: 'Atorvastatin 10mg', requestedQty: 100, receivedQty: 100, pendingQty: 0, strength: '10', unit: 'mg' },
    ],
    createdAt: '2025-12-15T00:00:00Z', updatedAt: '2026-01-05T00:00:00Z',
  },
];

export const mockGoodsReceipts: GoodsReceipt[] = [
  {
    id: '1', receiptNumber: 'GRN-2026-001', poId: '1', poNumber: 'PO-2026-001',
    supplierId: '1', supplierName: 'MedPlus Distributors', warehouseId: '1',
    items: [
      { medicineId: '1', medicineName: 'Paracetamol 500mg', receivedQty: 200, batchNumber: 'BAT-P500-001', expiryDate: '2027-06-30', strength: '500', unit: 'mg' },
      { medicineId: '7', medicineName: 'Cetirizine 10mg', receivedQty: 500, batchNumber: 'BAT-C10-001', expiryDate: '2027-09-15', strength: '10', unit: 'mg' },
    ],
    invoiceNumber: 'INV-MP-2026-0042', invoiceAmount: 24500,
    receivedBy: 'Venkatesh D', receivedDate: '2026-01-12T10:30:00Z',
    createdAt: '2026-01-12T10:30:00Z', updatedAt: '2026-01-12T10:30:00Z',
  },
  {
    id: '2', receiptNumber: 'GRN-2026-002', poId: '3', poNumber: 'PO-2026-003',
    supplierId: '3', supplierName: 'PharmaChem India', warehouseId: '2',
    items: [
      { medicineId: '5', medicineName: 'Amoxicillin 250mg', receivedQty: 50, batchNumber: 'BAT-A250-003', expiryDate: '2027-03-20', strength: '250', unit: 'mg' },
      { medicineId: '9', medicineName: 'Ranitidine 150mg', receivedQty: 100, batchNumber: 'BAT-R150-002', expiryDate: '2027-07-10', strength: '150', unit: 'mg' },
    ],
    invoiceNumber: 'INV-PC-2026-0108', invoiceAmount: 18200,
    receivedBy: 'Suresh K', receivedDate: '2026-02-15T14:00:00Z',
    createdAt: '2026-02-15T14:00:00Z', updatedAt: '2026-02-15T14:00:00Z',
  },
  {
    id: '3', receiptNumber: 'GRN-2026-003', poId: '5', poNumber: 'PO-2026-005',
    supplierId: '2', supplierName: 'HealthCare Supplies', warehouseId: '1',
    items: [
      { medicineId: '4', medicineName: 'Amlodipine 5mg', receivedQty: 150, batchNumber: 'BAT-AM5-001', expiryDate: '2027-12-31', strength: '5', unit: 'mg' },
      { medicineId: '6', medicineName: 'Atorvastatin 10mg', receivedQty: 100, batchNumber: 'BAT-AT10-001', expiryDate: '2027-11-15', strength: '10', unit: 'mg' },
    ],
    invoiceNumber: 'INV-HC-2025-0987', invoiceAmount: 32100,
    receivedBy: 'Venkatesh D', receivedDate: '2026-01-05T09:00:00Z',
    createdAt: '2026-01-05T09:00:00Z', updatedAt: '2026-01-05T09:00:00Z',
  },
];
