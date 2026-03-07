import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Truck, Search, Phone, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { useSupplierList } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { Supplier } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

export default function Suppliers() {
  const navigate = useNavigate();
  const {user: authUser} = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: suppliers = [], refetch: refetchSuppliers } = useSupplierList(warehouseId);

  // Helper to reload suppliers after add/edit/delete
  const reloadSuppliers = () => {
    if (typeof refetchSuppliers === 'function') refetchSuppliers();
  };

  // Always fetch fresh data when page loads (on mount or navigation)
  useEffect(() => {
    reloadSuppliers();
  }, []);

  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierState, setDeleteSupplierState] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Returns medicines for a supplier, or empty array if none
  const getMedicinesForSupplier = (supplierId: string | number) => {
    const supplier = suppliers.find(s => String(s.id) === String(supplierId));
    return supplier?.medicines ?? [];
  };

  const handleDelete = async () => {
    if (!deleteSupplierState?.id) return;
    try {
      const result = await api.delete(`/suppliers/warehouse/${warehouseId}/supplier/${deleteSupplierState.id}`);
      if (result === null) throw new Error('Failed to delete supplier');
      toast({ title: 'Supplier Deleted', description: `${deleteSupplierState.name} has been removed.` });
      setDeleteSupplierState(null);
      reloadSuppliers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to delete supplier', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800">Suppliers</h1>
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-sm font-medium rounded-full">
            {filteredSuppliers.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-10 bg-white border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
            />
          </div>
          <Button 
            onClick={() => navigate('/suppliers/new')}
            className="h-10 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 rounded-lg transition-all"
          >
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
      <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Address</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Medicines</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSuppliers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-slate-400">No suppliers found.</td></tr>
                ) : filteredSuppliers.map(supplier => {
                  if (!supplier) return null;
                  // Prefer supplier.medicines if present and non-empty, otherwise fallback
                  const meds = (supplier.medicines && supplier.medicines.length > 0)
                    ? supplier.medicines
                    : getMedicinesForSupplier(supplier.id);
                  const visibleMeds = meds.slice(0, 3);
                  const remainingMeds = meds.slice(3);

                  return (
                    <tr key={supplier.id} className="hover:bg-blue-50/30 transition-colors duration-150">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-slate-800">{supplier.name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600">
                          <Phone className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-mono text-sm">{supplier.contact}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-slate-600 max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="truncate text-sm">{supplier.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {visibleMeds.map(m => (
                            <Badge key={m.id} className="text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">{m.name}</Badge>
                          ))}
                          {remainingMeds.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge className="text-xs cursor-pointer bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200">+{remainingMeds.length} more</Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[280px] p-2 z-[100] bg-white shadow-lg border border-slate-200">
                                <div className="flex flex-wrap gap-1.5">
                                  {remainingMeds.map(m => (
                                    <Badge key={m.id} className="text-xs bg-blue-50 text-blue-700 border border-blue-200">{m.name}</Badge>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {meds.length === 0 && <span className="text-xs text-slate-400 italic">No medicines</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all" 
                            onClick={() => setViewSupplier(supplier)}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all" 
                            onClick={() => navigate(`/suppliers/${supplier.id}/edit`, { state: { supplier } })}
                            title="Edit Supplier"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" 
                            onClick={() => setDeleteSupplierState(supplier)}
                            title="Delete Supplier"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </TooltipProvider>

      {/* View Supplier Dialog */}
      <Dialog open={!!viewSupplier} onOpenChange={() => setViewSupplier(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800\">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm\">
                <Truck className="h-5 w-5 text-white" />
              </div>
              {viewSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          {viewSupplier && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact</span>
                  <p className="font-medium text-slate-700 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {viewSupplier.contact}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status</span>
                  <p>
                    <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200\">{viewSupplier.status || 'Active'}</Badge>
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address</span>
                  <p className="font-medium text-slate-700 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400\" />
                    {viewSupplier.address}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Medicines Supplied</p>
                <div className="flex flex-wrap gap-2">
                  {getMedicinesForSupplier(viewSupplier.id).map(m => (
                    <Badge key={m.id} className="bg-blue-50 text-blue-700 border border-blue-200\">{m.name}</Badge>
                  ))}
                  {getMedicinesForSupplier(viewSupplier.id).length === 0 && (
                    <span className="text-sm text-slate-400 italic\">No medicines assigned</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <DeleteConfirmDialog
        open={!!deleteSupplierState}
        onOpenChange={() => setDeleteSupplierState(null)}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteSupplierState?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
