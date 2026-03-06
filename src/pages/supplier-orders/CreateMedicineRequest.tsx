import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplierList, useWarehouseInventory } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface MedicineRow {
  medicineId: string;
  medicineName: string;
  category: string;
  company: string;
  packSize: string;
  lastOrderedQty: number;
  requestedQty: number;
  comments: string;
}

export default function CreateMedicineRequest() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: warehouseInventory = [] } = useWarehouseInventory(warehouseId);

  const [supplierId, setSupplierId] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Selected supplier info
  const selectedSupplier = useMemo(() => suppliers.find(s => String(s.id) === supplierId), [suppliers, supplierId]);

  // Load medicines when supplier changes
  useEffect(() => {
    if (!supplierId) {
      setMedicines([]);
      return;
    }
    const supplier = suppliers.find(s => String(s.id) === supplierId);
    const meds = supplier?.medicines ?? [];
    setMedicines(meds.map(m => ({
      medicineId: String(m.id),
      medicineName: m.name || '-',
      category: (m as any).category || (m as any).medicineType || '-',
      company: (m as any).company || '-',
      packSize: (m as any).packSize || '-',
      lastOrderedQty: 0,
      requestedQty: 0,
      comments: '',
    })));
  }, [supplierId, suppliers]);

  const totalSelected = medicines.filter(m => m.requestedQty > 0).length;
  const totalQty = medicines.reduce((s, m) => s + m.requestedQty, 0);

  const getStock = (medicineId: string) => {
    const item = warehouseInventory.find(inv => String(inv.medicineId) === medicineId);
    return item?.totalQty || 0;
  };

  const handleSubmit = async (status: 'PENDING' | 'DRAFT') => {
    const validItems = medicines.filter(m => m.requestedQty > 0);
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        warehouseId,
        supplierId: Number(supplierId),
        status,
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      await api.post('/supplier-orders', payload);
      toast({ title: status === 'DRAFT' ? 'Draft Saved' : 'Request Sent', description: `Order ${status === 'DRAFT' ? 'saved as draft' : 'sent to'} ${selectedSupplier?.name}.` });
      navigate('/supplier-orders');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to submit', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const updateMedicine = (idx: number, field: keyof MedicineRow, value: any) => {
    const updated = [...medicines];
    (updated[idx] as any)[field] = value;
    setMedicines(updated);
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Create Medicine Request</h1>
          <p className="text-xs text-muted-foreground">Select a supplier and enter requested quantities</p>
        </div>
      </div>

      {/* Supplier Information */}
      <div className="border rounded-lg bg-card p-3 mb-3">
        <h2 className="text-sm font-semibold mb-2">Supplier Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-xs">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Contact Number</Label>
            <Input className="h-8 text-sm mt-1 bg-muted/50" readOnly value={selectedSupplier?.contact || '-'} />
          </div>
          <div>
            <Label className="text-xs">Address</Label>
            <Input className="h-8 text-sm mt-1 bg-muted/50" readOnly value={selectedSupplier?.address || '-'} />
          </div>
        </div>
      </div>

      {/* Medicine Request Grid */}
      {!supplierId ? (
        <div className="border rounded-lg bg-card flex flex-col items-center justify-center py-12">
          <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground">Select a supplier to load medicine catalog</p>
        </div>
      ) : medicines.length === 0 ? (
        <div className="border rounded-lg bg-card flex flex-col items-center justify-center py-12">
          <p className="text-sm text-muted-foreground">No medicines assigned to this supplier</p>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-380px)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-xs w-8">#</th>
                  <th className="px-3 py-2 text-left font-medium text-xs">Medicine Name</th>
                  <th className="px-3 py-2 text-left font-medium text-xs">Category</th>
                  <th className="px-3 py-2 text-center font-medium text-xs">Current Stock</th>
                  <th className="px-3 py-2 text-center font-medium text-xs w-28">Requested Qty</th>
                  <th className="px-3 py-2 text-left font-medium text-xs">Comments</th>
                </tr>
              </thead>
              <tbody>
                {medicines.map((med, idx) => {
                  const hasQty = med.requestedQty > 0;
                  const stock = getStock(med.medicineId);
                  return (
                    <tr key={med.medicineId} className={`border-b last:border-b-0 transition-colors ${hasQty ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                      <td className="px-3 py-1.5 text-xs text-muted-foreground">{idx + 1}</td>
                      <td className="px-3 py-1.5 font-medium">{med.medicineName}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{med.category}</td>
                      <td className="px-3 py-1.5 text-center">
                        <span className={stock <= 0 ? 'text-destructive font-medium' : stock < 30 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>
                          {stock}
                        </span>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <Input
                          type="number"
                          min="0"
                          className={`w-24 h-7 mx-auto text-center text-sm ${hasQty ? 'border-primary/50 bg-primary/5' : ''}`}
                          value={med.requestedQty || ''}
                          placeholder="0"
                          onChange={e => updateMedicine(idx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                        />
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          className="h-7 text-sm"
                          placeholder="Optional"
                          value={med.comments}
                          onChange={e => updateMedicine(idx, 'comments', e.target.value)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Order Summary Footer */}
          <div className="flex items-center justify-between px-3 py-2.5 border-t bg-muted/30">
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Medicines Selected: <strong className="text-foreground">{totalSelected}</strong></span>
              <span className="text-muted-foreground">Total Qty: <strong className="text-foreground">{totalQty}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/supplier-orders')}>Cancel</Button>
              <Button variant="secondary" size="sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                <Save className="mr-1 h-3.5 w-3.5" /> Save Draft
              </Button>
              <Button size="sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
                <Send className="mr-1 h-3.5 w-3.5" /> Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
