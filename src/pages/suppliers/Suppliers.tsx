import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Truck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const warehouseId = authUser?.wareHouse?.id ? Number(authUser.wareHouse.id) : undefined;
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

  // Returns medicines for a supplier, or empty array if none
  const getMedicinesForSupplier = (supplierId: number) => {
    const supplier = suppliers.find(s => s.id === supplierId);
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
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <Button onClick={() => navigate('/suppliers/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

      <TooltipProvider delayDuration={0}>
      <Card>
        <CardContent className="p-0">
          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Medicines</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">No suppliers found.</td></tr>
                ) : suppliers.map(supplier => {
                  if (!supplier) return null;
                  // Prefer supplier.medicines if present and non-empty, otherwise fallback
                  const meds = (supplier.medicines && supplier.medicines.length > 0)
                    ? supplier.medicines
                    : getMedicinesForSupplier(supplier.id);
                  const visibleMeds = meds.slice(0, 3);
                  const remainingMeds = meds.slice(3);

                  return (
                    <tr key={supplier.id}>
                      <td className="font-medium">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Truck className="h-4 w-4 text-primary" />
                          </div>
                          {supplier.name}
                        </div>
                      </td>
                      <td>{supplier.contact}</td>
                      <td className="max-w-[200px] truncate">{supplier.address}</td>
                      <td>
                        <div className="flex items-center gap-1 flex-wrap">
                          {visibleMeds.map(m => (
                            <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                          ))}
                          {remainingMeds.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">+{remainingMeds.length} more</Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[280px] p-2 z-[100]">
                                <div className="flex flex-wrap gap-1">
                                  {remainingMeds.map(m => (
                                    <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {meds.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewSupplier(supplier)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/suppliers/${supplier.id}/edit`, { state: { supplier } })}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteSupplierState(supplier)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> {viewSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          {viewSupplier && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Contact:</span> <span className="font-medium">{viewSupplier.contact}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <Badge variant="secondary" className="ml-1">{viewSupplier.status}</Badge></div>
                <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{viewSupplier.address}</span></div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Medicines Supplied</p>
                <div className="flex flex-wrap gap-1.5">
                  {getMedicinesForSupplier(viewSupplier.id).map(m => (
                    <Badge key={m.id} variant="secondary">{m.name}</Badge>
                  ))}
                  {getMedicinesForSupplier(viewSupplier.id).length === 0 && (
                    <span className="text-sm text-muted-foreground">No medicines assigned</span>
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
