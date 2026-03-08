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
  
  const [showDocumentPreview, setShowDocumentPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'unknown'>('unknown');
  const [previewLoading, setPreviewLoading] = useState(false);

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
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          quantity: item.quantity || 0,
          stock: 0,
        })));
        // Load documents from response
        if (Array.isArray(inv.documents)) {
          setUploadedDocuments(inv.documents.map((doc: any) => ({
            documentId: doc.documentId,
            name: doc.documentName,
            documentUrl: doc.documentUrl || '',
          })));
        }
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
        documents: uploadedDocuments,
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
          {/* INVOICE INFORMATION — fieldset card style */}
          <div className="px-5 pt-5 pb-4 border-b">
            <fieldset className="border border-border/50 rounded-xl px-0 pt-0 pb-0 relative bg-background max-w-5xl">
              <legend className="text-xs font-semibold text-primary px-3 ml-3 tracking-wide">Invoice Information</legend>

              <div className="px-5 py-4">
                {/* Row 1: Supplier | Payment Mode | Invoice No. | Invoice Attach */}
                <div className="grid grid-cols-4 gap-0">
                  {/* Supplier */}
                  <div className="pr-5">
                    <Label className="text-[11px] text-muted-foreground font-medium">Supplier</Label>
                    {canEdit ? (
                      <Select value={supplierId} onValueChange={setSupplierId}>
                        <SelectTrigger className="h-9 text-sm mt-1 bg-background border-input hover:border-primary/50 shadow-sm"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-1 h-9 flex items-center">{selectedSupplier?.name || '—'}</p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div className="px-5 border-l border-border/40">
                    <Label className="text-[11px] text-muted-foreground font-medium">Payment Mode</Label>
                    {canEdit ? (
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger className="h-9 text-sm mt-1 bg-background border-input hover:border-primary/50 shadow-sm"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {['cash', 'upi', 'bank_transfer', 'cheque', 'credit'].map(m => (
                            <SelectItem key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-1 h-9 flex items-center capitalize">{paymentMode || '—'}</p>
                    )}
                  </div>

                  {/* Invoice No. */}
                  <div className="px-5 border-l border-border/40">
                    <Label className="text-[11px] text-muted-foreground font-medium">Invoice No.</Label>
                    {canEdit ? (
                      <Input className="h-9 text-sm mt-1 bg-background border-input shadow-sm" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-1 h-9 flex items-center">{invoiceNumber || '—'}</p>
                    )}
                  </div>

                  {/* Invoice Attach */}
                  <div className="pl-5 border-l border-border/40">
                    <Label className="text-[11px] text-muted-foreground font-medium">Invoice Attach</Label>
                    <div className="mt-1 space-y-1.5">
                      {uploadedDocuments.map((doc) => {
                        const nameLower = (doc.name || '').toLowerCase();
                        const isPdf = nameLower.endsWith('.pdf');
                        return (
                          <div key={doc.documentId} className="flex items-center gap-2">
                            <button
                              className="flex items-center gap-1.5 text-xs font-medium hover:underline truncate max-w-[150px]"
                              style={{ color: isPdf ? 'hsl(var(--primary))' : 'hsl(var(--warning))' }}
                              onClick={async () => {
                                const url = `${API_BASE_URL}/documents/download/${doc.documentId}`;
                                setShowDocumentPreview({ url, name: doc.name });
                                setPreviewLoading(true);
                                try {
                                  const token = localStorage.getItem('token');
                                  const res = await fetch(url, {
                                    headers: token ? { Authorization: `Bearer ${token}` } : {},
                                  });
                                  const contentType = res.headers.get('content-type') || '';
                                  const blob = await res.blob();
                                  const blobUrl = URL.createObjectURL(blob);
                                  setPreviewBlobUrl(blobUrl);
                                  if (contentType.includes('pdf') || nameLower.endsWith('.pdf')) {
                                    setPreviewType('pdf');
                                  } else {
                                    setPreviewType('image');
                                  }
                                } catch {
                                  setPreviewType('unknown');
                                } finally {
                                  setPreviewLoading(false);
                                }
                              }}
                              title="View document"
                            >
                              {isPdf ? <FileImage className="w-3.5 h-3.5 shrink-0 text-primary" /> : <FileImage className="w-3.5 h-3.5 shrink-0 text-warning" />}
                              <span className="truncate">{doc.name}</span>
                            </button>
                            {canEdit && (
                              <button
                                className="text-muted-foreground/50 hover:text-destructive shrink-0"
                                onClick={async () => {
                                  try {
                                    const token = localStorage.getItem('token');
                                    await fetch(`${API_BASE_URL}/documents/${doc.documentId}`, {
                                      method: 'DELETE',
                                      headers: {
                                        'Content-Type': 'application/json',
                                        ...(token ? { Authorization: `Bearer ${token}` } : {}),
                                      },
                                    });
                                    setUploadedDocuments(prev => prev.filter(d => d.documentId !== doc.documentId));
                                  } catch {
                                    setBanner({ type: 'error', message: 'Failed to delete document.' });
                                  }
                                }}
                                aria-label="Remove document"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {canEdit && (
                        <label className={cn(
                          "flex items-center gap-1.5 border border-dashed border-border rounded-lg px-3 py-1.5 text-xs text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary transition-all w-fit",
                          !invoiceNumber && "opacity-50 pointer-events-none"
                        )}>
                          <PlusCircle className="w-3.5 h-3.5" />
                          Add More
                          <input
                            type="file"
                            accept="image/*,.pdf"
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
                                      if (prev.some(d => d.documentId === doc.documentId)) return prev;
                                      return [...prev, { documentId: doc.documentId, name: doc.documentName }];
                                    });
                                  }
                                } catch {
                                  setBanner({ type: 'error', message: 'Failed to upload document.' });
                                }
                              }
                              setUploading(false);
                              e.target.value = '';
                            }}
                          />
                          {uploading && <span className="ml-1 text-primary">Uploading...</span>}
                        </label>
                      )}
                    </div>
                  </div>
                </div>

                {/* Row 2: Supplier contact | Amount | Date */}
                <div className="grid grid-cols-4 gap-0 mt-1">
                  {/* Supplier contact & address */}
                  <div className="pr-5 space-y-0.5 min-h-[2.5rem]">
                    {(selectedSupplier as any)?.contact && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>📞</span> {(selectedSupplier as any).contact}
                      </p>
                    )}
                    {selectedSupplier?.address && (
                      <p className="text-[11px] text-muted-foreground/80 leading-snug">{selectedSupplier.address}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="px-5 border-l border-border/40">
                    <Label className="text-[11px] text-muted-foreground font-medium">Amount (₹)</Label>
                    {canEdit ? (
                      <Input className="h-9 text-sm mt-1 bg-background border-input shadow-sm" type="number" step="0.01" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-1 h-9 flex items-center">₹{Number(invoiceAmount).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="px-5 border-l border-border/40">
                    <Label className="text-[11px] text-muted-foreground font-medium">Date *</Label>
                    {canEdit ? (
                      <Input className="h-9 text-sm mt-1 bg-background border-input shadow-sm" type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                    ) : (
                      <p className="text-sm font-semibold text-foreground mt-1 h-9 flex items-center">{invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—'}</p>
                    )}
                  </div>

                  <div className="pl-5 border-l border-border/40">{/* spacer */}</div>
                </div>
              </div>
            </fieldset>
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

      {/* Document Preview Dialog */}
      <Dialog open={!!showDocumentPreview} onOpenChange={() => { setShowDocumentPreview(null); if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); } setPreviewBlobUrl(null); setPreviewType('unknown'); }}>
        <DialogContent className="sm:max-w-3xl max-h-[90vh] p-0 overflow-hidden rounded-xl [&>button:last-child]:hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <FileImage className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-semibold text-foreground truncate">{showDocumentPreview?.name}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 ml-3">
              {showDocumentPreview && previewBlobUrl && (
                <>
                  <a
                    href={previewBlobUrl}
                    download={showDocumentPreview.name}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border rounded-md px-3 py-1.5 hover:bg-accent/50 transition-colors"
                  >
                    <Upload className="w-3 h-3 rotate-180" /> Download
                  </a>
                  <button
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 border border-border rounded-md px-3 py-1.5 hover:bg-accent/50 transition-colors"
                    onClick={() => {
                      if (previewType === 'pdf' && previewBlobUrl) {
                        const win = window.open(previewBlobUrl);
                        win?.addEventListener('load', () => win.print());
                      } else if (previewBlobUrl) {
                        const iframe = document.createElement('iframe');
                        iframe.style.display = 'none';
                        iframe.src = previewBlobUrl;
                        document.body.appendChild(iframe);
                        iframe.onload = () => { iframe.contentWindow?.print(); setTimeout(() => document.body.removeChild(iframe), 1000); };
                      }
                    }}
                  >
                    Print
                  </button>
                </>
              )}
              <button
                className="inline-flex items-center justify-center rounded-md h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => { setShowDocumentPreview(null); if (previewBlobUrl) { URL.revokeObjectURL(previewBlobUrl); } setPreviewBlobUrl(null); setPreviewType('unknown'); }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center bg-muted/10 min-h-[400px] max-h-[75vh] overflow-auto p-4">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="text-sm">Loading preview...</span>
              </div>
            ) : previewBlobUrl && previewType === 'pdf' ? (
              <iframe
                src={previewBlobUrl}
                className="w-full h-[70vh] rounded-lg border border-border shadow-sm"
                title={showDocumentPreview?.name}
              />
            ) : previewBlobUrl && previewType === 'image' ? (
              <img
                src={previewBlobUrl}
                alt={showDocumentPreview?.name}
                className="max-w-full max-h-[70vh] object-contain rounded-lg shadow-sm"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-8 w-8" />
                <p className="text-sm">Preview not available. Please download the file.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
