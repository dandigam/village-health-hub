import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAuth } from '@/context/AuthContext';
import { useSupplierList, useWarehouseInventory, WarehouseInventoryItem } from '@/hooks/useApiData';
import api from '@/services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, Search, Package, FileText, Pencil, PlusCircle } from 'lucide-react';
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

export default function NewInvoice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;

  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: inventory = [] } = useWarehouseInventory(warehouseId);

  // Check if editing an existing invoice
  const editingInvoice = (location.state as any)?.invoice || null;
  const isEditMode = !!editingInvoice;

  // Invoice details
  const [supplierId, setSupplierId] = useState(editingInvoice?.supplierId ? String(editingInvoice.supplierId) : '');
  const [paymentMode, setPaymentMode] = useState(editingInvoice?.paymentMode || '');
  const [invoiceId, setInvoiceId] = useState(editingInvoice?.invoiceNumber || '');
  const [invoiceAmount, setInvoiceAmount] = useState(editingInvoice?.invoiceAmount ? String(editingInvoice.invoiceAmount) : '0.00');
  const [invoiceDate, setInvoiceDate] = useState(editingInvoice?.invoiceDate || format(new Date(), 'yyyy-MM-dd'));

  // Items - pre-fill from editing invoice
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (editingInvoice?.items?.length) {
      return editingInvoice.items.map((item: any) => ({
        tempId: nextTempId++,
        medicineId: item.medicineId || '',
        medicineName: item.medicineName || '',
        medicineType: item.medicineType || '',
        isAlreadyExist: item.isAlreadyExist !== false,
        hsnNo: item.hsnNo || '',
        batchNo: item.batchNo || '',
        expDate: item.expDate || '',
        quantity: item.quantity || 0,
      }));
    }
    return [];
  });
  const [currentItem, setCurrentItem] = useState<InvoiceItem>(emptyItem());
  const [editingTempId, setEditingTempId] = useState<number | null>(null);
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add new medicine dialog
  const [showAddMedicineDialog, setShowAddMedicineDialog] = useState(false);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineType, setNewMedicineType] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const medicineInputRef = useRef<HTMLInputElement>(null);

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
    setCurrentItem(prev => ({
      ...prev,
      medicineId: med.medicineId,
      medicineName: med.medicineName,
      medicineType: med.medicineType || '',
      isAlreadyExist: true,
    }));
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
    if (!newMedicineName.trim() || !newMedicineType) {
      toast.error('Medicine name and type are required');
      return;
    }
    setCurrentItem(prev => ({
      ...prev,
      medicineId: '',
      medicineName: newMedicineName.trim(),
      medicineType: newMedicineType,
      isAlreadyExist: false,
    }));
    setMedicineSearch('');
    setShowAddMedicineDialog(false);
    toast.success(`"${newMedicineName.trim()}" added as ${newMedicineType}`);
  };

  const addOrUpdateRow = useCallback(() => {
    if (!currentItem.medicineName || !currentItem.quantity) {
      toast.error('Medicine and Quantity are required');
      return;
    }

    if (editingTempId !== null) {
      // Update existing row
      setItems(prev => prev.map(item =>
        item.tempId === editingTempId ? { ...currentItem, tempId: editingTempId } : item
      ));
      setEditingTempId(null);
      toast.success('Row updated');
    } else {
      // Check duplicate medicine + batch
      const duplicate = items.find(
        i => i.medicineName === currentItem.medicineName && i.batchNo === currentItem.batchNo
      );
      if (duplicate) {
        toast.error('Duplicate medicine + batch combination');
        return;
      }
      setItems(prev => [...prev, { ...currentItem }]);
    }
    setCurrentItem(emptyItem());
    medicineInputRef.current?.focus();
  }, [currentItem, editingTempId, items]);

  const editRow = (item: InvoiceItem) => {
    setCurrentItem({ ...item });
    setEditingTempId(item.tempId);
    setMedicineSearch('');
  };

  const cancelEdit = () => {
    setEditingTempId(null);
    setCurrentItem(emptyItem());
  };

  const removeRow = (tempId: number) => {
    setItems(prev => prev.filter(i => i.tempId !== tempId));
    if (editingTempId === tempId) cancelEdit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOrUpdateRow();
    }
  };

  const handleSave = async () => {
    if (!supplierId) { toast.error('Select a supplier'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }

    setSaving(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        warehouseId,
        paymentMode: paymentMode || undefined,
        invoiceNumber: invoiceId || undefined,
        invoiceAmount: parseFloat(invoiceAmount) || 0,
        invoiceDate,
        items: items.map(item => {
          const base: any = {
            isAlreadyExist: item.isAlreadyExist,
            hsnNo: item.hsnNo || undefined,
            batchNo: item.batchNo || undefined,
            expDate: item.expDate || undefined,
            quantity: Number(item.quantity),
            warehouseId,
          };
          if (item.isAlreadyExist) {
            base.medicineId = Number(item.medicineId);
          } else {
            base.medicineName = item.medicineName;
            base.medicineType = item.medicineType;
          }
          return base;
        }),
      };

      if (isEditMode && editingInvoice?.id) {
        await api.put(`/invoices/${editingInvoice.id}`, payload);
        toast.success('Stock entry updated successfully');
      } else {
        await api.post('/invoices', payload);
        toast.success('Stock entry saved successfully');
      }
      navigate('/invoices');
    } catch (e) {
      toast.error('Failed to save stock entry');
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingTempId !== null;

  return (
    <DashboardLayout>
      <div className="space-y-4 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold tracking-tight">New Stock Entry</h1>
            <p className="text-xs text-muted-foreground">Record incoming stock from suppliers</p>
          </div>
        </div>

        {/* Invoice Details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            Invoice Details
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Supplier *</Label>
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s: any) => (
                    <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Payment Mode</Label>
              <Select value={paymentMode} onValueChange={setPaymentMode}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="credit">Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Invoice ID</Label>
              <Input className="h-9 text-sm" placeholder="Enter Invoice ID" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Invoice Amount</Label>
              <Input className="h-9 text-sm" type="number" step="0.01" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Invoice Date *</Label>
              <Input className="h-9 text-sm" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
            </div>
          </div>
        </motion.div>

        {/* Add Items - Sticky */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Add Items
            {items.length > 0 && (
              <Badge variant="secondary" className="text-[10px] h-5 ml-auto">{items.length} items</Badge>
            )}
          </h2>

          {/* Sticky input row */}
          <div className={`sticky top-0 z-20 grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.8fr_0.6fr_auto] gap-2 items-end p-3 rounded-lg border ${isEditing ? 'border-primary/50 bg-primary/5' : 'border-dashed border-border/60 bg-muted/20'} mb-3 transition-colors`}
               onKeyDown={handleKeyDown}
          >
            {/* Medicine search */}
            <div className="space-y-1 relative" ref={dropdownRef}>
              <Label className="text-[11px] font-medium">Medicine *</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  ref={medicineInputRef}
                  className="h-9 text-sm pl-8"
                  placeholder="Search Medicine"
                  value={currentItem.medicineName || medicineSearch}
                  onChange={e => {
                    const val = e.target.value;
                    setMedicineSearch(val);
                    if (currentItem.medicineName) {
                      setCurrentItem(prev => ({ ...prev, medicineName: '', medicineId: '', isAlreadyExist: true }));
                    }
                    setShowMedicineDropdown(val.trim().length > 0);
                  }}
                  onFocus={() => {
                    if (medicineSearch.trim()) setShowMedicineDropdown(true);
                  }}
                />
              </div>
              {showMedicineDropdown && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl max-h-56 overflow-y-auto">
                  {filteredMedicines.length > 0 ? (
                    filteredMedicines.map((med: WarehouseInventoryItem) => (
                      <button
                        key={med.medicineId}
                        type="button"
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between gap-2"
                        onClick={() => selectMedicine(med)}
                      >
                        <div>
                          <span className="font-medium">{med.medicineName}</span>
                          <Badge variant="secondary" className="text-[10px] h-5 ml-2">{med.medicineType}</Badge>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          {med.totalQty ?? 0} in stock
                        </span>
                      </button>
                    ))
                  ) : null}

                  {medicineSearch.trim() && filteredMedicines.length === 0 && (
                    <div className="p-3 text-center text-sm text-muted-foreground">
                      No medicines found
                    </div>
                  )}

                  {medicineSearch.trim() && (
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/5 transition-colors flex items-center gap-2 border-t border-border/50"
                      onClick={handleAddNewMedicine}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Add "{medicineSearch.trim()}" as new medicine
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Medicine Type - shown for new medicines */}
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">Type</Label>
              {currentItem.isAlreadyExist && currentItem.medicineType ? (
                <Input className="h-9 text-sm bg-muted/30" value={currentItem.medicineType} readOnly />
              ) : (
                <Select
                  value={currentItem.medicineType}
                  onValueChange={v => setCurrentItem(prev => ({ ...prev, medicineType: v }))}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICINE_TYPES.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] font-medium">HSN No</Label>
              <Input className="h-9 text-sm" placeholder="HSN" value={currentItem.hsnNo} onChange={e => setCurrentItem(prev => ({ ...prev, hsnNo: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">Batch No</Label>
              <Input className="h-9 text-sm" placeholder="Batch" value={currentItem.batchNo} onChange={e => setCurrentItem(prev => ({ ...prev, batchNo: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">EXP Date</Label>
              <Input className="h-9 text-sm" type="date" value={currentItem.expDate} onChange={e => setCurrentItem(prev => ({ ...prev, expDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium">Quantity *</Label>
              <Input className="h-9 text-sm" type="number" placeholder="Qty" value={currentItem.quantity || ''} onChange={e => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
            </div>
            <div className="flex gap-1.5 mt-auto">
              <Button className="h-9 text-xs px-3" onClick={addOrUpdateRow}>
                {isEditing ? (
                  <><Check className="w-3.5 h-3.5 mr-1" /> Update</>
                ) : (
                  <><Plus className="w-3.5 h-3.5 mr-1" /> Add Row</>
                )}
              </Button>
              {isEditing && (
                <Button variant="ghost" className="h-9 text-xs px-2" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider w-8">#</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Medicine</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Type</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">HSN</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Batch</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">EXP Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Qty</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground text-sm">
                      No items added yet. Search a medicine above to begin.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <motion.tr
                      key={item.tempId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`border-b border-border/40 transition-colors ${editingTempId === item.tempId ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                    >
                      <TableCell className="text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                      <TableCell className="text-sm">
                        <div className="font-medium">{item.medicineName}</div>
                        {!item.isAlreadyExist && (
                          <Badge variant="outline" className="text-[9px] h-4 mt-0.5 text-primary border-primary/30">New</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] h-5">{item.medicineType || '—'}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.hsnNo || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.batchNo || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.expDate || '—'}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={() => editRow(item)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeRow(item.tempId)}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </motion.div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-4">
          <Button variant="outline" className="h-9 text-sm" onClick={() => navigate('/invoices')}>Cancel</Button>
          <Button className="h-9 text-sm px-6 shadow-md" onClick={handleSave} disabled={saving}>
            <Check className="w-4 h-4 mr-1.5" />
            {saving ? 'Saving...' : 'Save Stock'}
          </Button>
        </div>
      </div>

      {/* Add New Medicine Dialog */}
      <Dialog open={showAddMedicineDialog} onOpenChange={setShowAddMedicineDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" />
              Add New Medicine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <Label className="text-xs font-medium">Medicine Name *</Label>
              <Input className="h-9 text-sm" value={newMedicineName} onChange={e => setNewMedicineName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">Medicine Type *</Label>
              <Select value={newMedicineType} onValueChange={setNewMedicineType}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  {MEDICINE_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddMedicineDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={confirmAddNewMedicine}>
              <Check className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
