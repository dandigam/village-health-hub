import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Truck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { useSuppliers, useSupplierMedicines, useMedicines } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { Supplier } from '@/types';

export default function Suppliers() {
  const navigate = useNavigate();
  const { data: suppliers = [] } = useSuppliers();
  const { data: supplierMedicines = [] } = useSupplierMedicines();
  const { data: medicines = [] } = useMedicines();
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);

  const getMedicinesForSupplier = (supplierId: string) => {
    const medIds = supplierMedicines.filter(sm => sm.supplierId === supplierId).map(sm => sm.medicineId);
    return medicines.filter(m => medIds.includes(m.id));
  };

  const handleDelete = () => {
    toast({ title: 'Supplier Deleted', description: `${deleteSupplier?.name} has been removed.` });
    setDeleteSupplier(null);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <Button onClick={() => navigate('/suppliers/new')}>
          <Plus className="mr-2 h-4 w-4" /> Add Supplier
        </Button>
      </div>

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
                  const meds = getMedicinesForSupplier(supplier.id);
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
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Badge variant="outline" className="text-xs cursor-pointer">+{remainingMeds.length} more</Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-[240px]">
                                  <div className="space-y-1">
                                    {remainingMeds.map(m => (
                                      <p key={m.id} className="text-xs">{m.name}</p>
                                    ))}
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {meds.length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center justify-center gap-1">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setViewSupplier(supplier)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => navigate(`/suppliers/${supplier.id}/edit`)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteSupplier(supplier)}>
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
        open={!!deleteSupplier}
        onOpenChange={() => setDeleteSupplier(null)}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteSupplier?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}
