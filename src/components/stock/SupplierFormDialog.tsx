import { useState, useEffect } from 'react';
import { Search, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { mockMedicines, mockSupplierMedicines } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { Supplier } from '@/types';

interface SupplierFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier?: Supplier | null;
  onSave: (supplier: Supplier, medicineIds: string[]) => void;
}

export function SupplierFormDialog({ open, onOpenChange, supplier, onSave }: SupplierFormDialogProps) {
  const isEdit = !!supplier;
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');
  const [selectedMedicines, setSelectedMedicines] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      if (supplier) {
        setName(supplier.name);
        setContact(supplier.contact);
        setAddress(supplier.address);
        const existing = mockSupplierMedicines.filter(sm => sm.supplierId === supplier.id).map(sm => sm.medicineId);
        setSelectedMedicines(existing);
      } else {
        setName('');
        setContact('');
        setAddress('');
        setSelectedMedicines([]);
      }
      setStep(1);
      setMedicineSearch('');
    }
  }, [open, supplier]);

  const filteredMedicines = mockMedicines.filter(m =>
    m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
    m.code.includes(medicineSearch)
  );

  const handleSave = () => {
    const now = new Date().toISOString();
    const saved: Supplier = {
      id: supplier?.id || String(Date.now()),
      name,
      contact,
      address,
      status: 'active',
      createdAt: supplier?.createdAt || now,
      updatedAt: now,
    };
    onSave(saved, selectedMedicines);
    toast({
      title: isEdit ? 'Supplier Updated' : 'Supplier Added',
      description: `${name} has been ${isEdit ? 'updated' : 'added'} successfully.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Truck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>{isEdit ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {step === 1 ? 'Enter supplier details' : 'Assign medicines to this supplier'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <span className="w-5 h-5 rounded-full bg-primary-foreground/20 flex items-center justify-center text-[10px]">1</span>
            Details
          </div>
          <div className={`flex-1 h-px ${step >= 2 ? 'bg-primary' : 'bg-border'}`} />
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-primary-foreground/20' : 'bg-muted-foreground/20'}`}>2</span>
            Medicines
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name <span className="text-destructive">*</span></Label>
              <Input id="supplier-name" placeholder="e.g. MedPharma Distributors" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-contact">Contact Number <span className="text-destructive">*</span></Label>
              <Input id="supplier-contact" placeholder="e.g. 9876543210" value={contact} onChange={e => setContact(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplier-address">Address <span className="text-destructive">*</span></Label>
              <Input id="supplier-address" placeholder="e.g. Industrial Area, Guntur" value={address} onChange={e => setAddress(e.target.value)} />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search medicines by name or code..." className="pl-9" value={medicineSearch} onChange={e => setMedicineSearch(e.target.value)} />
            </div>
            {selectedMedicines.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {selectedMedicines.map(id => {
                  const med = mockMedicines.find(m => m.id === id);
                  return med ? (
                    <Badge key={id} variant="secondary" className="text-xs gap-1">
                      {med.name}
                      <button className="ml-1 hover:text-destructive" onClick={() => setSelectedMedicines(prev => prev.filter(x => x !== id))}>×</button>
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
            <div className="border rounded-lg max-h-52 overflow-auto divide-y">
              {filteredMedicines.map(m => (
                <label key={m.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 cursor-pointer transition-colors">
                  <Checkbox
                    checked={selectedMedicines.includes(m.id)}
                    onCheckedChange={(checked) => {
                      setSelectedMedicines(prev =>
                        checked ? [...prev, m.id] : prev.filter(id => id !== m.id)
                      );
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs text-muted-foreground">{m.code} · {m.category}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">₹{m.unitPrice}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 2 && (
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
          )}
          {step === 1 ? (
            <Button onClick={() => setStep(2)} disabled={!name.trim() || !contact.trim() || !address.trim()}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSave} disabled={selectedMedicines.length === 0}>
              {isEdit ? 'Update Supplier' : 'Add Supplier'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
