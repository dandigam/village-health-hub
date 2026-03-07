import { useState, useMemo, useEffect } from 'react';
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
import { ArrowLeft, Check, Search, Package, Pencil, PlusCircle, Save, Pill, Upload, X, FileImage } from 'lucide-react';
import { format } from 'date-fns';

interface InvoiceItem {
  medicineId: number | string;
  medicineName: string;
  medicineType: string;
  isAlreadyExist: boolean;
  hsnNo: string;
  batchNo: string;
  expDate: string;
  quantity: number;
  stock: number;
}

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other'];

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

  // Order Info
  const [supplierId, setSupplierId] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('0.00');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [createdAt, setCreatedAt] = useState('');

  // Medicine grid
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new medicine dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedType, setNewMedType] = useState('');
  const [invoiceFiles, setInvoiceFiles] = useState<{ name: string; url: string; file?: File }[]>([]);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const selectedSupplier = useMemo(() => suppliers.find((s: any) => String(s.id) === supplierId), [suppliers, supplierId]);

  // Load existing invoice
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/invoices/${id}`, null).then((res: any) => {
      const inv = res.data || res;
      if (inv) {
        setSupplierId(String(inv.supplierId || ''));
        setPaymentMode(inv.paymentMode || '');
        setInvoiceNumber(inv.invoiceNumber || '');
        setInvoiceAmount(String(inv.invoiceAmount || '0.00'));
        setInvoiceDate(inv.invoiceDate || '');
        setCreatedAt(inv.createdAt || '');
        setItems((inv.items || []).map((item: any) => ({
          medicineId: item.medicineId || '',
          medicineName: item.medicineName || '',
          medicineType: item.medicineType || '',
          isAlreadyExist: item.isAlreadyExist !== false,
          hsnNo: item.hsnNo || '',
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          quantity: item.quantity || 0,
          stock: 0,
        })));
      }
    }).catch(() => toast.error('Failed to load invoice'))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-populate medicines when supplier changes (create mode)
  useEffect(() => {
    if (mode !== 'create' || !supplierId) { if (mode === 'create') setItems([]); return; }
    const supplier = suppliers.find((s: any) => String(s.id) === supplierId);
    const meds = (supplier as any)?.medicines ?? [];
    setItems(meds.map((m: any) => {
      const inv = inventory.find((i: WarehouseInventoryItem) => i.medicineId === m.id);
      return {
        medicineId: m.id,
        medicineName: m.name || m.medicineName || '-',
        medicineType: m.category || m.medicineType || '-',
        isAlreadyExist: true,
        hsnNo: '', batchNo: '', expDate: '',
        quantity: 0,
        stock: inv?.totalQty ?? 0,
      };
    }));
  }, [supplierId, suppliers, mode, inventory]);

  // Update stock values
  useEffect(() => {
    if (mode !== 'create') return;
    setItems(prev => prev.map(item => {
      const inv = inventory.find((i: WarehouseInventoryItem) => i.medicineId === Number(item.medicineId));
      return { ...item, stock: inv?.totalQty ?? 0 };
    }));
  }, [inventory, mode]);

  const updateItem = (idx: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => { const next = [...prev]; next[idx] = { ...next[idx], [field]: value }; return next; });
  };

  const filteredItems = useMemo(() => {
    if (!medSearch.trim()) return items;
    const q = medSearch.toLowerCase();
    return items.filter(m => m.medicineName.toLowerCase().includes(q) || m.medicineType.toLowerCase().includes(q));
  }, [items, medSearch]);

  const handleAddNewMedicine = () => {
    if (!newMedName.trim() || !newMedType) { toast.error('Name and type required'); return; }
    setItems(prev => [...prev, {
      medicineId: '', medicineName: newMedName.trim(), medicineType: newMedType,
      isAlreadyExist: false, hsnNo: '', batchNo: '', expDate: '', quantity: 0, stock: 0,
    }]);
    setShowAddDialog(false);
    toast.success(`"${newMedName.trim()}" added`);
    setNewMedName(''); setNewMedType('');
  };

  const handleSave = async () => {
    if (!supplierId) { toast.error('Select a supplier'); return; }
    const filledItems = items.filter(i => i.quantity > 0);
    if (filledItems.length === 0) { toast.error('Enter quantity for at least one item'); return; }
    setSaving(true);
    try {
      const payload: any = {
        supplierId: Number(supplierId), warehouseId,
        paymentMode: paymentMode || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceAmount: parseFloat(invoiceAmount) || 0,
        invoiceDate,
        items: filledItems.map(item => {
          const base: any = {
            isAlreadyExist: item.isAlreadyExist, hsnNo: item.hsnNo || undefined,
            batchNo: item.batchNo || undefined, expDate: item.expDate || undefined,
            quantity: Number(item.quantity), warehouseId,
          };
          if (item.isAlreadyExist) base.medicineId = Number(item.medicineId);
          else { base.medicineName = item.medicineName; base.medicineType = item.medicineType; }
          return base;
        }),
      };
      if (id) payload.id = Number(id);
      await api.post('/invoices', payload);
      toast.success(id ? 'Stock entry updated' : 'Stock entry saved');
      navigate('/invoices');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const totalWithQty = items.filter(i => i.quantity > 0).length;
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const pageTitle = mode === 'create' ? 'New Stock Entry' : mode === 'edit' ? 'Edit Stock Entry' : 'View Invoice';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const url = URL.createObjectURL(file);
      setInvoiceFiles(prev => [...prev, { name: file.name, url, file }]);
    });
    e.target.value = '';
  };
  const removeFile = (idx: number) => {
    setInvoiceFiles(prev => {
      const next = [...prev];
      if (next[idx].url.startsWith('blob:')) URL.revokeObjectURL(next[idx].url);
      next.splice(idx, 1);
      return next;
    });
  };

  // ── Column config per mode ──
  // Create: Medicine, Stock, Batch, Exp Date, HSN, Qty (editable)
  // Edit:   Medicine, Stock, Batch, Exp Date, HSN, Qty (editable) + Cancel, Update Stock
  // View:   Medicine, Stock, Batch, Exp Date, HSN, Qty (read-only)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
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
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          {/* ORDER INFORMATION */}
          <div className="px-4 py-3 border-b">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2.5">Order Information</p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              <div className="min-w-[160px]">
                <Label className="text-[11px] text-muted-foreground">Supplier *</Label>
                {canEdit ? (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">{selectedSupplier?.name || '—'}</p>
                )}
              </div>
              <div className="min-w-[130px]">
                <Label className="text-[11px] text-muted-foreground">Payment Mode</Label>
                {canEdit ? (
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {['cash', 'upi', 'bank_transfer', 'cheque', 'credit'].map(m => (
                        <SelectItem key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center capitalize">{paymentMode || '—'}</p>
                )}
              </div>
              <div className="min-w-[110px]">
                <Label className="text-[11px] text-muted-foreground">Invoice No.</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-0.5" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">{invoiceNumber || '—'}</p>
                )}
              </div>
              <div className="min-w-[100px]">
                <Label className="text-[11px] text-muted-foreground">Amount (₹)</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-0.5" type="number" step="0.01" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">₹{Number(invoiceAmount).toLocaleString()}</p>
                )}
              </div>
              <div className="min-w-[140px]">
                <Label className="text-[11px] text-muted-foreground">Date *</Label>
                {canEdit ? (
                  <Input className="h-8 text-sm mt-0.5" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">{invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—'}</p>
                )}
              </div>
              {/* Attachments */}
              <div className="flex items-center gap-1.5 ml-auto pb-0.5">
                {invoiceFiles.map((f, idx) => (
                  <div key={idx} className="group relative flex items-center gap-1 border rounded bg-muted/30 px-1.5 py-1 text-[11px] cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setShowImagePreview(f.url)}>
                    <FileImage className="w-3 h-3 text-primary shrink-0" />
                    <span className="max-w-[80px] truncate">{f.name}</span>
                    {canEdit && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); removeFile(idx); }}>
                        <X className="w-2.5 h-2.5" />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <label className="flex items-center gap-1 border border-dashed rounded px-2 py-1 text-[11px] text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
                    <Upload className="w-3 h-3" />
                    Attach
                    <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* MEDICINE DETAILS */}
          {!supplierId && mode === 'create' ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Select a supplier to load their medicine catalog</p>
            </div>
          ) : (
            <>
              {/* Medicine header */}
              <div className="px-4 py-2 border-b flex items-center gap-3">
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Medicine Details</p>
                {items.length > 0 && (
                  <Badge variant="secondary" className="text-[11px] px-2 py-0 h-5">{medSearch ? `${filteredItems.length} of ${items.length}` : `${items.length} medicines`}</Badge>
                )}
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="h-8 text-sm pl-8 w-48" placeholder="Filter medicines..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setNewMedName(''); setNewMedType(''); setShowAddDialog(true); }}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Medicine
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14">
                    <Pill className="h-8 w-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm text-muted-foreground">{medSearch ? 'No medicines match your filter' : 'No medicines found'}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                      <tr className="border-b">
                        <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-10">#</th>
                        <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Medicine</th>
                        <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">Stock</th>
                        <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-28">Batch</th>
                        <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-36">Exp Date</th>
                        <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">HSN</th>
                        <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item, idx) => {
                        const realIdx = items.indexOf(item);
                        const stock = item.stock;
                        const hasQty = item.quantity > 0;
                        const stockColor = stock <= 0 ? 'text-destructive font-bold' : stock < 30 ? 'text-orange-600 font-semibold' : 'text-muted-foreground';
                        const zebra = idx % 2 === 1 ? 'bg-muted/10' : '';
                        const rowBg = hasQty ? 'bg-primary/5' : zebra;
                        return (
                          <tr key={`${item.medicineId}-${idx}`} className={`border-b last:border-b-0 hover:bg-accent/20 transition-colors ${rowBg}`}>
                            <td className="px-3 py-1.5 text-muted-foreground text-xs">{idx + 1}</td>
                            <td className="px-3 py-1.5">
                              <span className="font-medium">{item.medicineName}</span>
                              <span className="text-muted-foreground ml-2 text-xs">{item.medicineType !== '-' ? item.medicineType : ''}</span>
                              {!item.isAlreadyExist && <Badge className="text-[9px] h-4 ml-1.5 bg-primary/10 text-primary border-primary/20">New</Badge>}
                            </td>
                            <td className={`px-3 py-1.5 text-center text-xs ${stockColor}`}>{stock}</td>
                            <td className="px-3 py-1.5 text-center">
                              {canEdit ? (
                                <Input className="w-20 h-7 mx-auto text-center text-xs" placeholder="Batch" value={item.batchNo} onChange={e => updateItem(realIdx, 'batchNo', e.target.value)} />
                              ) : (
                                <span className="text-muted-foreground text-xs">{item.batchNo || '—'}</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {canEdit ? (
                                <Input className="w-32 h-7 mx-auto text-xs" type="date" value={item.expDate} onChange={e => updateItem(realIdx, 'expDate', e.target.value)} />
                              ) : (
                                <span className="text-muted-foreground text-xs">{item.expDate || '—'}</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {canEdit ? (
                                <Input className="w-16 h-7 mx-auto text-center text-xs" placeholder="HSN" value={item.hsnNo} onChange={e => updateItem(realIdx, 'hsnNo', e.target.value)} />
                              ) : (
                                <span className="text-muted-foreground text-xs">{item.hsnNo || '—'}</span>
                              )}
                            </td>
                            <td className="px-3 py-1.5 text-center">
                              {canEdit ? (
                                <Input className={`w-16 h-7 mx-auto text-center text-xs ${hasQty ? 'border-primary/50 bg-primary/5' : ''}`} type="number" placeholder="0" value={item.quantity || ''} onChange={e => updateItem(realIdx, 'quantity', Number(e.target.value))} />
                              ) : (
                                <span className={`font-semibold ${item.quantity > 0 ? 'text-foreground' : 'text-muted-foreground'}`}>{item.quantity}</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Items with qty: <strong className="text-foreground">{totalWithQty}</strong></span>
                  <span>Total Qty: <strong className="text-foreground">{totalQty}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-4 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/invoices')}>
                    {isReadOnly ? 'Back' : 'Cancel'}
                  </Button>
                  {canEdit && (
                    <Button size="sm" className="h-8 px-5 text-xs" disabled={saving || totalWithQty === 0} onClick={handleSave}>
                      <Save className="mr-1.5 h-3.5 w-3.5" /> {saving ? 'Saving...' : id ? 'Update Stock' : 'Save Stock'}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Add New Medicine Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Add New Medicine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs text-muted-foreground">Medicine Name *</Label>
              <Input className="h-8 text-sm mt-1" value={newMedName} onChange={e => setNewMedName(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Type *</Label>
              <Select value={newMedType} onValueChange={setNewMedType}>
                <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent>{MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button size="sm" onClick={handleAddNewMedicine}><Check className="w-3.5 h-3.5 mr-1" /> Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!showImagePreview} onOpenChange={() => setShowImagePreview(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] p-2">
          <DialogHeader><DialogTitle className="text-sm">Invoice Preview</DialogTitle></DialogHeader>
          {showImagePreview && (
            <div className="flex items-center justify-center overflow-auto max-h-[70vh]">
              {showImagePreview.endsWith('.pdf') ? (
                <iframe src={showImagePreview} className="w-full h-[65vh] rounded border" />
              ) : (
                <img src={showImagePreview} alt="Invoice" className="max-w-full max-h-[65vh] object-contain rounded" />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
