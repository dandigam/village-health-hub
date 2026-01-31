// User & Role Types
export type UserRole = 'super_admin' | 'camp_admin' | 'doctor' | 'pharmacy' | 'staff';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
}

// Camp Types
export type CampStatus = 'draft' | 'active' | 'closed';

export interface Camp {
  id: string;
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

// Doctor Types
export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  avatar?: string;
}

// Patient Types
export interface Patient {
  id: string;
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
  createdAt: string;
}

// SOAP Notes Types
export interface SOAPNote {
  id: string;
  patientId: string;
  campId: string;
  createdBy: string; // Staff ID
  subjective: string;
  objective: {
    weight?: number;
    bp?: string;
    pulse?: number;
    temp?: number;
    spo2?: number;
    notes?: string;
  };
  assessment: string;
  plan: string;
  status: 'pending' | 'with_doctor' | 'completed';
  createdAt: string;
}

// Consultation Types
export interface Consultation {
  id: string;
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
  createdAt: string;
}

// Medicine & Prescription Types
export interface Medicine {
  id: string;
  name: string;
  code: string;
  category: string;
  unitPrice: number;
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

export interface Prescription {
  id: string;
  consultationId: string;
  patientId: string;
  doctorId: string;
  campId: string;
  items: PrescriptionItem[];
  status: 'pending' | 'dispensed' | 'partial';
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: string;
  prescriptionId: string;
  patientId: string;
  campId: string;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  status: 'full' | 'partial' | 'pending';
  createdAt: string;
}

// Stock Types
export interface Supplier {
  id: string;
  name: string;
  contact: string;
  address: string;
}

export interface StockItem {
  id: string;
  medicineId: string;
  campId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  supplierId: string;
}

// Stats Types
export interface CampStats {
  totalPatients: number;
  patientsAtDoctor: number;
  patientsAtPharmacy: number;
  patientsAtCashier: number;
  exitedPatients: number;
  totalCollection: number;
}
