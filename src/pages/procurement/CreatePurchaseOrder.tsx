import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Trash2, Save, Send, AlertCircle, X, Package, PlusCircle, Boxes, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import api from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useSupplierList } from '@/hooks/useApiData';
import { useQueryClient } from '@tanstack/react-query';

const UNITS = ['mg', 'ml', 'gm', 'mcg', 'IU', 'drops', 'units'] as const;
const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment'] as const;

interface SupplierMedicineApi {
  id: number;
  name: string;
  type: string;
  strength: string | null;
  unit: string | null;
  manufacturer: string | null;
  medicineId: number | null;
  currentQty: number | null;
}

interface SupplierApi {
  id: number;
  name: string;
  contact: string;
  address: string;
  state: string;
  district: string;
  mandal: string;
  pinCode: string;
  email: string;
  status: string;
  medicines: SupplierMedicineApi[];
}

interface MedicineRow {
  medicineId: string;
  name: string;
  strength: string;
  unit: string;
  category: string;
  qty: number;
  stock: number;
  error?: string;
}

export default function CreatePurchaseOrder() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const warehouseId = user?.context?.warehouseId;

  // Fetch suppliers from real API
  const { data: suppliers = [], isLoading: suppliersLoading } = useSupplierList(warehouseId) as {
    data: SupplierApi[] | undefined;
    isLoading: boolean;
  };

  const [supplierId, setSupplierId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<MedicineRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Add medicine panel
  const [showAddPanel, setShowAddPanel] = useState(false);
  const [medSearch, setMedSearch] = useState('');

  // Inline add-new medicine
  const [showInlineAdd, setShowInlineAdd] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('');
  const [newMedUnit, setNewMedUnit] = useState('mg');
  const [newMedCategory, setNewMedCategory] = useState('');
  const [extraMedicines, setExtraMedicines] = useState<{ id: string; name: string; strength: string; unit: string; category: string; stock: number }[]>([]);

  const selectedSupplier = suppliers.find(s => String(s.id) === supplierId);

  // Build medicine catalog from selected supplier's medicines + any inline-added ones
  const medicineCatalog = useMemo(() => {
    if (!selectedSupplier) return extraMedicines;
    const supplierMeds = selectedSupplier.medicines.map(m => ({
      id: String(m.id),
      name: m.name,
      strength: m.strength || '',
      unit: m.unit || m.type || '',
      category: m.type || 'General',
      stock: m.currentQty ?? 0,
    }));
    return [...supplierMeds, ...extraMedicines];
  }, [selectedSupplier, extraMedicines]);

  // Clear items when supplier changes
  useEffect(() => {
    setItems([]);
    setExtraMedicines([]);
  }, [supplierId]);

  const addedIds = useMemo(() => new Set(items.map(i => i.medicineId)), [items]);

  const filteredCatalog = useMemo(() => {
    const q = medSearch.toLowerCase().trim();
    return medicineCatalog
      .filter(m => !addedIds.has(m.id))
      .filter(m => !q || m.name.toLowerCase().includes(q) || m.category.toLowerCase().includes(q))
      .slice(0, 20);
  }, [medSearch, addedIds, medicineCatalog]);

  const hasNoResults = medSearch.trim().length > 0 && filteredCatalog.length === 0;

  const addMedicine = (med: typeof medicineCatalog[0]) => {
    setItems(prev => [...prev, {
      medicineId: med.id,
      name: med.name,
      strength: med.strength,
      unit: med.unit,
      category: med.category,
      qty: 0,
      stock: med.stock,
    }]);
  };

  const handleInlineAddMedicine = async () => {
    if (!newMedName.trim()) { toast.error('Medicine name is required'); return; }
    if (!newMedStrength.trim()) { toast.error('Strength is required'); return; }
    if (!newMedCategory) { toast.error('Category is required'); return; }
    if (!supplierId) { toast.error('Select a supplier first'); return; }

    // Call POST API to add medicine to supplier
    try {
      const payload = [{
        name: newMedName.trim(),
        type: newMedCategory,
        strength: newMedStrength.trim(),
        unit: newMedUnit,
      }];
      await api.post(`/suppliers/warehouses/${warehouseId}/suppliers/${supplierId}/medicines`, payload);
      // Refresh supplier data to get updated medicine list
      await queryClient.invalidateQueries({ queryKey: ['suppliers', warehouseId ? Number(warehouseId) : undefined] });
      toast.success(`${newMedName.trim()} added to supplier`);
    } catch {
      // Fallback: add locally even if API fails
      const newId = `new-${Date.now()}`;
      const newMed = {
        id: newId,
        name: newMedName.trim(),
        strength: newMedStrength.trim(),
        unit: newMedUnit,
        category: newMedCategory,
        stock: 0,
      };
      setExtraMedicines(prev => [...prev, newMed]);
      addMedicine(newMed);
      toast.success(`${newMedName.trim()} added to order (offline)`);
    }

    setNewMedName('');
    setNewMedStrength('');
    setNewMedUnit('mg');
    setNewMedCategory('');
    setShowInlineAdd(false);
    setMedSearch('');
  };

  const removeMedicine = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateQty = (idx: number, qty: number) => {
    setItems(prev => prev.map((r, i) => i === idx ? { ...r, qty: Math.max(0, qty), error: undefined } : r));
  };

  const totalItems = items.filter(i => i.qty > 0).length;
  const totalQty = items.reduce((s, i) => s + i.qty, 0);

  const validate = (): boolean => {
    if (!supplierId) { toast.error('Select a supplier'); return false; }
    if (items.length === 0) { toast.error('Add at least one medicine'); return false; }
    const validItems = items.filter(i => i.qty > 0);
    if (validItems.length === 0) { toast.error('Enter quantity for at least one medicine'); return false; }
    return true;
  };

  const handleSubmit = async (status: 'draft' | 'sent') => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const validItems = items.filter(i => i.qty > 0);
      const payload = {
        warehouseId,
        supplierId: Number(supplierId),
        status: status === 'draft' ? 'DRAFT' : 'PENDING',
        priority: priority.toUpperCase(),
        notes,
        items: validItems.map(i => ({
          medicineId: Number(i.medicineId),
          name: i.name,
          strength: i.strength,
          unit: i.unit,
          category: i.category,
          requestedQuantity: i.qty,
        })),
      };
      const result = await api.post('/supplier-orders', payload);
      const orderId = (result as any)?.id;
      toast.success(status === 'draft'
        ? `Draft saved — ${validItems.length} medicines, ${totalQty} total units`
        : `Purchase order sent to ${selectedSupplier?.name} — ${validItems.length} medicines, ${totalQty} total units`
      );
      navigate('/purchase-orders');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit purchase order');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Create Purchase Order</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Select a supplier, add medicines, set quantities</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate('/purchase-orders')} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSubmit('draft')} disabled={submitting || !supplierId}>
            <Save className="h-3.5 w-3.5 mr-1.5" /> Save Draft
          </Button>
          <Button size="sm" onClick={() => handleSubmit('sent')} disabled={submitting || totalItems === 0}>
            <Send className="h-3.5 w-3.5 mr-1.5" /> {submitting ? 'Sending...' : 'Send Order'}
          </Button>
        </div>
      </div>

      {/* Supplier & Priority Row */}
      <div className="border rounded-lg bg-card shadow-sm mb-5">
        <div className="px-5 py-4 flex items-stretch gap-0">
          <div className="flex-1 min-w-[220px]">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">
              Supplier <span className="text-destructive">*</span>
            </label>
            <Select value={supplierId} onValueChange={v => { setSupplierId(v); }}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder={suppliersLoading ? "Loading suppliers..." : "Select supplier..."} />
              </SelectTrigger>
              <SelectContent>
                {suppliers.map(s => (
                  <SelectItem key={String(s.id)} value={String(s.id)}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center px-4 self-stretch py-2">
            <div className="w-px h-full bg-border" />
          </div>

          <div className="flex flex-col justify-center">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Priority</label>
            <div className="flex items-center gap-2">
              <Switch checked={priority === 'urgent'} onCheckedChange={v => setPriority(v ? 'urgent' : 'normal')} />
              <Badge className={cn(
                "text-xs px-2 py-0.5 rounded-full border-0",
                priority === 'urgent' ? "bg-destructive text-destructive-foreground" : "bg-muted text-muted-foreground"
              )}>
                {priority === 'urgent' ? '🔴 Urgent' : 'Normal'}
              </Badge>
            </div>
          </div>

          {selectedSupplier && (
            <div className="flex items-center px-4 self-stretch py-2">
              <div className="w-px h-full bg-border" />
            </div>
          )}

          {selectedSupplier && (
            <div className="flex-1 flex flex-col justify-center min-w-[180px]">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5 block">Supplier Address</label>
              <p className="text-xs text-foreground leading-relaxed">{selectedSupplier.address}, {selectedSupplier.mandal}, {selectedSupplier.district}, {selectedSupplier.state} - {selectedSupplier.pinCode}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[10px] text-muted-foreground">{selectedSupplier.contact}</span>
                <span className="text-[10px] text-muted-foreground">{selectedSupplier.email}</span>
              </div>
            </div>
          )}
        </div>

        <div className="px-5 pb-4">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 block">Notes (optional)</label>
          <Input className="h-8 text-sm" placeholder="Add any notes for this order..." value={notes} onChange={e => setNotes(e.target.value)} />
        </div>
      </div>

      {/* Medicines Table */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm mb-5">
        <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Order Items</h2>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {items.length === 0 ? 'Add medicines to this order' : `${items.length} medicines added · ${totalItems} with quantity · ${totalQty} total units`}
            </p>
          </div>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => setShowAddPanel(true)}>
            <Plus className="h-3 w-3" /> Add Medicine
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No medicines added yet</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Click "Add Medicine" to get started</p>
          </div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-8">#</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Medicine</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-24">Strength</th>
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-28">Category</th>
                  <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-20">Stock</th>
                  <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-28">
                    Quantity <span className="text-destructive">*</span>
                  </th>
                  <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-16"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((row, idx) => (
                  <tr key={row.medicineId} className={cn("border-b last:border-b-0 hover:bg-muted/20 transition-colors", row.stock < 50 && "bg-destructive/5")}>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-3 py-2.5">
                      <span className="font-medium text-foreground">{row.name}</span>
                    </td>
                    <td className="px-3 py-2.5 text-xs text-muted-foreground">{row.strength} {row.unit}</td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className="text-[10px] font-normal">{row.category}</Badge>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] font-semibold",
                        row.stock < 50 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      )}>
                        <Boxes className="h-2.5 w-2.5 mr-1" />
                        {row.stock}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      <Input
                        type="number"
                        min={0}
                        className="h-8 text-center text-sm w-24 mx-auto"
                        placeholder="0"
                        value={row.qty || ''}
                        onChange={e => updateQty(idx, Number(e.target.value))}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const nextInput = (e.target as HTMLElement)
                              .closest('tr')
                              ?.nextElementSibling
                              ?.querySelector('input[type="number"]') as HTMLInputElement;
                            nextInput?.focus();
                          }
                        }}
                      />
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive" onClick={() => removeMedicine(idx)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalItems > 0 && (
          <div className="px-4 py-2.5 border-t bg-primary/5 flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {totalItems} medicine{totalItems !== 1 ? 's' : ''} with quantity
            </span>
            <span className="text-xs font-semibold text-primary">{totalQty} total units</span>
          </div>
        )}
      </div>

      {/* Add Medicine Side Panel */}
      {showAddPanel && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowAddPanel(false); setShowInlineAdd(false); }} />
          <div className="relative w-full max-w-md bg-card border-l shadow-xl flex flex-col animate-in slide-in-from-right duration-200">
            {/* Panel Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Add Medicines</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">Click to add, then close panel</p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setShowAddPanel(false); setShowInlineAdd(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="px-4 py-3 border-b">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  className="h-8 pl-8 text-sm"
                  placeholder="Search medicines..."
                  value={medSearch}
                  onChange={e => { setMedSearch(e.target.value); setShowInlineAdd(false); }}
                  autoFocus
                />
              </div>
            </div>

            {/* Medicine List */}
            <div className="flex-1 overflow-auto">
              {filteredCatalog.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 px-4">
                  <Package className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">No medicines found for "{medSearch}"</p>
                  {!showInlineAdd ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 h-8 text-xs gap-1.5 border-dashed"
                      onClick={() => { setShowInlineAdd(true); setNewMedName(medSearch); }}
                    >
                      <PlusCircle className="h-3.5 w-3.5" /> Add "{medSearch}" as new medicine
                    </Button>
                  ) : (
                    <div className="w-full mt-3 p-3 rounded-lg border border-dashed bg-muted/20 space-y-2.5">
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">Add New Medicine</p>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">Name <span className="text-destructive">*</span></label>
                        <Input className="h-7 text-sm" value={newMedName} onChange={e => setNewMedName(e.target.value)} autoFocus />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">Strength <span className="text-destructive">*</span></label>
                          <Input className="h-7 text-sm" placeholder="e.g. 500" value={newMedStrength} onChange={e => setNewMedStrength(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-medium text-muted-foreground">Unit</label>
                          <Select value={newMedUnit} onValueChange={setNewMedUnit}>
                            <SelectTrigger className="h-7 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-medium text-muted-foreground">Category <span className="text-destructive">*</span></label>
                        <Select value={newMedCategory} onValueChange={setNewMedCategory}>
                          <SelectTrigger className="h-7 text-xs">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-1">
                        <Button variant="outline" size="sm" className="h-7 text-xs flex-1" onClick={() => setShowInlineAdd(false)}>Cancel</Button>
                        <Button size="sm" className="h-7 text-xs flex-1" onClick={handleInlineAddMedicine}>
                          <Plus className="h-3 w-3 mr-1" /> Add & Include
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                filteredCatalog.map(med => (
                  <button
                    key={med.id}
                    className="w-full text-left px-4 py-2.5 border-b hover:bg-muted/30 transition-colors flex items-center justify-between group"
                    onClick={() => addMedicine(med)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{med.name}</span>
                        <span className="text-xs text-muted-foreground">{med.strength}{med.unit}</span>
                      </div>
                      <p className="text-[10px] text-muted-foreground">{med.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={cn(
                        "text-[10px] font-medium",
                        med.stock < 50 ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground"
                      )}>
                        {med.stock} in stock
                      </Badge>
                      <Plus className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Panel Footer */}
            <div className="px-4 py-3 border-t bg-muted/10">
              <Button className="w-full h-8 text-sm" onClick={() => { setShowAddPanel(false); setShowInlineAdd(false); }}>
                Done — {items.length} medicine{items.length !== 1 ? 's' : ''} added
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
