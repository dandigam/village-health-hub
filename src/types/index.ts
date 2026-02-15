// ============================================================
// Domain Types — Backend-Ready, Spring Boot + MongoDB Compatible
// ============================================================
// Every entity includes: id, status (enum), createdAt, updatedAt
// Related fields grouped into nested objects where logical.
// All types are compatible with JSON serialization for REST APIs.
// ============================================================

// ── Base Entity ──────────────────────────────────────────────
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// ── User & Auth ──────────────────────────────────────────────
export type UserRole = 'super_admin' | 'camp_admin' | 'doctor' | 'pharmacy' | 'staff';

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status: 'active' | 'inactive';
}

// ── Camp ─────────────────────────────────────────────────────
export type CampStatus = 'draft' | 'active' | 'closed';

export interface Camp extends BaseEntity {
  name: string;
  location: string;
  village: string;
  district: string;
  startDate: string;
  endDate: string;
  status: CampStatus;
  description?: string;
  doctorIds: string[];
  pharmacyIds: string[];
  staffIds: string[];
}

// ── Doctor ───────────────────────────────────────────────────
export interface Doctor extends BaseEntity {
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  avatar?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
}

// ── Patient ──────────────────────────────────────────────────
export interface Patient extends BaseEntity {
  patientId: string; // Auto-generated camp-wise ID
  campId: string;
  name: string;
  surname?: string;
  fatherName?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  address: string;
  village: string;
  district?: string;
  state?: string;
  photoUrl?: string;
  status: 'registered' | 'in_progress' | 'completed';
}

// ── SOAP Notes ───────────────────────────────────────────────
export interface SOAPObjective {
  weight?: number;
  bp?: string;
  pulse?: number;
  temp?: number;
  spo2?: number;
  notes?: string;
}

export interface SOAPNote extends BaseEntity {
  patientId: string;
  campId: string;
  createdBy: string;
  subjective: string;
  objective: SOAPObjective;
  assessment: string;
  plan: string;
  status: 'pending' | 'with_doctor' | 'completed';
}

// ── Consultation ─────────────────────────────────────────────
export interface Consultation extends BaseEntity {
  patientId: string;
  doctorId: string;
  campId: string;
  soapNoteId: string;
  chiefComplaint: string;
  medicalHistory?: string;
  diagnosis: string[];
  labTests?: string[];
  suggestedOperations?: string[];
  notes?: string;
  prescriptionId?: string;
  status: 'in_progress' | 'completed';
}

// ── Medicine & Prescription ──────────────────────────────────
export interface Medicine extends BaseEntity {
  name: string;
  code: string;
  category: string;
  unitPrice: number;
  status: 'available' | 'discontinued';
}

export interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  morning: number;
  afternoon: number;
  night: number;
  days: number;
}

export interface Prescription extends BaseEntity {
  consultationId: string;
  patientId: string;
  doctorId: string;
  campId: string;
  items: PrescriptionItem[];
  status: 'pending' | 'dispensed' | 'partial';
}

// ── Discount ─────────────────────────────────────────────────
export type DiscountType = 'percentage' | 'fixed';

export interface Discount extends BaseEntity {
  name: string;
  type: DiscountType;
  value: number;
  campId: string;
  patientId: string;
  prescriptionId?: string;
  medicineIds?: string[];
  appliedBy: string;
  reason?: string;
  status: 'active' | 'expired';
}

// ── Payment ──────────────────────────────────────────────────
export interface Payment extends BaseEntity {
  prescriptionId: string;
  patientId: string;
  campId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  discountId?: string;
  discountAmount?: number;
  status: 'full' | 'partial' | 'pending';
}

// ── Stock ────────────────────────────────────────────────────
export interface Supplier extends BaseEntity {
  name: string;
  contact: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface StockItem extends BaseEntity {
  medicineId: string;
  campId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  supplierId: string;
  status: 'available' | 'expired' | 'depleted';
}

// ── Warehouse ────────────────────────────────────────────────
export interface Warehouse extends BaseEntity {
  name: string;
  address: string;
  supplierIds: string[];
  status: 'active' | 'inactive';
}

export interface SupplierMedicine {
  supplierId: string;
  medicineId: string;
}

// ── Supplier Orders ──────────────────────────────────────────
export type SupplierOrderStatus = 'pending' | 'sent' | 'received' | 'partial';

export interface SupplierOrderItem {
  medicineId: string;
  requestedQty: number;
  receivedQty?: number;
}

export interface SupplierOrder extends BaseEntity {
  supplierId: string;
  warehouseId: string;
  items: SupplierOrderItem[];
  status: SupplierOrderStatus;
  receivedAt?: string;
}

// ── Distribution ─────────────────────────────────────────────
export type DistributionStatus = 'pending' | 'confirmed' | 'partial' | 'sent';

export interface DistributionItem {
  medicineId: string;
  requestedQty: number;
  sentQty: number;
}

export interface StockDistribution extends BaseEntity {
  warehouseId: string;
  clientName: string;
  items: DistributionItem[];
  status: DistributionStatus;
  notes?: string;
}

// ── Request Orders ───────────────────────────────────────────
export type RequestOrderStatus = 'draft' | 'pending' | 'partial' | 'sent' | 'cancelled';

export interface RequestOrderItem {
  medicineId: string;
  requestedQty: number;
  sendQty: number;
}

export interface RequestOrder extends BaseEntity {
  requestedBy: string;
  clientName: string;
  warehouseId: string;
  items: RequestOrderItem[];
  status: RequestOrderStatus;
  notes?: string;
}

// ── Stats ────────────────────────────────────────────────────
export interface CampStats {
  totalPatients: number;
  patientsAtDoctor: number;
  patientsAtPharmacy: number;
  patientsAtCashier: number;
  exitedPatients: number;
  totalCollection: number;
}
