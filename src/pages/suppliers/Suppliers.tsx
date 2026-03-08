import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2, Truck, Search, Phone, MapPin, MoreVertical, PlusCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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

  const reloadSuppliers = () => {
    if (typeof refetchSuppliers === 'function') refetchSuppliers();
  };

  useEffect(() => {
    reloadSuppliers();
  }, []);

  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [deleteSupplierState, setDeleteSupplierState] = useState<Supplier | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.contact?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.address?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-value">Suppliers</h1>
          <span className="px-2.5 py-1 bg-muted text-muted-foreground text-sm font-medium rounded-full">
            {filteredSuppliers.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search suppliers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64 h-10"
            />
          </div>
          <Button onClick={() => navigate('/suppliers/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Supplier
          </Button>
        </div>
      </div>

      <TooltipProvider delayDuration={0}>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-label uppercase tracking-wider">Supplier</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-label uppercase tracking-wider">Contact</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-label uppercase tracking-wider">Address</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-label uppercase tracking-wider">Medicines</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-label uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredSuppliers.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No suppliers found.</td></tr>
                ) : filteredSuppliers.map(supplier => {
                  if (!supplier) return null;
                  const meds = (supplier.medicines && supplier.medicines.length > 0)
                    ? supplier.medicines
                    : getMedicinesForSupplier(supplier.id);
                  const visibleMeds = meds.slice(0, 3);
                  const remainingMeds = meds.slice(3);

                  return (
                    <tr key={supplier.id} className="hover:bg-primary/[0.02] transition-colors duration-150">
                      <td className="px-5 py-4">
                        <span className="font-semibold text-value">{supplier.name}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          <span className="font-mono text-sm">{supplier.contact}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-muted-foreground max-w-[200px]">
                          <MapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate text-sm">{supplier.address}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {visibleMeds.map(m => (
                            <Badge key={m.id} variant="secondary" className="text-xs font-medium">{m.name}</Badge>
                          ))}
                          {remainingMeds.length > 0 && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs cursor-pointer">+{remainingMeds.length} more</Badge>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-[280px] p-2 z-[100]">
                                <div className="flex flex-wrap gap-1.5">
                                  {remainingMeds.map(m => (
                                    <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                                  ))}
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                          {meds.length === 0 && <span className="text-xs text-muted-foreground italic">No medicines</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* + Add Medicine button */}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 rounded-full text-primary hover:text-primary hover:bg-primary/10 transition-all"
                                onClick={() => navigate(`/suppliers/${supplier.id}/edit`, { state: { supplier, focusStep: 2 } })}
                                title="Add Medicine"
                              >
                                <PlusCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="text-xs">Add Medicine</TooltipContent>
                          </Tooltip>

                          {/* 3-dot menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground transition-all">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => setViewSupplier(supplier)}>
                                <Eye className="h-3.5 w-3.5 mr-2" /> View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigate(`/suppliers/${supplier.id}/edit`, { state: { supplier } })}>
                                <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setDeleteSupplierState(supplier)}>
                                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-value">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              {viewSupplier?.name}
            </DialogTitle>
          </DialogHeader>
          {viewSupplier && (
            <div className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-label uppercase tracking-wide">Contact</span>
                  <p className="font-medium text-value flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-icon-phone" />
                    {viewSupplier.contact}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-label uppercase tracking-wide">Status</span>
                  <p>
                    <Badge className="bg-[hsl(var(--stock-ok-bg))] text-success border border-success/20">{viewSupplier.status || 'Active'}</Badge>
                  </p>
                </div>
                <div className="col-span-2 space-y-1">
                  <span className="text-xs font-medium text-label uppercase tracking-wide">Address</span>
                  <p className="font-medium text-value flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    {viewSupplier.address}
                  </p>
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <p className="text-xs font-medium text-label uppercase tracking-wide mb-3">Medicines Supplied</p>
                <div className="flex flex-wrap gap-2">
                  {getMedicinesForSupplier(viewSupplier.id).map(m => (
                    <Badge key={m.id} variant="secondary" className="text-xs">{m.name}</Badge>
                  ))}
                  {getMedicinesForSupplier(viewSupplier.id).length === 0 && (
                    <span className="text-sm text-muted-foreground italic">No medicines assigned</span>
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
