import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useSupplierList, useWarehouseInventory, WarehouseInventoryItem } from '@/hooks/useApiData';
import api from '@/services/api';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Trash2, Check, Search, Package, Pencil, PlusCircle, Save, Pill } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  tempId: number;
  medicineId: number | string;
  medicineName: string;
  medicineType: string;
  isAlreadyExist: boolean;
  hsnNo: string;
  batchNo: string;
  expDate: string;
  quantity: number;
}

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other'];

let nextTempId = 1;

const emptyItem = (): InvoiceItem => ({
  tempId: nextTempId++,
  medicineId: '',
  medicineName: '',
  medicineType: '',
  isAlreadyExist: true,
  hsnNo: '',
  batchNo: '',
  expDate: '',
  quantity: 0,
});

type PageMode = 'create' | 'view' | 'edit';

export default function NewInvoice() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditRoute = window.location.pathname.endsWith('/edit');
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;

  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: inventory = [] } = useWarehouseInventory(warehouseId);

  const [mode, setMode] = useState<PageMode>(id ? (isEditRoute ? 'edit' : 'view') : 'create');
  const isReadOnly = mode === 'view';
  const canEdit = mode === 'create' || mode === 'edit';

  const [supplierId, setSupplierId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('0.00');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [createdAt, setCreatedAt] = useState('');

  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItem>(emptyItem());
  const [editingTempId, setEditingTempId] = useState<number | null>(null);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showAddMedicineDialog, setShowAddMedicineDialog] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineType, setNewMedicineType] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const medicineInputRef = useRef<HTMLInputElement>(null);

  // Load existing invoice
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/invoices/${id}`, null).then((res: any) => {
      const inv = res.data || res;
      if (inv) {
        setSupplierId(String(inv.supplierId || ''));
        setPaymentMode(inv.paymentMode || '');
        setInvoiceId(inv.invoiceNumber || '');
        setInvoiceAmount(String(inv.invoiceAmount || '0.00'));
        setInvoiceDate(inv.invoiceDate || '');
        setCreatedAt(inv.createdAt || '');
        setItems((inv.items || []).map((item: any) => ({
          tempId: nextTempId++,
          medicineId: item.medicineId || '',
          medicineName: item.medicineName || '',
          medicineType: item.medicineType || '',
          isAlreadyExist: item.isAlreadyExist !== false,
          hsnNo: item.hsnNo || '',
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          quantity: item.quantity || 0,
        })));
      }
    }).catch(() => {
      toast.error('Failed to load invoice');
    }).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMedicineDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!medicineSearch.trim()) return [];
    const q = medicineSearch.toLowerCase();
    return inventory.filter((m: WarehouseInventoryItem) =>
      m.medicineName?.toLowerCase().includes(q)
    ).slice(0, 10);
  }, [inventory, medicineSearch]);

  const selectMedicine = (med: WarehouseInventoryItem) => {
    setCurrentItem(prev => ({ ...prev, medicineId: med.medicineId, medicineName: med.medicineName, medicineType: med.medicineType || '', isAlreadyExist: true }));
    setMedicineSearch('');
    setShowMedicineDropdown(false);
  };

  const handleAddNewMedicine = () => {
    setNewMedicineName(medicineSearch);
    setNewMedicineType('');
    setShowMedicineDropdown(false);
    setShowAddMedicineDialog(true);
  };

  const confirmAddNewMedicine = () => {
    if (!newMedicineName.trim() || !newMedicineType) { toast.error('Medicine name and type are required'); return; }
    setCurrentItem(prev => ({ ...prev, medicineId: '', medicineName: newMedicineName.trim(), medicineType: newMedicineType, isAlreadyExist: false }));
    setMedicineSearch('');
    setShowAddMedicineDialog(false);
    toast.success(`"${newMedicineName.trim()}" added as ${newMedicineType}`);
  };

  const addOrUpdateRow = useCallback(() => {
    if (!currentItem.medicineName || !currentItem.quantity) { toast.error('Medicine and Quantity are required'); return; }
    if (editingTempId !== null) {
      setItems(prev => prev.map(item => item.tempId === editingTempId ? { ...currentItem, tempId: editingTempId } : item));
      setEditingTempId(null);
      toast.success('Row updated');
    } else {
      const duplicate = items.find(i => i.medicineName === currentItem.medicineName && i.batchNo === currentItem.batchNo);
      if (duplicate) { toast.error('Duplicate medicine + batch combination'); return; }
      setItems(prev => [...prev, { ...currentItem }]);
    }
    setCurrentItem(emptyItem());
    medicineInputRef.current?.focus();
  }, [currentItem, editingTempId, items]);

  const editRow = (item: InvoiceItem) => { setCurrentItem({ ...item }); setEditingTempId(item.tempId); setMedicineSearch(''); };
  const cancelEdit = () => { setEditingTempId(null); setCurrentItem(emptyItem()); };
  const removeRow = (tempId: number) => { setItems(prev => prev.filter(i => i.tempId !== tempId)); if (editingTempId === tempId) cancelEdit(); };

  const handleKeyDown = (e: React.KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); addOrUpdateRow(); } };

  const handleSave = async () => {
    if (!supplierId) { toast.error('Select a supplier'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }
    setSaving(true);
    try {
      const payload: any = {
        supplierId: Number(supplierId), warehouseId,
        paymentMode: paymentMode || undefined, invoiceNumber: invoiceId || undefined,
        invoiceAmount: parseFloat(invoiceAmount) || 0, invoiceDate,
        items: items.map(item => {
          const base: any = { isAlreadyExist: item.isAlreadyExist, hsnNo: item.hsnNo || undefined, batchNo: item.batchNo || undefined, expDate: item.expDate || undefined, quantity: Number(item.quantity), warehouseId };
          if (item.isAlreadyExist) base.medicineId = Number(item.medicineId);
          else { base.medicineName = item.medicineName; base.medicineType = item.medicineType; }
          return base;
        }),
      };
      if (id) payload.id = Number(id);
      await api.post('/invoices', payload);
      toast.success(id ? 'Stock entry updated successfully' : 'Stock entry saved successfully');
      navigate('/invoices');
    } catch (e) { toast.error('Failed to save stock entry'); }
    finally { setSaving(false); }
  };

  const selectedSupplier = useMemo(() => suppliers.find((s: any) => String(s.id) === supplierId), [suppliers, supplierId]);
  const isEditing = editingTempId !== null;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  const pageTitle = mode === 'create' ? 'New Stock Entry' : mode === 'edit' ? 'Edit Stock Entry' : 'View Stock Entry';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
        {id && <span className="text-sm text-muted-foreground font-mono">#{id}</span>}
        {createdAt && <span className="text-sm text-muted-foreground ml-auto">{new Date(createdAt).toLocaleDateString()}</span>}
        {isReadOnly && (
          <Button size="sm" variant="outline" className="ml-2" onClick={() => { setMode('edit'); navigate(`/invoices/${id}/edit`, { replace: true }); }}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <>
          {/* Invoice Details */}
          <div className="border rounded-md bg-card px-3 py-2.5 mb-2.5">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Supplier *</Label>
                {canEdit ? (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">{selectedSupplier?.name || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Payment Mode</Label>
                {canEdit ? (
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="upi">UPI</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1 capitalize">{paymentMode || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Invoice ID</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-1" placeholder="Invoice ID" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-1">{invoiceId || '—'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Amount</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-1" type="number" step="0.01" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-1">₹{Number(invoiceAmount).toLocaleString()}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Invoice Date *</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-1" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-1">{invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Items Section */}
          <div className="border rounded-md bg-card overflow-hidden">
            {/* Sticky input row - only in edit/create mode */}
            {canEdit && (
              <div className={`sticky top-0 z-20 grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.8fr_0.6fr_auto] gap-2 items-end px-3 py-2.5 border-b ${isEditing ? 'bg-primary/[0.04]' : 'bg-muted/20'}`} onKeyDown={handleKeyDown}>
                {/* Medicine search */}
                <div className="relative" ref={dropdownRef}>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">Medicine *</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      ref={medicineInputRef}
                      className="h-8 text-sm pl-8"
                      placeholder="Search Medicine"
                      value={currentItem.medicineName || medicineSearch}
                      onChange={e => {
                        const val = e.target.value;
                        setMedicineSearch(val);
                        if (currentItem.medicineName) setCurrentItem(prev => ({ ...prev, medicineName: '', medicineId: '', isAlreadyExist: true }));
                        setShowMedicineDropdown(val.trim().length > 0);
                      }}
                      onFocus={() => { if (medicineSearch.trim()) setShowMedicineDropdown(true); }}
                    />
                  </div>
                  {showMedicineDropdown && (
                    <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border rounded-md shadow-lg max-h-56 overflow-y-auto">
                      {filteredMedicines.map((med: WarehouseInventoryItem) => (
                        <button key={med.medicineId} type="button" className="w-full text-left px-3 py-2 text-sm hover:bg-accent/20 transition-colors flex items-center justify-between border-b border-border/20 last:border-0" onClick={() => selectMedicine(med)}>
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-primary/60" />
                            <span className="font-medium">{med.medicineName}</span>
                            <Badge variant="secondary" className="text-[10px] h-5">{med.medicineType}</Badge>
                          </div>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${med.totalQty <= 0 ? 'bg-red-100 text-red-700' : med.totalQty < 30 ? 'bg-orange-100 text-orange-700' : 'bg-muted/50 text-muted-foreground'}`}>{med.totalQty ?? 0} in stock</span>
                        </button>
                      ))}
                      {medicineSearch.trim() && filteredMedicines.length === 0 && <div className="p-3 text-center text-sm text-muted-foreground">No medicines found</div>}
                      {medicineSearch.trim() && (
                        <button type="button" className="w-full text-left px-3 py-2.5 text-sm font-semibold text-primary hover:bg-accent/20 flex items-center gap-2 border-t" onClick={handleAddNewMedicine}>
                          <PlusCircle className="w-4 h-4" /> Add "{medicineSearch.trim()}" as new medicine
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">Type</Label>
                  {currentItem.isAlreadyExist && currentItem.medicineType ? (
                    <Input className="h-8 text-sm bg-muted/30" value={currentItem.medicineType} readOnly />
                  ) : (
                    <Select value={currentItem.medicineType} onValueChange={v => setCurrentItem(prev => ({ ...prev, medicineType: v }))}>
                      <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Type" /></SelectTrigger>
                      <SelectContent>{MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">HSN</Label>
                  <Input className="h-8 text-sm" placeholder="HSN" value={currentItem.hsnNo} onChange={e => setCurrentItem(prev => ({ ...prev, hsnNo: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">Batch</Label>
                  <Input className="h-8 text-sm" placeholder="Batch" value={currentItem.batchNo} onChange={e => setCurrentItem(prev => ({ ...prev, batchNo: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">EXP Date</Label>
                  <Input className="h-8 text-sm" type="date" value={currentItem.expDate} onChange={e => setCurrentItem(prev => ({ ...prev, expDate: e.target.value }))} />
                </div>
                <div>
                  <Label className="text-[10px] font-medium text-muted-foreground uppercase mb-0.5 block">Qty *</Label>
                  <Input className="h-8 text-sm" type="number" placeholder="0" value={currentItem.quantity || ''} onChange={e => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
                </div>
                <div className="flex gap-1 mt-auto">
                  <Button size="sm" className="h-8 text-xs px-3" onClick={addOrUpdateRow}>
                    {isEditing ? <><Check className="w-3.5 h-3.5 mr-1" /> Update</> : <><Plus className="w-3.5 h-3.5 mr-1" /> Add</>}
                  </Button>
                  {isEditing && <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={cancelEdit}>Cancel</Button>}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="overflow-auto max-h-[calc(100vh-380px)]">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left font-medium text-xs w-10">#</th>
                    <th className="px-3 py-2 text-left font-medium text-xs">Medicine</th>
                    <th className="px-3 py-2 text-left font-medium text-xs">Type</th>
                    <th className="px-3 py-2 text-left font-medium text-xs">HSN</th>
                    <th className="px-3 py-2 text-left font-medium text-xs">Batch</th>
                    <th className="px-3 py-2 text-left font-medium text-xs">EXP Date</th>
                    <th className="px-3 py-2 text-right font-medium text-xs">Qty</th>
                    {canEdit && <th className="px-3 py-2 text-center font-medium text-xs w-20">Action</th>}
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={canEdit ? 8 : 7} className="py-10 text-center">
                        <Package className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">{isReadOnly ? 'No items in this invoice' : 'Search a medicine above to begin'}</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, idx) => {
                      const zebra = idx % 2 === 1 ? 'bg-muted/15' : '';
                      const editing = editingTempId === item.tempId;
                      return (
                        <tr key={item.tempId} className={`border-b last:border-b-0 hover:bg-accent/30 transition-colors ${editing ? 'bg-primary/5 ring-1 ring-primary/20' : zebra}`}>
                          <td className="px-3 py-1.5 text-muted-foreground text-xs">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-medium">
                            {item.medicineName}
                            {!item.isAlreadyExist && <Badge className="text-[9px] h-4 ml-1.5 bg-primary/10 text-primary border-primary/20">New</Badge>}
                          </td>
                          <td className="px-3 py-1.5 text-muted-foreground">{item.medicineType || '—'}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{item.hsnNo || '—'}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{item.batchNo || '—'}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{item.expDate || '—'}</td>
                          <td className="px-3 py-1.5 text-right font-bold">{item.quantity}</td>
                          {canEdit && (
                            <td className="px-3 py-1.5 text-center">
                              <div className="flex items-center justify-center gap-0.5">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => editRow(item)}><Pencil className="w-3.5 h-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeRow(item.tempId)}><Trash2 className="w-3.5 h-3.5" /></Button>
                              </div>
                            </td>
                          )}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Items: <strong className="text-foreground">{items.length}</strong></span>
                <span className="text-muted-foreground">Total Qty: <strong className="text-foreground">{totalQty}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => navigate('/invoices')}>
                  {isReadOnly ? 'Back' : 'Cancel'}
                </Button>
                {canEdit && (
                  <Button size="sm" disabled={saving || items.length === 0} onClick={handleSave}>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? 'Saving...' : id ? 'Update Stock' : 'Save Stock'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add New Medicine Dialog */}
      <Dialog open={showAddMedicineDialog} onOpenChange={setShowAddMedicineDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Add New Medicine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Medicine Name *</Label>
              <Input className="h-8 text-sm mt-1" value={newMedicineName} onChange={e => setNewMedicineName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Medicine Type *</Label>
              <Select value={newMedicineType} onValueChange={setNewMedicineType}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>{MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddMedicineDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={confirmAddNewMedicine}><Check className="w-3.5 h-3.5 mr-1" /> Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
