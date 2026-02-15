/**
 * Mock Data Index
 * 
 * Re-exports all mock data from the original data file.
 * This file serves as the single source of fallback data
 * used by the API service when the backend is unavailable.
 * 
 * DO NOT REMOVE — this is the fallback layer.
 */

export {
  mockUser,
  mockCamps,
  mockDoctors,
  mockPatients,
  mockSOAPNotes,
  mockMedicines,
  mockConsultations,
  mockPrescriptions,
  mockSuppliers,
  mockStockItems,
  mockDiscounts,
  mockPayments,
  mockCampStats,
  mockWarehouses,
  mockSupplierMedicines,
  mockSupplierOrders,
  mockDistributions,
  mockRequestOrders,
} from '@/data/mockData';
