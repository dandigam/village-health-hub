import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useSupplierList, useWarehouseInventory } from '@/hooks/useApiData';
import api from '@/services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Trash2, Check, Search, Package, FileText } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  medicineId: number | string;
  medicineName: string;
  medicineType: string;
  hsnNo: string;
  batchNo: string;
  expDate: string;
  quantity: number;
}

const emptyItem: InvoiceItem = {
  medicineId: '',
  medicineName: '',
  medicineType: '',
  hsnNo: '',
  batchNo: '',
  expDate: '',
  quantity: 0,
};

export default function NewInvoice() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = (user as any)?.warehouseId;

  
  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: inventory = [] } = useWarehouseInventory(warehouseId);

  // Invoice details
  
  const [supplierId, setSupplierId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [invoiceId, setInvoiceId] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('0.00');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Items
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [currentItem, setCurrentItem] = useState<InvoiceItem>({ ...emptyItem });
  const [medicineSearch, setMedicineSearch] = useState('');
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [saving, setSaving] = useState(false);

  const filteredMedicines = useMemo(() => {
    if (!medicineSearch.trim()) return [];
    const q = medicineSearch.toLowerCase();
    return inventory.filter((m: any) =>
      m.medicineName?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [inventory, medicineSearch]);

  const selectMedicine = (med: any) => {
    setCurrentItem(prev => ({
      ...prev,
      medicineId: med.medicineId || med.id,
      medicineName: med.medicineName,
      medicineType: med.medicineType || '',
    }));
    setMedicineSearch('');
    setShowMedicineDropdown(false);
  };

  const addRow = () => {
    if (!currentItem.medicineName || !currentItem.quantity) {
      toast.error('Medicine and Quantity are required');
      return;
    }
    setItems(prev => [...prev, { ...currentItem }]);
    setCurrentItem({ ...emptyItem });
  };

  const removeRow = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!supplierId) { toast.error('Select a supplier'); return; }
    if (items.length === 0) { toast.error('Add at least one item'); return; }

    setSaving(true);
    try {
      const payload = {
        supplierId: Number(supplierId),
        supplierId: Number(supplierId),
        warehouseId,
        paymentMode: paymentMode || undefined,
        invoiceId: invoiceId || undefined,
        invoiceAmount: parseFloat(invoiceAmount) || 0,
        invoiceDate,
        items: items.map(item => ({
          medicineId: Number(item.medicineId),
          hsnNo: item.hsnNo || undefined,
          batchNo: item.batchNo || undefined,
          expDate: item.expDate || undefined,
          quantity: Number(item.quantity),
        })),
      };
      await api.post('/supplier-orders', payload);
      toast.success('Stock entry saved successfully');
      navigate('/invoices');
    } catch (e) {
      toast.error('Failed to save stock entry');
    } finally {
      setSaving(false);
    }
  };

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

        {/* Add Items */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4"
        >
          <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Package className="w-4 h-4 text-primary" />
            Add Items
          </h2>

          {/* Add row form */}
          <div className="grid grid-cols-[1.5fr_0.7fr_0.7fr_0.8fr_0.6fr_auto] gap-2 items-end p-3 rounded-lg border border-dashed border-border/60 bg-muted/20 mb-3">
            <div className="space-y-1 relative">
              <Label className="text-[11px] font-medium">Medicine *</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                <Input
                  className="h-9 text-sm pl-8"
                  placeholder="Search Medicine"
                  value={currentItem.medicineName || medicineSearch}
                  onChange={e => {
                    setMedicineSearch(e.target.value);
                    setCurrentItem(prev => ({ ...prev, medicineName: '', medicineId: '' }));
                    setShowMedicineDropdown(true);
                  }}
                  onFocus={() => medicineSearch && setShowMedicineDropdown(true)}
                />
              </div>
              {showMedicineDropdown && filteredMedicines.length > 0 && (
                <div className="absolute z-50 top-full mt-1 left-0 right-0 bg-card border border-border rounded-lg shadow-xl max-h-48 overflow-y-auto">
                  {filteredMedicines.map((med: any) => (
                    <button
                      key={med.medicineId || med.id}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between"
                      onClick={() => selectMedicine(med)}
                    >
                      <span className="font-medium">{med.medicineName}</span>
                      <Badge variant="secondary" className="text-[10px] h-5">{med.medicineType}</Badge>
                    </button>
                  ))}
                </div>
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
            <Button className="h-9 text-xs px-3 mt-auto" onClick={addRow}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
            </Button>
          </div>

          {/* Items Table */}
          <div className="rounded-lg border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Medicine</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">HSN</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">Batch</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider">EXP Date</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-right">Quantity</TableHead>
                  <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground text-sm">
                      No items added yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="border-b border-border/40"
                    >
                      <TableCell className="text-sm">
                        <div className="font-medium">{item.medicineName}</div>
                        {item.medicineType && (
                          <Badge variant="secondary" className="text-[10px] h-4 mt-0.5">{item.medicineType}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.hsnNo || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.batchNo || '—'}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{item.expDate || '—'}</TableCell>
                      <TableCell className="text-right font-semibold text-sm">{item.quantity}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => removeRow(idx)}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
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
    </DashboardLayout>
  );
}
