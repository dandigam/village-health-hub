import { useState } from 'react';
import { Plus, Warehouse as WarehouseIcon, MapPin, Truck, Search, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockWarehouses, mockSuppliers, mockMedicines, mockSupplierMedicines } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { Warehouse } from '@/types';

export function WarehouseTab() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [supplierStep, setSupplierStep] = useState(1);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);

  // Add Supplier form
  const [supplierName, setSupplierName] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [supplierContact, setSupplierContact] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);

  // Create Warehouse form
  const [warehouseName, setWarehouseName] = useState('');
  const [warehouseAddress, setWarehouseAddress] = useState('');
  const [warehouseSuppliers, setWarehouseSuppliers] = useState<string[]>([]);

  const filteredMedicines = mockMedicines.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    m.code.includes(medicineSearch)
  );

  const resetSupplierForm = () => {
    setSupplierStep(1);
    setSupplierName('');
    setSupplierAddress('');
    setSupplierContact('');
    setMedicineSearch('');
    setSelectedMedicines([]);
  };

  const handleAddSupplier = () => {
    toast({ title: 'Supplier Added', description: `${supplierName} has been added successfully.` });
    setShowAddSupplier(false);
    resetSupplierForm();
  };

  const handleCreateWarehouse = () => {
    const newWarehouse: Warehouse = {
      id: String(warehouses.length + 1),
      name: warehouseName,
      address: warehouseAddress,
      supplierIds: warehouseSuppliers,
      createdAt: new Date().toISOString(),
    };
    setWarehouses([...warehouses, newWarehouse]);
    toast({ title: 'Warehouse Created', description: `${warehouseName} has been created.` });
    setShowCreateWarehouse(false);
    setWarehouseName('');
    setWarehouseAddress('');
    setWarehouseSuppliers([]);
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={() => setShowAddSupplier(true)}>
          <Truck className="mr-2 h-4 w-4" />
          Add Supplier
        </Button>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => setShowCreateWarehouse(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Warehouse
        </Button>
      </div>

      {/* Warehouse List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(wh => {
          const suppliers = mockSuppliers.filter(s => wh.supplierIds.includes(s.id));
          return (
            <Card key={wh.id} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedWarehouse(wh)}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-full bg-accent/10">
                    <WarehouseIcon className="h-5 w-5 text-accent" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{wh.name}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" /> {wh.address}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {suppliers.map(s => (
                        <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Warehouse Detail Dialog */}
      <Dialog open={!!selectedWarehouse} onOpenChange={() => setSelectedWarehouse(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedWarehouse?.name}</DialogTitle>
          </DialogHeader>
          {selectedWarehouse && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground text-xs">Address</Label>
                <p className="text-sm">{selectedWarehouse.address}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Suppliers</Label>
                <div className="mt-2 space-y-2">
                  {mockSuppliers.filter(s => selectedWarehouse.supplierIds.includes(s.id)).map(s => {
                    const meds = mockSupplierMedicines.filter(sm => sm.supplierId === s.id);
                    return (
                      <Card key={s.id}>
                        <CardContent className="py-3 px-4">
                          <p className="font-medium text-sm">{s.name}</p>
                          <p className="text-xs text-muted-foreground">{s.contact} · {s.address}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {meds.map(sm => {
                              const med = mockMedicines.find(m => m.id === sm.medicineId);
                              return med ? <Badge key={sm.medicineId} variant="outline" className="text-xs">{med.name}</Badge> : null;
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Created: {new Date(selectedWarehouse.createdAt).toLocaleDateString()}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Supplier Dialog (Stepper) */}
      <Dialog open={showAddSupplier} onOpenChange={(o) => { setShowAddSupplier(o); if (!o) resetSupplierForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Supplier</DialogTitle>
          </DialogHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-4">
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${supplierStep >= 1 ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
            <div className={`flex-1 h-0.5 ${supplierStep >= 2 ? 'bg-accent' : 'bg-muted'}`} />
            <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${supplierStep >= 2 ? 'bg-accent text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
          </div>

          {supplierStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label>Supplier Name</Label>
                <Input placeholder="Enter supplier name" className="mt-2" value={supplierName} onChange={e => setSupplierName(e.target.value)} />
              </div>
              <div>
                <Label>Contact Number</Label>
                <Input placeholder="Enter contact number" className="mt-2" value={supplierContact} onChange={e => setSupplierContact(e.target.value)} />
              </div>
              <div>
                <Label>Address</Label>
                <Input placeholder="Enter address" className="mt-2" value={supplierAddress} onChange={e => setSupplierAddress(e.target.value)} />
              </div>
            </div>
          )}

          {supplierStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label>Search Medicines</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search by name or code..." className="pl-9" value={medicineSearch} onChange={e => setMedicineSearch(e.target.value)} />
                </div>
              </div>
              <div className="border rounded-lg max-h-60 overflow-auto">
                {filteredMedicines.map(m => (
                  <label key={m.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      checked={selectedMedicines.includes(m.id)}
                      onCheckedChange={(checked) => {
                        setSelectedMedicines(prev =>
                          checked ? [...prev, m.id] : prev.filter(id => id !== m.id)
                        );
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{m.name}</p>
                      <p className="text-xs text-muted-foreground">{m.code} · {m.category}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedMedicines.length > 0 && (
                <p className="text-sm text-muted-foreground">{selectedMedicines.length} medicines selected</p>
              )}
            </div>
          )}

          <DialogFooter>
            {supplierStep === 2 && (
              <Button variant="outline" onClick={() => setSupplierStep(1)}>Back</Button>
            )}
            {supplierStep === 1 ? (
              <Button onClick={() => setSupplierStep(2)} disabled={!supplierName || !supplierAddress}>Next</Button>
            ) : (
              <Button onClick={handleAddSupplier} disabled={selectedMedicines.length === 0}>Add Supplier</Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Warehouse Dialog */}
      <Dialog open={showCreateWarehouse} onOpenChange={setShowCreateWarehouse}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Warehouse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Warehouse Name</Label>
              <Input placeholder="Enter warehouse name" className="mt-2" value={warehouseName} onChange={e => setWarehouseName(e.target.value)} />
            </div>
            <div>
              <Label>Warehouse Address</Label>
              <Input placeholder="Enter address" className="mt-2" value={warehouseAddress} onChange={e => setWarehouseAddress(e.target.value)} />
            </div>
            <div>
              <Label>Assign Suppliers</Label>
              <div className="border rounded-lg max-h-48 overflow-auto mt-2">
                {mockSuppliers.map(s => (
                  <label key={s.id} className="flex items-center gap-3 p-3 border-b last:border-b-0 hover:bg-muted/50 cursor-pointer">
                    <Checkbox
                      checked={warehouseSuppliers.includes(s.id)}
                      onCheckedChange={(checked) => {
                        setWarehouseSuppliers(prev =>
                          checked ? [...prev, s.id] : prev.filter(id => id !== s.id)
                        );
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.address}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateWarehouse(false)}>Cancel</Button>
            <Button onClick={handleCreateWarehouse} disabled={!warehouseName || !warehouseAddress}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
