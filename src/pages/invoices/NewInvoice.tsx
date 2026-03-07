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
import api, { API_BASE_URL } from '@/services/api';
import { ArrowLeft, Check, Search, Package, Pencil, PlusCircle, Save, Pill, Upload, X, FileImage, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type BannerType = 'success' | 'error';
interface BannerState { type: BannerType; message: string }
import { format } from 'date-fns';

interface InvoiceItem {
  medicineId: number | string;
  medicineName: string;
  medicineType: string;
  isAlreadyExist: boolean;
  // hsnNo removed
  batchNo: string;
  expDate: string;
  quantity: number;
  stock: number;
}

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Other'];

type PageMode = 'create' | 'view' | 'edit';

export default function NewInvoice() {
    // Uploaded documents state
    const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ documentId: string, name: string }>>([]);
    const [uploading, setUploading] = useState(false);
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
  const [banner, setBanner] = useState<BannerState | null>(null);

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
          // hsnNo removed
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          quantity: item.quantity || 0,
          stock: 0,
        })));
      }
    }).catch(() => setBanner({ type: 'error', message: 'Failed to load invoice.' }))
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
        batchNo: '', expDate: '',
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
    if (!newMedName.trim() || !newMedType) { setBanner({ type: 'error', message: 'Medicine name and type are required.' }); return; }
    setItems(prev => [...prev, {
      medicineId: '', medicineName: newMedName.trim(), medicineType: newMedType,
      isAlreadyExist: false, batchNo: '', expDate: '', quantity: 0, stock: 0,
    }]);
    setShowAddDialog(false);
    setBanner({ type: 'success', message: `"${newMedName.trim()}" added to the list.` });
    setNewMedName(''); setNewMedType('');
  };

  const handleSave = async () => {
    if (!supplierId) { setBanner({ type: 'error', message: 'Please select a supplier.' }); return; }
    const filledItems = items.filter(i => i.quantity > 0);
    if (filledItems.length === 0) { setBanner({ type: 'error', message: 'Enter quantity for at least one item.' }); return; }
    setBanner(null);
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
            isAlreadyExist: item.isAlreadyExist,
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
      const msg = id ? 'Stock entry updated successfully.' : 'Stock entry saved successfully.';
      setBanner({ type: 'success', message: msg });
      setTimeout(() => navigate('/invoices'), 1500);
    } catch { setBanner({ type: 'error', message: 'Failed to save stock entry.' }); }
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
  // Create: Medicine, Stock, Batch, Exp Date, Qty (editable)
  // Edit:   Medicine, Stock, Batch, Exp Date, Qty (editable) + Cancel, Update Stock
  // View:   Medicine, Stock, Batch, Exp Date, Qty (read-only)

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => navigate('/invoices')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        {id && <span className="text-sm text-slate-500 font-mono">#{id}</span>}
        {createdAt && <span className="text-sm text-slate-500 ml-auto">{new Date(createdAt).toLocaleDateString()}</span>}
        {isReadOnly && (
          <Button size="sm" variant="outline" className="ml-2 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => { setMode('edit'); navigate(`/invoices/${id}/edit`, { replace: true }); }}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      {/* Banner */}
      {banner && (
        <div className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border mb-3",
          banner.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        )}>
          {banner.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <p className="text-sm font-medium flex-1">{banner.message}</p>
          <button onClick={() => setBanner(null)} className="hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          {/* ORDER INFORMATION */}
          <div className="px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-blue-50/30">
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-3">Order Information</p>
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
              <div className="min-w-[180px]">
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Supplier *</Label>
                {canEdit ? (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-10 text-sm mt-1.5 bg-white border-slate-300 hover:border-blue-400 shadow-sm"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-1.5 h-10 flex items-center">{selectedSupplier?.name || '—'}</p>
                )}
              </div>
              <div className="min-w-[140px]">
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Payment Mode</Label>
                {canEdit ? (
                  <Select value={paymentMode} onValueChange={setPaymentMode}>
                    <SelectTrigger className="h-10 text-sm mt-1.5 bg-white border-slate-300 hover:border-blue-400 shadow-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {['cash', 'upi', 'bank_transfer', 'cheque', 'credit'].map(m => (
                        <SelectItem key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-1.5 h-10 flex items-center capitalize">{paymentMode || '—'}</p>
                )}
              </div>
              <div className="min-w-[130px]">
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Invoice No.</Label>
                {canEdit ? (
                  <div className="flex items-center gap-2">
                    <Input className="h-10 text-sm mt-1.5 bg-white border-slate-300 shadow-sm" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                    <label className={cn("flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm", !invoiceNumber && "opacity-50 pointer-events-none")}
                      style={{ marginTop: '0.5rem' }}>
                      <Upload className="w-4 h-4" />
                      Upload Document
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        disabled={!invoiceNumber || uploading}
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          setUploading(true);
                            for (const file of Array.from(files)) {
                            const formData = new FormData();
                            formData.append('file', file);
                            formData.append('invoiceNo', invoiceNumber);
                            try {
                              const token = localStorage.getItem('token');
                              const res = await fetch(`${API_BASE_URL}/documents/upload`, {
                                method: 'POST',
                                headers: {
                                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                },
                                body: formData,
                              });
                              if (!res.ok) throw new Error('Upload failed');
                              const doc = await res.json();
                              if (doc && doc.documentId && doc.documentName) {
                                setUploadedDocuments(prev => {
                                  // Prevent duplicate documentId
                                  if (prev.some(d => d.documentId === doc.documentId)) return prev;
                                  return [...prev, { documentId: doc.documentId, name: doc.documentName }];
                                });
                              }
                            } catch (err) {
                              setBanner({ type: 'error', message: 'Failed to upload document.' });
                            }
                          }
                          setUploading(false);
                          e.target.value = '';
                        }}
                      />
                      {uploading && <span className="ml-2 text-xs text-blue-500">Uploading...</span>}
                    </label>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-1.5 h-10 flex items-center">{invoiceNumber || '—'}</p>
                )}
              </div>
              <div className="min-w-[120px]">
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Amount (₹)</Label>
                {canEdit ? (
                  <Input className="h-10 text-sm mt-1.5 bg-white border-slate-300 shadow-sm" type="number" step="0.01" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-1.5 h-10 flex items-center">₹{Number(invoiceAmount).toLocaleString()}</p>
                )}
              </div>
              <div className="min-w-[150px]">
                <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Date *</Label>
                {canEdit ? (
                  <Input className="h-10 text-sm mt-1.5 bg-white border-slate-300 shadow-sm" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                ) : (
                  <p className="text-sm font-semibold text-slate-700 mt-1.5 h-10 flex items-center">{invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—'}</p>
                )}
              </div>
              {/* Attachments */}
              <div className="flex items-center gap-2 ml-auto pb-0.5">
                {invoiceFiles.map((f, idx) => (
                  <div key={idx} className="group relative flex items-center gap-1.5 border border-slate-200 rounded-lg bg-white px-2 py-1.5 text-xs cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all" onClick={() => setShowImagePreview(f.url)}>
                    <FileImage className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="max-w-[80px] truncate text-slate-600">{f.name}</span>
                    {canEdit && (
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-red-500" onClick={e => { e.stopPropagation(); removeFile(idx); }}>
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                {canEdit && (
                  <label className="flex items-center gap-1.5 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-600 cursor-pointer hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm">
                    <Upload className="w-4 h-4" />
                    Attach
                    <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileUpload} />
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* MEDICINE DETAILS */}
          {!supplierId && mode === 'create' ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-700 mb-1">Select a Supplier</p>
              <p className="text-xs text-slate-500">Choose a supplier above to load their medicine catalog</p>
            </div>
          ) : (
            <>
              {/* Medicine header */}
              <div className="px-4 py-3 border-b flex items-center gap-3 bg-white">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Medicine Details</p>
                {items.length > 0 && (
                  <span className="text-xs text-white bg-blue-500 px-2.5 py-0.5 rounded-full font-medium">{items.length} {items.length === 1 ? 'medicine' : 'medicines'}</span>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input className="h-9 text-sm pl-8 w-48 bg-slate-50 border-slate-200 focus:bg-white" placeholder="Filter medicines..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="outline" className="h-9 text-sm border-slate-300 hover:border-blue-400 hover:bg-blue-50" onClick={() => { setNewMedName(''); setNewMedType(''); setShowAddDialog(true); }}>
                      <PlusCircle className="w-4 h-4 mr-1.5" /> Add Medicine
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                      <Pill className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-700">{medSearch ? 'No medicines match your filter' : 'No medicines found'}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 border-slate-200">
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-600 w-12">#</th>
                        <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-600">Medicine</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-24 whitespace-nowrap">Stock</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-28 whitespace-nowrap">Batch</th>
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-36 whitespace-nowrap">Exp Date</th>
                        {/* HSN column removed */}
                        <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-28 whitespace-nowrap">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {filteredItems.map((item, idx) => {
                        const realIdx = items.indexOf(item);
                        const stock = item.stock;
                        const hasQty = item.quantity > 0;
                        const stockColor = stock <= 0 ? 'text-red-500 font-bold' : stock < 30 ? 'text-amber-600 font-semibold' : 'text-emerald-600 font-medium';
                        return (
                          <tr key={`${item.medicineId}-${idx}`} className={`transition-colors duration-150 hover:bg-blue-50/50 ${hasQty ? 'bg-emerald-50/60' : 'bg-white'}`}>
                            <td className="px-4 py-2.5 text-slate-500 text-sm font-medium">{idx + 1}</td>
                            <td className="px-4 py-2.5">
                              <span className="font-semibold text-slate-800">{item.medicineName}</span>
                              <span className="text-slate-500 ml-2 text-xs">{item.medicineType !== '-' ? item.medicineType : ''}</span>
                              {!item.isAlreadyExist && <span className="text-[10px] ml-2 px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">New</span>}
                            </td>
                            <td className={`px-4 py-2.5 text-center text-sm tabular-nums ${stockColor}`}>{stock}</td>
                            <td className="px-4 py-2.5 text-center">
                              {canEdit ? (
                                <Input className="w-24 h-9 mx-auto text-center text-sm rounded-lg border-slate-300 bg-slate-50 focus:bg-white shadow-sm" placeholder="Batch" value={item.batchNo} onChange={e => updateItem(realIdx, 'batchNo', e.target.value)} />
                              ) : (
                                <span className="text-slate-500 text-sm">{item.batchNo || '—'}</span>
                              )}
                            </td>
                            <td className="px-4 py-2.5 text-center">
                              {canEdit ? (
                                <Input className="w-36 h-9 mx-auto text-sm rounded-lg border-slate-300 bg-slate-50 focus:bg-white shadow-sm" type="date" value={item.expDate} onChange={e => updateItem(realIdx, 'expDate', e.target.value)} />
                              ) : (
                                <span className="text-slate-500 text-sm">{item.expDate || '—'}</span>
                              )}
                            </td>
                              
                            <td className="px-4 py-2.5 text-center">
                              {canEdit ? (
                                <Input className={`w-24 h-9 mx-auto text-center text-sm font-medium rounded-lg shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${hasQty ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200 text-emerald-700' : 'border-blue-300 bg-blue-50/50'}`} type="number" placeholder="0" value={item.quantity || ''} onChange={e => updateItem(realIdx, 'quantity', Number(e.target.value))} />
                              ) : (
                                <span className={`font-semibold ${item.quantity > 0 ? 'text-slate-800' : 'text-slate-400'}`}>{item.quantity}</span>
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
              <div className="flex items-center justify-between px-5 py-3.5 border-t bg-gradient-to-r from-slate-50 to-blue-50/30">
                <div className="flex items-center gap-5 text-sm text-slate-600">
                  <span>Items with qty: <strong className="text-slate-800 font-semibold">{totalWithQty}</strong></span>
                  <span>Total Qty: <strong className="text-slate-800 font-semibold">{totalQty}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => navigate('/invoices')}>
                    Cancel
                  </Button>
                  {canEdit && (
                    <Button size="sm" className="h-9 px-5 text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25" disabled={saving || totalWithQty === 0} onClick={handleSave}>
                      <Save className="mr-1.5 h-4 w-4" /> {saving ? 'Saving...' : id ? 'Update Stock' : 'Save Stock'}
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
