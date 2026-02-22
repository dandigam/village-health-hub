// ============================================================
// Domain Types — Backend-Ready, Spring Boot + MongoDB Compatible
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
  campName?: string; // API alias
  location: string;
  village: string;
  city?: string; // API alias for village
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
  phoneNumber?: string; // API alias
  email?: string;
  avatar?: string;
  photoUrl?: string;
  status: 'active' | 'inactive';
}

// ── Patient ──────────────────────────────────────────────────
export interface PatientAddress {
  stateId?: number;
  districtId?: number;
  mandalId?: number;
  cityVillage?: string;
  streetAddress?: string;
  state?: string;
  district?: string;
  mandal?: string;
  pinCode?: string;
}

export interface PatientMedicalHistory {
  conditions?: string[];
  previousHospital?: string;
  currentMedications?: string;
  pastSurgery?: string;
}

export interface Patient extends BaseEntity {
  patientId: string;
  campId: string;
  // Supports both flat name and split name from API
  name: string;
  firstName?: string;
  lastName?: string;
  surname?: string;
  fatherName?: string;
  fatherSpouseName?: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  phoneNumber?: string; // API alias
  // Address: can be string (mock) or object (API)
  address: string | PatientAddress;
  village: string;
  district?: string;
  state?: string;
  maritalStatus?: string;
  photoUrl?: string;
  status: 'registered' | 'in_progress' | 'completed';
  // Medical history (API fields)
  hasMedicalHistory?: boolean;
  medicalHistory?: PatientMedicalHistory;
  // Payment (API fields)
  paymentType?: string;
  paymentPercentage?: number;
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
  medicines?: { id: string | number; name: string }[];
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

export interface WarehouseInventoryItem {
  id: number;
  warehouseId: number;
  warehouseName: string;
  medicineId: number;
  medicineName: string;
  medicineType: string;
  totalQty: number;
  minimumQty: number;
  updatedAt: string;
  items: any[] | null;
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
  supplierName?: string; // API field
  warehouseId: string;
  items: SupplierOrderItem[];
  status: SupplierOrderStatus;
  receivedAt?: string;
  loading?: boolean; // UI state for loading
  [key: string]: any; // Allow extra API fields
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

// ── Paginated Response ───────────────────────────────────────
export interface PaginatedResponse<T> {
  content: T[];
  totalElements?: number;
  totalPages?: number;
  size?: number;
  number?: number;
}
