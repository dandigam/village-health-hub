import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useAuth } from '@/context/AuthContext';
import { useSupplierList, useWarehouseInventory, useWarehouseDetail, WarehouseInventoryItem } from '@/hooks/useApiData';
import api, { API_BASE_URL } from '@/services/api';
import { ArrowLeft, Check, Search, Package, Pencil, PlusCircle, Save, Pill, Upload, X, FileImage, CheckCircle2, AlertCircle, Info, CalendarIcon, Phone, Mail, Banknote, CreditCard, Building2, Landmark, Wallet, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { DiscardChangesDialog } from '@/components/shared/DiscardChangesDialog';
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

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment', 'Other'];
const UNITS = ['mg', 'ml', 'gm', 'mcg', 'IU', 'units', '%'];

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
  const { data: warehouseDetail } = useWarehouseDetail(warehouseId);

  // Unsaved changes tracking
  const { isDirty, setDirty, confirmNavigation, showDiscardDialog, handleDiscard, handleCancel: handleDiscardCancel } = useUnsavedChanges();

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
  const [validationErrors, setValidationErrors] = useState<Record<number, { batch?: boolean; expDate?: boolean; expPast?: boolean }>>({});

  // Refs for auto-focus on batch fields
  const batchRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const lastAddedIdx = useRef<number | null>(null);

  // Add new medicine dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedType, setNewMedType] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('');
  const [newMedUnit, setNewMedUnit] = useState('');
  
  const [showDocumentPreview, setShowDocumentPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | 'unknown'>('unknown');
  const [previewLoading, setPreviewLoading] = useState(false);

  const selectedSupplier = useMemo(() => suppliers.find((s: any) => String(s.id) === supplierId), [suppliers, supplierId]);

  // Build full supplier address
  const supplierAddress = useMemo(() => {
    if (!selectedSupplier) return '';
    return [(selectedSupplier as any).address, (selectedSupplier as any).mandal, (selectedSupplier as any).district, (selectedSupplier as any).state].filter(Boolean).join(', ') + ((selectedSupplier as any).pinCode ? ` - ${(selectedSupplier as any).pinCode}` : '');
  }, [selectedSupplier]);

  // Build warehouse address
  const warehouseAddress = useMemo(() => {
    if (!warehouseDetail) return '';
    return [warehouseDetail.village, warehouseDetail.mandal, warehouseDetail.district, warehouseDetail.state].filter(Boolean).join(', ') + (warehouseDetail.pinCode ? ` - ${warehouseDetail.pinCode}` : '');
  }, [warehouseDetail]);

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
    setDirty(true);
  };

  const filteredItems = useMemo(() => {
    if (!medSearch.trim()) return items;
    const q = medSearch.toLowerCase();
    return items.filter(m => m.medicineName.toLowerCase().includes(q) || m.medicineType.toLowerCase().includes(q));
  }, [items, medSearch]);

  const handleAddNewMedicine = () => {
    if (!newMedName.trim() || !newMedType) { setBanner({ type: 'error', message: 'Medicine name and type are required.' }); return; }
    const newIdx = items.length;
    setItems(prev => [...prev, {
      medicineId: '', medicineName: newMedName.trim(), medicineType: newMedType,
      isAlreadyExist: false, batchNo: '', expDate: '', quantity: 0, stock: 0,
    }]);
    lastAddedIdx.current = newIdx;
    setShowAddDialog(false);
    setBanner({ type: 'success', message: `"${newMedName.trim()}" added to the list.` });
    setNewMedName(''); setNewMedType(''); setNewMedStrength(''); setNewMedUnit('');
  };

  // Auto-focus batch field when a new medicine is added
  useEffect(() => {
    if (lastAddedIdx.current !== null) {
      const idx = lastAddedIdx.current;
      lastAddedIdx.current = null;
      setTimeout(() => {
        batchRefs.current[idx]?.focus();
      }, 100);
    }
  }, [items.length]);

  const handleSave = async () => {
    if (!supplierId) { setBanner({ type: 'error', message: 'Please select a supplier.' }); return; }
    const filledItems = items.filter(i => i.quantity > 0);
    if (filledItems.length === 0) { setBanner({ type: 'error', message: 'Enter quantity for at least one item.' }); return; }
    
    // Validate batch & expiry for items with qty
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const errors: Record<number, { batch?: boolean; expDate?: boolean; expPast?: boolean }> = {};
    let hasErrors = false;
    items.forEach((item, idx) => {
      if (item.quantity <= 0) return;
      const errs: { batch?: boolean; expDate?: boolean; expPast?: boolean } = {};
      if (!item.batchNo.trim()) { errs.batch = true; hasErrors = true; }
      if (!item.expDate) { errs.expDate = true; hasErrors = true; }
      else {
        const exp = new Date(item.expDate);
        if (exp < today) { errs.expPast = true; hasErrors = true; }
      }
      if (Object.keys(errs).length > 0) errors[idx] = errs;
    });
    setValidationErrors(errors);
    if (hasErrors) { setBanner({ type: 'error', message: 'Please fill Batch No. and valid Expiry Date for all items with quantity.' }); return; }
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
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted transition-colors" onClick={() => confirmNavigation('/invoices')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-value">{pageTitle}</h1>
        {id && <span className="text-sm text-muted-foreground font-mono">#{id}</span>}
        {createdAt && <span className="text-sm text-muted-foreground ml-auto">{new Date(createdAt).toLocaleDateString()}</span>}
        {isReadOnly && (
          <Button size="sm" variant="outline" className="ml-2" onClick={() => { setMode('edit'); navigate(`/invoices/${id}/edit`, { replace: true }); }}>
            <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
          </Button>
        )}
      </div>

      {/* Banner */}
      {banner && (
        <div className={cn(
          "flex items-center gap-2.5 px-4 py-2.5 rounded-lg border mb-3",
          banner.type === 'success' ? 'bg-[hsl(var(--stock-ok-bg))] border-success/30 text-success' : 'bg-[hsl(var(--stock-critical-bg))] border-destructive/30 text-destructive'
        )}>
          {banner.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <AlertCircle className="h-4 w-4 shrink-0" />}
          <p className="text-sm font-medium flex-1">{banner.message}</p>
          <button onClick={() => setBanner(null)} className="hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="rounded-xl border border-[hsl(var(--card-raised-border))] bg-[hsl(var(--card-raised-bg))] overflow-hidden" style={{ boxShadow: 'var(--card-shadow-elevated)' }}>
          {/* INVOICE INFORMATION — fieldset card style */}
          <div className="px-3 pt-3 pb-2 border-b border-border/30 bg-[hsl(var(--card-surface-bg))]">
            <fieldset className="border border-[hsl(var(--field-border))] rounded-lg px-0 pt-0 pb-0 relative bg-[hsl(var(--card-raised-bg))]" style={{ boxShadow: '0 1px 4px hsl(var(--shadow-color) / 0.04)' }}>
              <legend className="text-[10px] font-bold text-primary px-2 ml-3 tracking-wider uppercase">Invoice Information</legend>

              <div className="px-3 py-2">
                {/* Row 1: Supplier | Payment Mode | Invoice No. | Invoice Attach */}
                <div className="grid gap-0" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr' }}>
                  {/* Supplier */}
                  <div className="pr-3">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Supplier <span className="text-destructive">*</span></Label>
                    {canEdit ? (
                      <Select value={supplierId} onValueChange={setSupplierId}>
                        <SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {suppliers.map((s: any) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-semibold text-value mt-1 h-7 flex items-center">{selectedSupplier?.name || '—'}</p>
                    )}
                  </div>

                  {/* Payment Mode */}
                  <div className="px-3 border-l border-border/40">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Payment Mode <span className="text-destructive">*</span></Label>
                    {canEdit ? (
                      <Select value={paymentMode} onValueChange={setPaymentMode}>
                        <SelectTrigger className="h-7 text-xs mt-1"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                        <SelectContent className="bg-popover z-50">
                          {[
                            { value: 'cash', label: 'Cash', icon: Banknote, color: 'text-icon-phone' },
                            { value: 'upi', label: 'UPI', icon: QrCode, color: 'text-icon-calendar' },
                            { value: 'bank_transfer', label: 'Bank Transfer', icon: Landmark, color: 'text-icon-building' },
                            { value: 'cheque', label: 'Cheque', icon: CreditCard, color: 'text-icon-id' },
                            { value: 'credit', label: 'Credit', icon: Wallet, color: 'text-icon-mail' },
                          ].map(m => (
                            <SelectItem key={m.value} value={m.value}>
                              <span className="flex items-center gap-2">
                                <m.icon className={`h-3.5 w-3.5 ${m.color}`} />
                                {m.label}
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-semibold text-value mt-1 h-7 flex items-center capitalize">{paymentMode || '—'}</p>
                    )}
                  </div>

                  {/* Invoice No. */}
                  <div className="px-3 border-l border-border/40">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Invoice No. <span className="text-destructive">*</span></Label>
                    {canEdit ? (
                      <Input className="h-7 text-xs mt-1" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                    ) : (
                      <p className="text-xs font-semibold text-value mt-1 h-7 flex items-center">{invoiceNumber || '—'}</p>
                    )}
                  </div>

                  {/* Invoice Attach */}
                  <div className="pl-3 border-l border-border/40 relative">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Invoice Attach</Label>
                    <div className="mt-1 space-y-0.5 max-h-[60px] overflow-y-auto premium-scroll flex flex-col items-center justify-center min-h-[40px]">
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
                          <Upload className="w-3.5 h-3.5" />
                          {uploadedDocuments.length > 0 ? 'Add More' : 'Upload'}
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

                {/* Row 2: Supplier Address | Amount | Date | Deliver To */}
                <div className="grid gap-0 mt-1.5 pt-1.5 border-t border-border/20" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr' }}>
                  {/* Supplier Full Address */}
                  <div className="pr-3 space-y-0 min-h-[1.75rem]">
                    {selectedSupplier && (
                      <>
                        <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Supplier Address</p>
                        <p className="text-xs font-semibold text-value leading-tight">{selectedSupplier.name}</p>
                        {(selectedSupplier as any)?.contact && (
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-1"><Phone className="h-3.5 w-3.5 text-icon-phone" /> {(selectedSupplier as any).contact}</p>
                        )}
                        {(selectedSupplier as any)?.email && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1"><Mail className="h-3.5 w-3.5 text-icon-mail" /> {(selectedSupplier as any).email}</p>
                        )}
                        <p className="text-[11px] mt-0.5 text-primary/70 italic leading-snug truncate" title={supplierAddress}>{supplierAddress || '-'}</p>
                      </>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="px-3 border-l border-border/40">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Amount (₹) <span className="text-destructive">*</span></Label>
                    {canEdit ? (
                      <Input className="h-7 text-xs mt-1" type="number" step="0.01" placeholder="0.00" value={invoiceAmount} onChange={e => { setInvoiceAmount(e.target.value); setDirty(true); }} />
                    ) : (
                      <p className="text-xs font-bold text-value mt-1 h-7 flex items-center">₹{Number(invoiceAmount).toLocaleString()}</p>
                    )}
                  </div>

                  {/* Date */}
                  <div className="px-3 border-l border-border/40">
                    <Label className="text-[10px] text-label font-semibold uppercase tracking-wide">Date <span className="text-destructive">*</span></Label>
                    {canEdit ? (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="outline" className={cn("h-7 text-xs mt-1 w-full justify-start text-left font-normal", !invoiceDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-1.5 h-3 w-3" />
                            {invoiceDate ? format(new Date(invoiceDate), 'dd-MM-yyyy') : 'dd-mm-yyyy'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 z-50" align="start">
                          <Calendar mode="single" selected={invoiceDate ? new Date(invoiceDate) : undefined} onSelect={(date) => { if (date) { setInvoiceDate(format(date, 'yyyy-MM-dd')); setDirty(true); } }} initialFocus />
                        </PopoverContent>
                      </Popover>
                    ) : (
                      <p className="text-xs font-semibold text-value mt-1 h-7 flex items-center">{invoiceDate ? format(new Date(invoiceDate), 'dd MMM yyyy') : '—'}</p>
                    )}
                  </div>

                  {/* Empty col for alignment */}
                  <div className="pl-3 border-l border-border/40" />
                </div>
              </div>
            </fieldset>
          </div>

          {/* MEDICINE DETAILS */}
          {!supplierId && mode === 'create' ? (
            <div className="flex flex-col items-center justify-center py-20 bg-[hsl(var(--card-raised-bg))]">
              <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--field-bg))] flex items-center justify-center mb-4 border border-border/30">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-semibold text-value mb-1">Select a Supplier</p>
              <p className="text-xs text-muted-foreground">Choose a supplier above to load their medicine catalog</p>
            </div>
          ) : (
            <>
              {/* Medicine header */}
              <div className="px-4 py-3 border-b border-border/30 flex items-center gap-3 bg-[hsl(var(--card-surface-bg))]">
                <p className="text-xs font-bold text-primary uppercase tracking-wider">Medicine Details</p>
                {items.length > 0 && (
                  <span className="text-[10px] text-primary-foreground bg-primary px-2.5 py-0.5 rounded-full font-semibold">{items.length} {items.length === 1 ? 'medicine' : 'medicines'}</span>
                )}
                <div className="ml-auto flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input className="h-8 text-xs pl-8 w-48" placeholder="Filter medicines..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                  </div>
                  {canEdit && (
                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => { setNewMedName(''); setNewMedType(''); setNewMedStrength(''); setNewMedUnit(''); setShowAddDialog(true); }}>
                      <PlusCircle className="w-3.5 h-3.5 mr-1" /> Add Medicine
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                {filteredItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-[hsl(var(--card-raised-bg))]">
                    <div className="h-16 w-16 rounded-2xl bg-[hsl(var(--field-bg))] flex items-center justify-center mb-4 border border-border/30">
                      <Pill className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-semibold text-value">{medSearch ? 'No medicines match your filter' : 'No medicines found'}</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b-2 border-primary/15 bg-muted/50">
                        <th className="px-4 py-2.5 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground w-12">#</th>
                        <th className="px-4 py-2.5 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground w-[35%]">Medicine</th>
                        <th className="px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Stock</th>
                        <th className="px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Batch</th>
                        <th className="px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Exp Date</th>
                        <th className="px-4 py-2.5 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Qty</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      {filteredItems.map((item, idx) => {
                        const realIdx = items.indexOf(item);
                        const stock = item.stock;
                        const hasQty = item.quantity > 0;
                        const stockColor = stock <= 0 ? 'text-destructive font-bold' : stock < 30 ? 'text-warning font-semibold' : 'text-success font-medium';
                        const errs = validationErrors[realIdx];
                        return (
                          <tr key={`${item.medicineId}-${idx}`} className={cn(
                            "transition-colors duration-150 hover:bg-primary/[0.03]",
                            hasQty ? 'bg-[hsl(var(--stock-ok-bg))]' : 'bg-[hsl(var(--card-raised-bg))]'
                          )}>
                            <td className="px-4 py-2 text-muted-foreground text-xs font-medium">{idx + 1}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-value text-sm">{item.medicineName}</span>
                                {!item.isAlreadyExist && <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">New</span>}
                              </div>
                              {item.medicineType && item.medicineType !== '-' && (
                                <span className="text-[10px] text-muted-foreground mt-0.5 inline-flex items-center gap-1">
                                  <Pill className="h-2.5 w-2.5" /> {item.medicineType}
                                </span>
                              )}
                            </td>
                            <td className={`px-4 py-2 text-center text-xs tabular-nums ${stockColor}`}>{stock}</td>
                            <td className="px-4 py-2 text-center">
                              {canEdit ? (
                                <div>
                                  <Input
                                    ref={(el) => { batchRefs.current[realIdx] = el; }}
                                    className={cn("w-24 h-8 mx-auto text-center text-xs", errs?.batch && "border-destructive ring-1 ring-destructive/30")}
                                    placeholder="Batch"
                                    value={item.batchNo}
                                    onChange={e => { updateItem(realIdx, 'batchNo', e.target.value); setValidationErrors(prev => { const n = { ...prev }; if (n[realIdx]) { delete n[realIdx].batch; if (!Object.keys(n[realIdx]).length) delete n[realIdx]; } return n; }); }}
                                  />
                                  {errs?.batch && <p className="text-[10px] text-destructive mt-0.5">Required</p>}
                                </div>
                              ) : (
                                <span className="text-value text-xs font-medium">{item.batchNo || '—'}</span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-center">
                              {canEdit ? (
                                <div>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button variant="outline" className={cn(
                                        "w-36 h-8 mx-auto text-xs justify-start text-left font-normal",
                                        !item.expDate && "text-muted-foreground",
                                        (errs?.expDate || errs?.expPast) && "border-destructive ring-1 ring-destructive/30"
                                      )}>
                                        <CalendarIcon className="mr-1.5 h-3 w-3" />
                                        {item.expDate ? format(new Date(item.expDate), 'dd-MM-yyyy') : 'dd-mm-yyyy'}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 z-50" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={item.expDate ? new Date(item.expDate) : undefined}
                                        onSelect={(date) => {
                                          if (date) {
                                            updateItem(realIdx, 'expDate', format(date, 'yyyy-MM-dd'));
                                            setValidationErrors(prev => { const n = { ...prev }; if (n[realIdx]) { delete n[realIdx].expDate; delete n[realIdx].expPast; if (!Object.keys(n[realIdx]).length) delete n[realIdx]; } return n; });
                                          }
                                        }}
                                        disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                  {errs?.expDate && <p className="text-[10px] text-destructive mt-0.5">Required</p>}
                                  {errs?.expPast && <p className="text-[10px] text-destructive mt-0.5">Past date</p>}
                                </div>
                              ) : (
                                <span className="text-value text-xs font-medium">{item.expDate ? format(new Date(item.expDate), 'dd-MM-yyyy') : '—'}</span>
                              )}
                            </td>
                              
                            <td className="px-4 py-2 text-center">
                              {canEdit ? (
                                <Input className={cn(
                                  "w-24 h-8 mx-auto text-center text-xs font-semibold",
                                  hasQty ? 'border-success bg-[hsl(var(--stock-ok-bg))] ring-1 ring-success/30 text-success' : ''
                                )} type="number" placeholder="0" value={item.quantity || ''} onChange={e => updateItem(realIdx, 'quantity', Number(e.target.value))} />
                              ) : (
                                <span className={`font-bold text-sm ${item.quantity > 0 ? 'text-value' : 'text-muted-foreground'}`}>{item.quantity}</span>
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
              <div className="flex items-center justify-between px-5 py-3 border-t border-border/30 bg-[hsl(var(--card-surface-bg))]">
                <div className="flex items-center gap-5 text-xs text-muted-foreground">
                  <span>Items with qty: <strong className="text-value font-bold">{totalWithQty}</strong></span>
                  <span>Total Qty: <strong className="text-value font-bold">{totalQty}</strong></span>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-8 px-4 text-xs" onClick={() => confirmNavigation('/invoices')}>
                    Cancel
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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <PlusCircle className="w-4 h-4 text-primary" /> Add New Medicine
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Medicine Name <span className="text-destructive">*</span></Label>
              <Input className="h-9 text-sm mt-1" value={newMedName} onChange={e => setNewMedName(e.target.value)} placeholder="Enter medicine name" />
            </div>
            <div>
              <Label className="text-xs">Type <span className="text-destructive">*</span></Label>
              <Select value={newMedType} onValueChange={setNewMedType}>
                <SelectTrigger className="h-9 text-sm mt-1"><SelectValue placeholder="Select Type" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">{MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Strength</Label>
                <Input className="h-9 text-sm mt-1" placeholder="e.g. 500" value={newMedStrength} onChange={e => setNewMedStrength(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs">Unit</Label>
                <Select value={newMedUnit} onValueChange={setNewMedUnit}>
                  <SelectTrigger className="h-9 text-sm mt-1"><SelectValue placeholder="Unit" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">{UNITS.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}</SelectContent>
                </Select>
              </div>
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

      {/* Discard Changes Dialog */}
      <DiscardChangesDialog open={showDiscardDialog} onDiscard={handleDiscard} onCancel={handleDiscardCancel} />
    </DashboardLayout>
  );
}
