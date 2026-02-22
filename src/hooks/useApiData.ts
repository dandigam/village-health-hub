// User registration mutation hook
export function useRegisterUser() {
  return useMutation({
    mutationFn: async (user: {
      fullName: string;
      username: string;
      email: string;
      phoneNumber: string;
      password: string;
      role: string;
    }) => {
      return await api.post('/users/register', user);
    },
  });
}
/**
 * React Query hooks with automatic API → mock fallback.
 * 
 * Each hook tries the real API first. If the backend is unavailable
 * or returns empty data, it seamlessly falls back to mock data.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchWithFallback, request, API_BASE_URL } from '@/services/api';
import api from '@/services/api';
import {
  mockUser,
  mockCamps,
  mockDoctors,
  mockPatients,
  mockMedicines,
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
} from '@/mock';
import type {
  User,
  Camp,
  Doctor,
  Patient,
  Medicine,
  Prescription,
  Supplier,
  StockItem,
  Discount,
  Payment,
  CampStats,
  Warehouse,
  SupplierMedicine,
  SupplierOrder,
  StockDistribution,
  RequestOrder,
} from '@/types';

const STALE_TIME = 5 * 60 * 1000;

// ── Query Hooks ──────────────────────────────────────────────

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: () => fetchWithFallback<User>('/auth/me', mockUser),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useCamps() {
  return useQuery({
    queryKey: ['camps'],
    queryFn: () => fetchWithFallback<Camp[]>('/camps', mockCamps),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useDoctors() {
  return useQuery({
    queryKey: ['doctors'],
    queryFn: () => fetchWithFallback<Doctor[]>('/doctors', mockDoctors),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: () => fetchWithFallback<Patient[]>('/patients', mockPatients),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: async () => {
      const result = await fetchWithFallback<Patient | null>(
        `/patients/${id}`,
        mockPatients.find((p) => p.id === id) || null
      );
      return result;
    },
    staleTime: STALE_TIME,
    enabled: !!id,
    select: (res) => res.data,
  });
}

export function useMedicines() {
  return useQuery({
    queryKey: ['medicines'],
    queryFn: () => fetchWithFallback<Medicine[]>('/medicines', mockMedicines),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function usePrescriptions() {
  return useQuery({
    queryKey: ['prescriptions'],
    queryFn: () => fetchWithFallback<Prescription[]>('/prescriptions', mockPrescriptions),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: ['suppliers'],
    queryFn: () => fetchWithFallback<Supplier[]>('/suppliers', mockSuppliers),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useSupplierList(warehouseId: number) {
  return useQuery({
    queryKey: ['suppliers', warehouseId],
    queryFn: () =>
      fetchWithFallback<Supplier[]>(
        `/suppliers/warehouse/${warehouseId}`,
        mockSuppliers
      ),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useStockItems() {
  return useQuery({
    queryKey: ['stockItems'],
    queryFn: () => fetchWithFallback<StockItem[]>('/stock-items', mockStockItems),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useDiscounts() {
  return useQuery({
    queryKey: ['discounts'],
    queryFn: () => fetchWithFallback<Discount[]>('/discounts', mockDiscounts),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: () => fetchWithFallback<Payment[]>('/payments', mockPayments),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useCampStats() {
  return useQuery({
    queryKey: ['campStats'],
    queryFn: () => fetchWithFallback<CampStats>('/stats/camp', mockCampStats),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => fetchWithFallback<Warehouse[]>('/warehouses', mockWarehouses),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useSupplierMedicines() {
  return useQuery({
    queryKey: ['supplierMedicines'],
    queryFn: () => fetchWithFallback<SupplierMedicine[]>('/supplier-medicines', mockSupplierMedicines),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useSupplierOrders(warehouseId?: number) {
  return useQuery({
    queryKey: ['supplierOrders', warehouseId],
    queryFn: () => fetchWithFallback<SupplierOrder[]>(
      warehouseId ? `/supplier-orders/warehouse/${warehouseId}` : '/supplier-orders',
      mockSupplierOrders
    ),
    staleTime: STALE_TIME,
    select: (res) => res.data,
    enabled: !!warehouseId,
  });
}

export function useDistributions() {
  return useQuery({
    queryKey: ['distributions'],
    queryFn: () => fetchWithFallback<StockDistribution[]>('/distributions', mockDistributions),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

export function useRequestOrders() {
  return useQuery({
    queryKey: ['requestOrders'],
    queryFn: () => fetchWithFallback<RequestOrder[]>('/request-orders', mockRequestOrders),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

// ── Location Hierarchy ───────────────────────────────────────

export interface Mandal {
  id: number;
  name: string;
}

export interface District {
  id: number;
  name: string;
  mandals: Mandal[];
}

export interface StateHierarchy {
  id: number;
  name: string;
  districts: District[];
}

export function useStatesHierarchy() {
  return useQuery({
    queryKey: ['statesHierarchy'],
    queryFn: () => fetchWithFallback<StateHierarchy[]>('/states/hierarchy', []),
    staleTime: STALE_TIME,
    select: (res) => res.data,
  });
}

// ── Warehouse Inventory ──────────────────────────────────────

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

export function useWarehouseInventory(warehouseId?: number) {
  return useQuery({
    queryKey: ['warehouseInventory', warehouseId],
    queryFn: () => fetchWithFallback<WarehouseInventoryItem[]>(
      `/warehouse-inventory/warehouse/${warehouseId}`,
      []
    ),
    staleTime: STALE_TIME,
    select: (res) => res.data,
    enabled: !!warehouseId,
  });
}

// ── Medical Conditions ───────────────────────────────────────

export interface MedicalCondition {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
}

export function useMedicalConditions() {
  return useQuery<MedicalCondition[]>({
    queryKey: ['medical-conditions'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/medical-conditions`);
      if (!res.ok) throw new Error('Failed to fetch medical conditions');
      return res.json();
    },
    staleTime: STALE_TIME,
    select: (data) => Array.isArray(data) ? data.filter((c) => c.isActive).sort((a, b) => a.displayOrder - b.displayOrder) : [],
    retry: false,
    refetchOnWindowFocus: false,
  });
}

// ── Dashboard Stats ──────────────────────────────────────────

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/dashboard`);
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
}

// ── Mutation Hooks ───────────────────────────────────────────

export function useSaveCamp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (camp: any) => {
      if (camp.id) {
        return await api.put(`/camps/${camp.id}`, camp);
      } else {
        const { id, ...campData } = camp;
        return await api.post('/camps', campData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['camps'] });
    },
  });
}

export function useSaveDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (doctor: {
      name: string;
      specialization: string;
      phoneNumber: string;
      email: string;
      doctorCamps: { id?: number; doctor: string; camp: string }[];
      [key: string]: any;
    }) => {
      return await api.post('/doctors', doctor);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
    },
  });
}

export function useDeleteSupplier(warehouseId?: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (supplierId: number) =>
      request(`/suppliers/${supplierId}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      if (warehouseId) {
        queryClient.invalidateQueries({ queryKey: ['suppliers', warehouseId] });
      }
    },
  });
}
