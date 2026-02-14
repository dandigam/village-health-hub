import { useState } from 'react';
import { Plus, Warehouse as WarehouseIcon, MapPin, Truck, Edit2, Trash2, Phone, ChevronRight, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockWarehouses, mockSuppliers, mockSupplierMedicines, mockMedicines } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import { SupplierFormDialog } from './SupplierFormDialog';
import { WarehouseFormDialog } from './WarehouseFormDialog';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import type { Warehouse, Supplier } from '@/types';

interface WarehouseTabProps {
  showAddSupplier: boolean;
  setShowAddSupplier: (v: boolean) => void;
  showCreateWarehouse: boolean;
  setShowCreateWarehouse: (v: boolean) => void;
}

export function WarehouseTab({ showAddSupplier, setShowAddSupplier, showCreateWarehouse, setShowCreateWarehouse }: WarehouseTabProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>(mockSuppliers);
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);

  // Edit states
  const [editSupplier, setEditSupplier] = useState<Supplier | null>(null);
  const [editWarehouse, setEditWarehouse] = useState<Warehouse | null>(null);

  // Delete states
  const [deleteSupplier, setDeleteSupplier] = useState<Supplier | null>(null);
  const [deleteWarehouse, setDeleteWarehouse] = useState<Warehouse | null>(null);

  const handleSaveSupplier = (supplier: Supplier, _medicineIds: string[]) => {
    setSuppliers(prev => {
      const exists = prev.find(s => s.id === supplier.id);
      if (exists) return prev.map(s => s.id === supplier.id ? supplier : s);
      return [...prev, supplier];
    });
  };

  const handleDeleteSupplier = () => {
    if (!deleteSupplier) return;
    setSuppliers(prev => prev.filter(s => s.id !== deleteSupplier.id));
    setWarehouses(prev => prev.map(w => ({ ...w, supplierIds: w.supplierIds.filter(id => id !== deleteSupplier.id) })));
    toast({ title: 'Supplier Deleted', description: `${deleteSupplier.name} has been removed.` });
    setDeleteSupplier(null);
  };

  const handleSaveWarehouse = (warehouse: Warehouse) => {
    setWarehouses(prev => {
      const exists = prev.find(w => w.id === warehouse.id);
      if (exists) return prev.map(w => w.id === warehouse.id ? warehouse : w);
      return [...prev, warehouse];
    });
  };

  const handleDeleteWarehouse = () => {
    if (!deleteWarehouse) return;
    setWarehouses(prev => prev.filter(w => w.id !== deleteWarehouse.id));
    toast({ title: 'Warehouse Deleted', description: `${deleteWarehouse.name} has been removed.` });
    setDeleteWarehouse(null);
  };

  return (
    <div className="space-y-8">
      {/* ── Suppliers Section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" /> Suppliers
            </h2>
            <p className="text-sm text-muted-foreground">{suppliers.length} registered suppliers</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddSupplier(true)}>
            <Plus className="mr-1 h-4 w-4" /> Add Supplier
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {suppliers.map(s => {
            const meds = mockSupplierMedicines.filter(sm => sm.supplierId === s.id);
            return (
              <Card key={s.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{s.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="h-3 w-3" /> {s.contact}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {s.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditSupplier(s)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteSupplier(s)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {meds.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                      <Package className="h-3 w-3 text-muted-foreground mt-0.5" />
                      {meds.slice(0, 3).map(sm => {
                        const med = mockMedicines.find(m => m.id === sm.medicineId);
                        return med ? <Badge key={sm.medicineId} variant="outline" className="text-[10px] px-1.5 py-0">{med.name}</Badge> : null;
                      })}
                      {meds.length > 3 && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{meds.length - 3}</Badge>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Warehouses Section ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <WarehouseIcon className="h-5 w-5 text-accent" /> Warehouses
            </h2>
            <p className="text-sm text-muted-foreground">{warehouses.length} storage locations</p>
          </div>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => setShowCreateWarehouse(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create Warehouse
          </Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
          {warehouses.map(wh => {
            const whSuppliers = suppliers.filter(s => wh.supplierIds.includes(s.id));
            return (
              <Card key={wh.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-accent/10 shrink-0">
                        <WarehouseIcon className="h-4 w-4 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm truncate">{wh.name}</h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {wh.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditWarehouse(wh)}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => setDeleteWarehouse(wh)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  {whSuppliers.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-3 border-t">
                      <Truck className="h-3 w-3 text-muted-foreground mt-0.5" />
                      {whSuppliers.map(s => (
                        <Badge key={s.id} variant="secondary" className="text-[10px] px-1.5 py-0">{s.name}</Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-2">
                    Created {new Date(wh.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ── Dialogs ── */}
      <SupplierFormDialog
        open={showAddSupplier}
        onOpenChange={setShowAddSupplier}
        onSave={handleSaveSupplier}
      />
      <SupplierFormDialog
        open={!!editSupplier}
        onOpenChange={(o) => { if (!o) setEditSupplier(null); }}
        supplier={editSupplier}
        onSave={handleSaveSupplier}
      />
      <WarehouseFormDialog
        open={showCreateWarehouse}
        onOpenChange={setShowCreateWarehouse}
        suppliers={suppliers}
        onSave={handleSaveWarehouse}
      />
      <WarehouseFormDialog
        open={!!editWarehouse}
        onOpenChange={(o) => { if (!o) setEditWarehouse(null); }}
        warehouse={editWarehouse}
        suppliers={suppliers}
        onSave={handleSaveWarehouse}
      />
      <DeleteConfirmDialog
        open={!!deleteSupplier}
        onOpenChange={(o) => { if (!o) setDeleteSupplier(null); }}
        title="Delete Supplier"
        description={`Are you sure you want to delete "${deleteSupplier?.name}"? This will also remove them from any assigned warehouses.`}
        onConfirm={handleDeleteSupplier}
      />
      <DeleteConfirmDialog
        open={!!deleteWarehouse}
        onOpenChange={(o) => { if (!o) setDeleteWarehouse(null); }}
        title="Delete Warehouse"
        description={`Are you sure you want to delete "${deleteWarehouse?.name}"? This action cannot be undone.`}
        onConfirm={handleDeleteWarehouse}
      />
    </div>
  );
}
