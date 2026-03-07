import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package, Search, Upload, FileImage, X, CalendarIcon, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useSupplierList, useWarehouseInventory } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

type BannerType = 'success' | 'error' | 'info';
interface BannerState { type: BannerType; message: string }
const bannerStyles: Record<BannerType, { bg: string; border: string; text: string; icon: typeof CheckCircle2 }> = {
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2 },
  error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', icon: AlertCircle },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
};

interface MedicineRow {
  id?: number;
  medicineId: string;
  medicineName: string;
  category: string;
  requestedQty: number;
  receivedQty: number;
  batchNo: string;
  expDate: string;
  hsnNo: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  partial: { label: 'Partial', className: 'bg-orange-50 text-orange-700 border-orange-200' },
  received: { label: 'Received', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-muted text-muted-foreground border-border' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
};

export default function CreateMedicineRequest() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditRoute = window.location.pathname.endsWith('/edit');
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: warehouseInventory = [] } = useWarehouseInventory(warehouseId);

  // Determine page mode
  const [orderStatus, setOrderStatus] = useState('');
  const statusLower = orderStatus.toLowerCase();

  // Mode logic:
  // - No id → create (Medicine Request)
  // - id + edit route + (pending|partial) → receive
  // - id + edit route + draft → editDraft
  // - id + no edit → view
  const isCreate = !id;
  const isReceive = !!id && isEditRoute && (statusLower === 'pending' || statusLower === 'partial');
  const isEditDraft = !!id && isEditRoute && statusLower === 'draft';
  const isView = !!id && !isEditRoute;
  const isReadOnly = isView || (!!id && isEditRoute && statusLower === 'received');

  const [supplierId, setSupplierId] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [banner, setBanner] = useState<BannerState | null>(null);

  // Receive mode fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDateObj, setInvoiceDateObj] = useState<Date | undefined>(undefined);
  const [invoiceFiles, setInvoiceFiles] = useState<{ name: string; url: string; file?: File }[]>([]);
  const [paymentMode, setPaymentMode] = useState('');
  const [createdAt, setCreatedAt] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [warehouseName, setWarehouseName] = useState('');
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

  const selectedSupplier = useMemo(() => suppliers.find(s => String(s.id) === supplierId), [suppliers, supplierId]);

  // File handling
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

  // Load existing order
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/supplier-orders/${id}`, null).then(res => {
      const order = res.data;
      if (order) {
        setSupplierId(String(order.supplierId));
        setOrderStatus(order.status || '');
        setMedicines((order.items || []).map((item: any) => ({
          id: item.id,
          medicineId: String(item.medicineId),
          medicineName: item.medicineName || '-',
          category: item.category || item.medicineType || '-',
          requestedQty: item.requestedQuantity || 0,
          receivedQty: item.receivedQuantity || 0,
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          hsnNo: item.hsnNo || '',
        })));
        // Load invoice-related fields
        setInvoiceNumber(order.invoiceNo || '');
        setInvoiceAmount(order.invoiceAmount ? String(order.invoiceAmount) : '');
        if (order.invoiceDate) {
          setInvoiceDateObj(new Date(order.invoiceDate));
        }
        setPaymentMode(order.paymentMode || '');
        setCreatedAt(order.createdAt || '');
        setUpdatedAt(order.updatedAt || '');
        setWarehouseName(order.warehouseName || '');
      }
    }).catch(err => {
      setBanner({ type: 'error', message: err.message || 'Failed to load order' });
    }).finally(() => setLoading(false));
  }, [id]);

  // Load medicines when supplier changes (create mode)
  useEffect(() => {
    if (!isCreate || !supplierId) { if (isCreate) setMedicines([]); return; }
    const supplier = suppliers.find(s => String(s.id) === supplierId);
    const meds = supplier?.medicines ?? [];
    setMedicines(meds.map(m => ({
      medicineId: String(m.id),
      medicineName: m.name || '-',
      category: (m as any).category || (m as any).medicineType || '-',
      requestedQty: 0,
      receivedQty: 0,
      batchNo: '',
      expDate: '',
      hsnNo: '',
    })));
  }, [supplierId, suppliers, isCreate]);

  const getStock = (medicineId: string) => {
    const item = warehouseInventory.find(inv => String(inv.medicineId) === medicineId);
    return item?.totalQty || 0;
  };

  const totalSelected = medicines.filter(m => m.requestedQty > 0).length;
  const totalReqQty = medicines.reduce((s, m) => s + m.requestedQty, 0);
  const totalRecvQty = medicines.reduce((s, m) => s + m.receivedQty, 0);

  const filteredMedicines = useMemo(() => {
    if (!medSearch.trim()) return medicines;
    const q = medSearch.toLowerCase();
    return medicines.filter(m => m.medicineName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  }, [medicines, medSearch]);

  const updateMedicine = (idx: number, field: keyof MedicineRow, value: any) => {
    const updated = [...medicines];
    (updated[idx] as any)[field] = value;
    setMedicines(updated);
  };

  // Submit request (create / edit draft)
  const handleSubmit = async (status: 'PENDING' | 'DRAFT') => {
    const validItems = medicines.filter(m => m.requestedQty > 0);
    if (validItems.length === 0) { setBanner({ type: 'error', message: 'Enter quantity for at least one medicine.' }); return; }
    setBanner(null);
    setSubmitting(true);
    try {
      const payload = {
        warehouseId, supplierId: Number(supplierId), status,
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      if (isEditDraft && id) await api.put(`/supplier-orders/${id}`, payload);
      else await api.post('/supplier-orders', payload);
      navigate('/supplier-orders', { state: { banner: { type: 'success', message: status === 'DRAFT' ? `Draft saved — ${validItems.length} medicines, ${totalReqQty} units total.` : `Request sent — ${validItems.length} medicines, ${totalReqQty} units total.` } } });
    } catch (error: any) {
      setBanner({ type: 'error', message: error.message || 'Failed to submit request.' });
    } finally { setSubmitting(false); }
  };

  // Receive stock
  const handleReceiveStock = async () => {
    if (!id) return;
    const overItems = medicines.filter(m => m.receivedQty > m.requestedQty);
    if (overItems.length > 0) {
      setBanner({ type: 'error', message: `Received exceeds requested for: ${overItems.map(i => i.medicineName).join(', ')}` });
      return;
    }
    const items = medicines.filter(m => m.receivedQty > 0).map(m => ({
      id: m.id, receivedQuantity: m.receivedQty, batchNo: m.batchNo, expDate: m.expDate, hsnNo: m.hsnNo,
    }));
    if (!items.length) { setBanner({ type: 'error', message: 'Enter received qty for at least one item.' }); return; }
    const isFullyReceived = medicines.every(m => m.receivedQty >= m.requestedQty);
    setBanner(null);
    setSubmitting(true);
    try {
      await api.put(`/supplier-orders/${id}`, {
        items, status: isFullyReceived ? 'RECEIVED' : 'PARTIAL',
        invoiceNumber, invoiceAmount: parseFloat(invoiceAmount) || 0,
        invoiceDate: invoiceDateObj ? format(invoiceDateObj, 'yyyy-MM-dd') : undefined,
      });
      navigate('/supplier-orders', { state: { banner: { type: 'success', message: isFullyReceived ? `Stock fully received — ${items.length} items updated.` : `Partial stock received — ${items.length} items updated.` } } });
    } catch (error: any) {
      setBanner({ type: 'error', message: error.message || 'Failed to update stock.' });
    } finally { setSubmitting(false); }
  };

  // Page title
  const pageTitle = isCreate ? 'Medicine Request' : (isReceive ? 'View Request' : (isEditDraft ? 'Edit Request' : 'View Request'));

              <span>Redirecting to orders list...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-slate-100 transition-colors" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        {orderStatus && (
          <Badge variant="outline" className={cn("text-xs px-2.5 py-0.5 rounded-full", statusConfig[statusLower]?.className)}>
            {statusConfig[statusLower]?.label || orderStatus}
          </Badge>
        )}
      </div>

      {/* Banner */}
      {banner && (() => {
        const s = bannerStyles[banner.type];
        const Icon = s.icon;
        return (
          <div className={cn("flex items-center gap-2.5 px-4 py-2.5 rounded-lg border mb-3", s.bg, s.border, s.text)}>
            <Icon className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium flex-1">{banner.message}</p>
            <button onClick={() => setBanner(null)} className="hover:opacity-70"><X className="h-3.5 w-3.5" /></button>
          </div>
        );
      })()}

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ORDER INFORMATION — only shown for view/receive (not create)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {!isCreate && (
            <div className="px-5 py-4 border-b bg-slate-50/50">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Order Information</p>
              <div className="flex items-end gap-3 flex-wrap">
                {/* Request ID (read-only) */}
                <div className="w-[80px]">
                  <Label className="text-[11px] text-muted-foreground">Request ID</Label>
                  <p className="text-sm font-medium h-8 flex items-center">#{id}</p>
                </div>
                {/* Supplier (always read-only here) */}
                <div className="min-w-[160px]">
                  <Label className="text-[11px] text-muted-foreground">Supplier</Label>
                  <p className="text-sm font-medium h-8 flex items-center">{selectedSupplier?.name || '-'}</p>
                </div>
                {/* Warehouse (read-only) - hidden for RECEIVED and PENDING */}
                {warehouseName && !(statusLower === 'received' || statusLower === 'pending') && (
                  <div className="min-w-[120px]">
                    <Label className="text-[11px] text-muted-foreground">Warehouse</Label>
                    <p className="text-sm h-8 flex items-center">{warehouseName}</p>
                  </div>
                )}
                {/* Request Date (read-only) */}
                {createdAt && (
                  <div className="w-[140px]">
                    <Label className="text-[11px] text-muted-foreground">Request Date</Label>
                    <p className="text-sm h-8 flex items-center">{createdAt ? format(new Date(createdAt), 'dd MMM yyyy') : '—'}</p>
                  </div>
                )}
                {/* Invoice No */}
                <div className="w-[120px]">
                  <Label className="text-[11px] text-muted-foreground">Invoice No.</Label>
                  {isReceive ? (
                    <Input className="h-8 text-sm mt-0.5" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                  ) : (
                    <p className="text-sm h-8 flex items-center">{invoiceNumber || '—'}</p>
                  )}
                </div>
                {/* Amount */}
                <div className="w-[110px]">
                  <Label className="text-[11px] text-muted-foreground">Amount (₹)</Label>
                  {isReceive ? (
                    <Input type="number" min="0" className="h-8 text-sm mt-0.5" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                  ) : (
                    <p className="text-sm h-8 flex items-center">{invoiceAmount ? `₹${Number(invoiceAmount).toLocaleString()}` : '—'}</p>
                  )}
                </div>
                {/* Invoice Date */}
                <div className="w-[140px]">
                  <Label className="text-[11px] text-muted-foreground">Invoice Date</Label>
                  {isReceive ? (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("h-8 w-full justify-start text-left text-sm font-normal mt-0.5", !invoiceDateObj && "text-muted-foreground")}>
                          <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
                          {invoiceDateObj ? format(invoiceDateObj, "dd-MM-yyyy") : "Pick date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50" align="start">
                        <Calendar mode="single" selected={invoiceDateObj} onSelect={setInvoiceDateObj} initialFocus className={cn("p-3 pointer-events-auto")} />
                      </PopoverContent>
                    </Popover>
                  ) : (
                    <p className="text-sm h-8 flex items-center">{invoiceDateObj ? format(invoiceDateObj, 'dd MMM yyyy') : '—'}</p>
                  )}
                </div>
                {/* Payment Mode (read-only in view, could be editable in receive) */}
                {(isView || paymentMode) && (
                  <div className="w-[100px]">
                    <Label className="text-[11px] text-muted-foreground">Payment Mode</Label>
                    <p className="text-sm h-8 flex items-center">{paymentMode || '—'}</p>
                  </div>
                )}
                {/* Received Date (read-only) */}
                {updatedAt && statusLower === 'received' && (
                  <div className="w-[140px]">
                    <Label className="text-[11px] text-muted-foreground">Received Date</Label>
                    <p className="text-sm h-8 flex items-center">{format(new Date(updatedAt), 'dd MMM yyyy')}</p>
                  </div>
                )}
                {/* Email (read-only) */}
                {selectedSupplier?.email && (
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Email</Label>
                    <p className="text-sm h-8 flex items-center">{selectedSupplier.email}</p>
                  </div>
                )}
                {/* Attachments */}
                {isReceive && (
                  <div className="flex items-center gap-1.5 self-end pb-0.5">
                    {invoiceFiles.map((f, idx) => (
                      <div key={idx} className="group relative flex items-center gap-1 border rounded bg-muted/30 px-1.5 py-1 text-[11px] cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setShowImagePreview(f.url)}>
                        <FileImage className="w-3 h-3 text-primary shrink-0" />
                        <span className="max-w-[60px] truncate">{f.name}</span>
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive" onClick={e => { e.stopPropagation(); removeFile(idx); }}>
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    ))}
                    <label className="flex items-center gap-1 border border-dashed rounded px-2 py-1 text-[11px] text-muted-foreground cursor-pointer hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all">
                      <Upload className="w-3 h-3" />
                      Attach
                      <input type="file" accept="image/*,.pdf" multiple className="hidden" onChange={handleFileUpload} />
                    </label>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CREATE MODE — Supplier selector                               */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {isCreate && (
            <div className="px-5 py-4 border-b bg-gradient-to-r from-slate-50 to-blue-50/30">
              <div className="flex items-end gap-6">
                <div className="min-w-[220px]">
                  <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-10 text-sm mt-1.5 bg-white border-slate-300 hover:border-blue-400 shadow-sm transition-colors"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSupplier && (
                  <>
                    <div>
                      <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Contact</Label>
                      <p className="text-sm font-semibold text-slate-700 h-10 flex items-center">{selectedSupplier.contact || '-'}</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-xs text-slate-500 font-medium uppercase tracking-wide">Address</Label>
                      <p className="text-sm h-10 flex items-center truncate text-slate-600">
                        {[selectedSupplier.address, selectedSupplier.mandal, selectedSupplier.district, selectedSupplier.state].filter(Boolean).join(', ')}
                        {selectedSupplier.pinCode ? ` - ${selectedSupplier.pinCode}` : ''}
                        {!selectedSupplier.address && !selectedSupplier.district ? '-' : ''}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MEDICINE TABLE                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(isCreate && !supplierId) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Select a Supplier</p>
              <p className="text-xs text-muted-foreground">Choose a supplier above to load their medicine catalog</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-foreground">No medicines found</p>
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="px-4 py-3 border-b flex items-center gap-3 bg-white">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Medicine Details</p>
                <span className="text-xs text-white bg-blue-500 px-2 py-0.5 rounded-full font-medium">{medicines.length}</span>
                <div className="ml-auto relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input className="h-8 text-sm pl-8 w-48 bg-slate-50 border-slate-200 focus:bg-white transition-colors" placeholder="Search..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 border-slate-200">
                      <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-600 w-12">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-slate-600">Medicine</th>

                      {/* CREATE: Current Stock, Request Qty */}
                      {isCreate && (
                        <>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-32 whitespace-nowrap">Stock</th>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-slate-600 w-40 whitespace-nowrap">Request Qty</th>
                        </>
                      )}

                      {/* RECEIVE / VIEW (pending/partial/received): Req Qty, Batch, Exp Date, HSN, Stock, Recv Qty */}
                      {!isCreate && (
                        <>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24 whitespace-nowrap">Req Qty</th>
                          {!(statusLower === 'received' || statusLower === 'pending') && (
                            <>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24 whitespace-nowrap">Batch</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32 whitespace-nowrap">Exp Date</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20 whitespace-nowrap">HSN</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20 whitespace-nowrap">Stock</th>
                            </>
                          )}
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32 whitespace-nowrap">Recv Qty</th>
                        </>
                      )}

                      {/* EDIT DRAFT: same as create */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredMedicines.map((med, idx) => {
                      const origIdx = medicines.findIndex(m => m.medicineId === med.medicineId);
                      const stock = getStock(med.medicineId);
                      const stockColor = stock <= 0 ? 'text-red-500 font-semibold' : stock < 30 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium';
                      const hasReqQty = med.requestedQty > 0;
                      const hasRecvQty = med.receivedQty > 0;

                      return (
                        <tr key={med.medicineId} className={cn("transition-colors duration-150 hover:bg-blue-50/50", (isCreate ? hasReqQty : hasRecvQty) && "bg-emerald-50/60")}>
                          <td className="px-4 py-2 text-slate-500 text-sm w-12">{origIdx + 1}</td>
                          <td className="px-4 py-2">
                            <span className="font-semibold text-slate-800 text-sm">{med.medicineName}</span>
                            {med.category !== '-' && <span className="text-slate-500 ml-2 text-xs">({med.category})</span>}
                          </td>

                          {/* ── CREATE columns ── */}
                          {isCreate && (
                            <>
                              <td className={cn("px-4 py-2 text-center text-sm tabular-nums w-32", stockColor)}>{stock}</td>
                              <td className="px-4 py-2 text-center w-40">
                                <Input type="number" min="0"
                                  className={cn("w-28 h-9 mx-auto text-center text-sm rounded-lg border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all shadow-sm", hasReqQty && "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200")}
                                  value={med.requestedQty || ''} placeholder="0"
                                  onChange={e => updateMedicine(origIdx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </td>
                            </>
                          )}

                          {/* ── VIEW / RECEIVE columns ── */}
                          {!isCreate && (
                            <>
                              <td className="px-4 py-2 text-center text-sm font-medium">{med.requestedQty}</td>
                              {!(statusLower === 'received' || statusLower === 'pending') && (
                                <>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input className="w-24 h-8 mx-auto text-center text-sm rounded-lg border-slate-300 shadow-sm" placeholder="Batch"
                                        value={med.batchNo} onChange={e => updateMedicine(origIdx, 'batchNo', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-slate-500">{med.batchNo || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input type="date" className="w-32 h-8 mx-auto text-sm rounded-lg border-slate-300 shadow-sm"
                                        value={med.expDate} onChange={e => updateMedicine(origIdx, 'expDate', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-slate-500">{med.expDate || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input className="w-20 h-8 mx-auto text-center text-sm rounded-lg border-slate-300 shadow-sm" placeholder="HSN"
                                        value={med.hsnNo} onChange={e => updateMedicine(origIdx, 'hsnNo', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-slate-500">{med.hsnNo || '—'}</span>
                                    )}
                                  </td>
                                  <td className={cn("px-4 py-2 text-center text-sm tabular-nums", stockColor)}>{stock}</td>
                                </>
                              )}
                              <td className="px-4 py-2 text-center">
                                {isReceive ? (
                                  <Input type="number" min="0"
                                    className={cn("w-28 h-9 mx-auto text-center text-sm rounded-lg border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm", hasRecvQty && "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200")}
                                    value={med.receivedQty || ''} placeholder="0"
                                    onChange={e => updateMedicine(origIdx, 'receivedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                                  />
                                ) : (
                                  <span className="text-sm font-medium">{med.receivedQty}</span>
                                )}
                              </td>
                            </>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3.5 border-t bg-gradient-to-r from-slate-50 to-blue-50/30">
                <div className="flex items-center gap-5 text-sm text-slate-600">
                  <span>Items with qty: <strong className="text-foreground font-semibold">{totalSelected}</strong></span>
                  <span>Total Qty: <strong className="text-foreground font-semibold">{isReceive ? totalRecvQty : totalReqQty}</strong></span>
                  {isReceive && <span>Requested: <strong className="text-foreground font-semibold">{totalReqQty}</strong></span>}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100" onClick={() => navigate('/supplier-orders')}>
                    Cancel
                  </Button>
                  {(isCreate || isEditDraft) && (
                    <>
                      <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-slate-300 text-slate-700 hover:bg-slate-100 shadow-sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                        <Save className="mr-1.5 h-4 w-4" /> Save Draft
                      </Button>
                      <Button size="sm" className="h-9 px-5 text-sm bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg shadow-blue-500/25" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
                        <Send className="mr-1.5 h-4 w-4" /> Submit Request
                      </Button>
                    </>
                  )}
                  {isReceive && (
                    <Button size="sm" className="h-9 px-5 text-sm bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-700 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/25" disabled={submitting} onClick={handleReceiveStock}>
                      <Package className="mr-1.5 h-4 w-4" /> Save Stock
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

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
