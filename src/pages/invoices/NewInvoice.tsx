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
import { ArrowLeft, Plus, Trash2, Check, Search, Package, FileText, Pencil, PlusCircle, ShoppingCart, Hash, Pill } from 'lucide-react';
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

  const editingInvoice = (location.state as any)?.invoice || null;
  const isEditMode = !!editingInvoice;

  const [supplierId, setSupplierId] = useState(editingInvoice?.supplierId ? String(editingInvoice.supplierId) : '');
  const [paymentMode, setPaymentMode] = useState(editingInvoice?.paymentMode || '');
  const [invoiceId, setInvoiceId] = useState(editingInvoice?.invoiceNumber || '');
  const [invoiceAmount, setInvoiceAmount] = useState(editingInvoice?.invoiceAmount ? String(editingInvoice.invoiceAmount) : '0.00');
  const [invoiceDate, setInvoiceDate] = useState(editingInvoice?.invoiceDate || format(new Date(), 'yyyy-MM-dd'));

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
      setItems(prev => prev.map(item =>
        item.tempId === editingTempId ? { ...currentItem, tempId: editingTempId } : item
      ));
      setEditingTempId(null);
      toast.success('Row updated');
    } else {
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

      await api.post('/invoices', payload);
      toast.success(isEditMode ? 'Stock entry updated successfully' : 'Stock entry saved successfully');
      navigate('/invoices');
    } catch (e) {
      toast.error('Failed to save stock entry');
    } finally {
      setSaving(false);
    }
  };

  const isEditing = editingTempId !== null;
  const totalQty = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-6xl mx-auto">
        {/* Header with gradient accent */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10 rounded-xl border-border/60 shadow-sm hover:shadow-md transition-all"
            onClick={() => navigate('/invoices')}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditMode ? 'Edit Stock Entry' : 'New Stock Entry'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {isEditMode ? 'Update existing stock entry' : 'Record incoming stock from suppliers'}
            </p>
          </div>
          {items.length > 0 && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2 bg-primary/10 text-primary rounded-xl px-4 py-2 border border-primary/20">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm font-bold">{items.length} items</span>
                <span className="text-xs text-primary/70">· {totalQty} units</span>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Invoice Details Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="bg-gradient-to-r from-primary to-accent px-5 py-3.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">Invoice Details</h2>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier *</Label>
                <Select value={supplierId} onValueChange={setSupplierId}>
                  <SelectTrigger className="h-10 text-sm border-border/60 shadow-sm">
                    <SelectValue placeholder="Select Supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map((s: any) => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Payment Mode</Label>
                <Select value={paymentMode} onValueChange={setPaymentMode}>
                  <SelectTrigger className="h-10 text-sm border-border/60 shadow-sm">
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
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice ID</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" placeholder="Enter Invoice ID" value={invoiceId} onChange={e => setInvoiceId(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice Amount</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" type="number" step="0.01" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Invoice Date *</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Add Items Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border/60 rounded-xl overflow-hidden shadow-sm"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Package className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-sm font-bold text-white tracking-wide">Add Items</h2>
            </div>
            {items.length > 0 && (
              <Badge className="bg-white/20 text-white border-white/30 text-[11px] backdrop-blur-sm">
                {items.length} items · {totalQty} units
              </Badge>
            )}
          </div>
          <div className="p-5">
            {/* Sticky input row */}
            <div
              className={`sticky top-0 z-20 grid grid-cols-[1.5fr_0.7fr_0.7fr_0.7fr_0.8fr_0.6fr_auto] gap-2.5 items-end p-4 rounded-xl border-2 ${
                isEditing
                  ? 'border-primary/40 bg-primary/[0.04] shadow-[0_0_20px_hsl(var(--primary)/0.08)]'
                  : 'border-dashed border-border/60 bg-muted/20'
              } mb-4 transition-all duration-300`}
              onKeyDown={handleKeyDown}
            >
              {/* Medicine search */}
              <div className="space-y-1.5 relative" ref={dropdownRef}>
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Medicine *</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    ref={medicineInputRef}
                    className="h-10 text-sm pl-9 border-border/60 shadow-sm"
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
                  <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border/60 rounded-xl shadow-2xl max-h-56 overflow-y-auto">
                    {filteredMedicines.length > 0 ? (
                      filteredMedicines.map((med: WarehouseInventoryItem) => (
                        <button
                          key={med.medicineId}
                          type="button"
                          className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-primary/[0.05] transition-colors flex items-center justify-between gap-2 border-b border-border/20 last:border-0"
                          onClick={() => selectMedicine(med)}
                        >
                          <div className="flex items-center gap-2">
                            <Pill className="w-3.5 h-3.5 text-primary/60" />
                            <span className="font-medium">{med.medicineName}</span>
                            <Badge variant="secondary" className="text-[10px] h-5">{med.medicineType}</Badge>
                          </div>
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap font-medium bg-muted/50 px-2 py-0.5 rounded-full">
                            {med.totalQty ?? 0} in stock
                          </span>
                        </button>
                      ))
                    ) : null}

                    {medicineSearch.trim() && filteredMedicines.length === 0 && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No medicines found
                      </div>
                    )}

                    {medicineSearch.trim() && (
                      <button
                        type="button"
                        className="w-full text-left px-3.5 py-3 text-sm font-semibold text-primary hover:bg-primary/[0.05] transition-colors flex items-center gap-2 border-t border-border/50"
                        onClick={handleAddNewMedicine}
                      >
                        <PlusCircle className="w-4 h-4" />
                        Add "{medicineSearch.trim()}" as new medicine
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Type</Label>
                {currentItem.isAlreadyExist && currentItem.medicineType ? (
                  <Input className="h-10 text-sm bg-muted/30 border-border/60" value={currentItem.medicineType} readOnly />
                ) : (
                  <Select
                    value={currentItem.medicineType}
                    onValueChange={v => setCurrentItem(prev => ({ ...prev, medicineType: v }))}
                  >
                    <SelectTrigger className="h-10 text-sm border-border/60 shadow-sm">
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

              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">HSN No</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" placeholder="HSN" value={currentItem.hsnNo} onChange={e => setCurrentItem(prev => ({ ...prev, hsnNo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Batch No</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" placeholder="Batch" value={currentItem.batchNo} onChange={e => setCurrentItem(prev => ({ ...prev, batchNo: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">EXP Date</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" type="date" value={currentItem.expDate} onChange={e => setCurrentItem(prev => ({ ...prev, expDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Quantity *</Label>
                <Input className="h-10 text-sm border-border/60 shadow-sm" type="number" placeholder="Qty" value={currentItem.quantity || ''} onChange={e => setCurrentItem(prev => ({ ...prev, quantity: Number(e.target.value) }))} />
              </div>
              <div className="flex gap-1.5 mt-auto">
                <Button
                  className={`h-10 text-xs px-4 shadow-md ${isEditing ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90' : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90'} transition-opacity`}
                  onClick={addOrUpdateRow}
                >
                  {isEditing ? (
                    <><Check className="w-3.5 h-3.5 mr-1" /> Update</>
                  ) : (
                    <><Plus className="w-3.5 h-3.5 mr-1" /> Add</>
                  )}
                </Button>
                {isEditing && (
                  <Button variant="ghost" className="h-10 text-xs px-2" onClick={cancelEdit}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="rounded-xl border border-border/50 overflow-hidden max-h-[400px] overflow-y-auto shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-muted/60 to-muted/30 border-b border-border/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider w-10 text-foreground/60">
                      <Hash className="w-3 h-3" />
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Medicine</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Type</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">HSN</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Batch</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">EXP Date</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right text-foreground/60">Qty</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-center text-foreground/60">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-28 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <Pill className="w-6 h-6 text-primary/40" />
                          </div>
                          <p className="text-sm font-medium text-foreground/60">No items added yet</p>
                          <p className="text-xs text-muted-foreground">Search a medicine above to begin</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item, idx) => (
                      <motion.tr
                        key={item.tempId}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`border-b border-border/30 transition-all duration-200 ${
                          editingTempId === item.tempId
                            ? 'bg-primary/[0.06] ring-1 ring-primary/20'
                            : 'hover:bg-muted/20'
                        }`}
                      >
                        <TableCell>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-muted/50 text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-semibold text-foreground">{item.medicineName}</div>
                          {!item.isAlreadyExist && (
                            <Badge className="text-[9px] h-4 mt-0.5 bg-primary/10 text-primary border-primary/20">New</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] h-5 font-medium shadow-sm">{item.medicineType || '—'}</Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">{item.hsnNo || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">{item.batchNo || '—'}</TableCell>
                        <TableCell className="text-xs text-muted-foreground font-medium">{item.expDate || '—'}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-emerald-500/10 text-emerald-700 font-bold text-sm px-2">
                            {item.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-primary hover:bg-primary/10" onClick={() => editRow(item)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => removeRow(item.tempId)}>
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
          </div>
        </motion.div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex items-center justify-end gap-3 pt-2 pb-6"
        >
          <Button variant="outline" className="h-10 text-sm px-5 border-border/60 shadow-sm" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button
            className="h-10 text-sm px-8 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            onClick={handleSave}
            disabled={saving}
          >
            <Check className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : isEditMode ? 'Update Stock' : 'Save Stock'}
          </Button>
        </motion.div>
      </div>

      {/* Add New Medicine Dialog */}
      <Dialog open={showAddMedicineDialog} onOpenChange={setShowAddMedicineDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <PlusCircle className="w-4 h-4 text-primary" />
              </div>
              Add New Medicine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medicine Name *</Label>
              <Input className="h-10 text-sm border-border/60" value={newMedicineName} onChange={e => setNewMedicineName(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Medicine Type *</Label>
              <Select value={newMedicineType} onValueChange={setNewMedicineType}>
                <SelectTrigger className="h-10 text-sm border-border/60">
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
            <Button size="sm" className="bg-gradient-to-r from-primary to-accent hover:opacity-90" onClick={confirmAddNewMedicine}>
              <Check className="w-3.5 h-3.5 mr-1" /> Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
