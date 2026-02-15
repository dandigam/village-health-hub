import { useState, useEffect } from 'react';
import { Warehouse as WarehouseIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import type { Supplier, Warehouse } from '@/types';

interface WarehouseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  warehouse?: Warehouse | null;
  suppliers: Supplier[];
  onSave: (warehouse: Warehouse) => void;
}

export function WarehouseFormDialog({ open, onOpenChange, warehouse, suppliers, onSave }: WarehouseFormDialogProps) {
  const isEdit = !!warehouse;
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (warehouse) {
        setName(warehouse.name);
        setAddress(warehouse.address);
        setSelectedSuppliers(warehouse.supplierIds);
      } else {
        setName('');
        setAddress('');
        setSelectedSuppliers([]);
      }
    }
  }, [open, warehouse]);

  const handleSave = () => {
    const now = new Date().toISOString();
    const saved: Warehouse = {
      id: warehouse?.id || String(Date.now()),
      name,
      address,
      supplierIds: selectedSuppliers,
      status: 'active',
      createdAt: warehouse?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved);
    toast({
      title: isEdit ? 'Warehouse Updated' : 'Warehouse Created',
      description: `${name} has been ${isEdit ? 'updated' : 'created'} successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-accent/10">
              <WarehouseIcon className="h-5 w-5 text-accent" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {isEdit ? 'Update warehouse details and suppliers' : 'Set up a new storage location'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="wh-name">Warehouse Name <span className="text-destructive">*</span></Label>
            <Input id="wh-name" placeholder="e.g. Central Warehouse Guntur" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wh-address">Address <span className="text-destructive">*</span></Label>
            <Input id="wh-address" placeholder="e.g. Industrial Area, Guntur, AP" value={address} onChange={e => setAddress(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Assign Suppliers</Label>
            <div className="border rounded-lg max-h-48 overflow-auto divide-y">
              {suppliers.length === 0 && (
                <p className="text-sm text-muted-foreground p-3 text-center">No suppliers available. Add suppliers first.</p>
              )}
              {suppliers.map(s => (
                <label key={s.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors">
                  <Checkbox
                    checked={selectedSuppliers.includes(s.id)}
                    onCheckedChange={(checked) => {
                      setSelectedSuppliers(prev =>
                        checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                      );
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{s.name}</p>
                    <p className="text-xs text-muted-foreground">{s.address}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim() || !address.trim()}>
            {isEdit ? 'Update Warehouse' : 'Create Warehouse'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
