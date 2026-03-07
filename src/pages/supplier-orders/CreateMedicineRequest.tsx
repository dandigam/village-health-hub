import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package, Search, Upload, FileImage, X, CalendarIcon, CheckCircle2, AlertCircle, Info, PlusCircle } from 'lucide-react';
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { useSupplierList, useWarehouseInventory, useWarehouseDetail, useMedicines } from '@/hooks/useApiData';
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
  batchStrength: string;
  unit: string;
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
  const { data: warehouseDetail } = useWarehouseDetail(warehouseId);
  const { data: allMedicines = [] } = useMedicines();

  // Determine page mode
  const [orderStatus, setOrderStatus] = useState('');
  const statusLower = orderStatus.toLowerCase();

  const isCreate = !id;
  const isReceive = !!id && isEditRoute && (statusLower === 'pending' || statusLower === 'partial');
  const isEditDraft = !!id && isEditRoute && statusLower === 'draft';
  const isView = !!id && !isEditRoute;
  const isReadOnly = isView || (!!id && isEditRoute && statusLower === 'received');

  const [supplierId, setSupplierId] = useState('');
  const [priority, setPriority] = useState<'normal' | 'urgent'>('normal');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [medSearch, setMedSearch] = useState('');
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Add Medicine dialog
  const [showAddMedicine, setShowAddMedicine] = useState(false);
  const [addMedSearch, setAddMedSearch] = useState('');

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

  // Build warehouse address
  const warehouseAddress = useMemo(() => {
    if (!warehouseDetail) return '';
    return [warehouseDetail.village, warehouseDetail.mandal, warehouseDetail.district, warehouseDetail.state].filter(Boolean).join(', ') + (warehouseDetail.pinCode ? ` - ${warehouseDetail.pinCode}` : '');
  }, [warehouseDetail]);

  // Build supplier address
  const supplierAddress = useMemo(() => {
    if (!selectedSupplier) return '';
    return [selectedSupplier.address, selectedSupplier.mandal, selectedSupplier.district, selectedSupplier.state].filter(Boolean).join(', ') + (selectedSupplier.pinCode ? ` - ${selectedSupplier.pinCode}` : '');
  }, [selectedSupplier]);

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
        setPriority(order.priority === 'urgent' || order.priority === 'URGENT' ? 'urgent' : 'normal');
        setMedicines((order.items || []).map((item: any) => ({
          id: item.id,
          medicineId: String(item.medicineId),
          medicineName: item.medicineName || '-',
          category: item.category || item.medicineType || '-',
          batchStrength: item.batchStrength || item.strength || '-',
          unit: item.unit || '-',
          requestedQty: item.requestedQuantity || 0,
          receivedQty: item.receivedQuantity || 0,
          batchNo: item.batchNo || '',
          expDate: item.expDate || '',
          hsnNo: item.hsnNo || '',
        })));
        setInvoiceNumber(order.invoiceNo || '');
        setInvoiceAmount(order.invoiceAmount ? String(order.invoiceAmount) : '');
        if (order.invoiceDate) setInvoiceDateObj(new Date(order.invoiceDate));
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
      batchStrength: (m as any).batchStrength || (m as any).strength || '-',
      unit: (m as any).unit || '-',
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

  // Add medicine from global list
  const addMedicineToList = (med: any) => {
    const exists = medicines.some(m => String(m.medicineId) === String(med.id));
    if (exists) return;
    setMedicines(prev => [...prev, {
      medicineId: String(med.id),
      medicineName: med.name || '-',
      category: med.category || med.medicineType || '-',
      batchStrength: med.batchStrength || med.strength || '-',
      unit: med.unit || '-',
      requestedQty: 0,
      receivedQty: 0,
      batchNo: '',
      expDate: '',
      hsnNo: '',
    }]);
  };

  const addMedicineFiltered = useMemo(() => {
    if (!addMedSearch.trim()) return allMedicines.slice(0, 50);
    const q = addMedSearch.toLowerCase();
    return allMedicines.filter((m: any) => (m.name || '').toLowerCase().includes(q)).slice(0, 50);
  }, [allMedicines, addMedSearch]);

  // Submit request
  const handleSubmit = async (status: 'PENDING' | 'DRAFT') => {
    const validItems = medicines.filter(m => m.requestedQty > 0);
    if (validItems.length === 0) { setBanner({ type: 'error', message: 'Enter quantity for at least one medicine.' }); return; }
    setBanner(null);
    setSubmitting(true);
    try {
      const payload = {
        warehouseId, supplierId: Number(supplierId), status, priority: priority.toUpperCase(),
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      let result: any;
      if (isEditDraft && id) result = await api.put(`/supplier-orders/${id}`, payload);
      else result = await api.post('/supplier-orders', payload);
      if (result?.id) setCreatedOrderId(String(result.id));
      const msg = status === 'DRAFT'
        ? `Draft saved — ${validItems.length} medicines, ${totalReqQty} units total.`
        : `Request sent — ${validItems.length} medicines, ${totalReqQty} units total.`;
      setBanner({ type: 'success', message: msg });
      setTimeout(() => navigate('/supplier-orders'), 1500);
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
      const msg = isFullyReceived ? `Stock fully received — ${items.length} items updated.` : `Partial stock received — ${items.length} items updated.`;
      setBanner({ type: 'success', message: msg });
      setTimeout(() => navigate('/supplier-orders'), 1500);
    } catch (error: any) {
      setBanner({ type: 'error', message: error.message || 'Failed to update stock.' });
    } finally { setSubmitting(false); }
  };

  const pageTitle = isCreate ? 'Medicine Request' : (isReceive ? 'View Request' : (isEditDraft ? 'Edit Request' : 'View Request'));
  const displayId = id || createdOrderId;

  const canEdit = isCreate || isEditDraft;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 rounded-lg hover:bg-muted transition-colors" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-semibold text-foreground">{pageTitle}</h1>
        {displayId && (
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 rounded-full border-border text-muted-foreground font-mono">
            #{displayId}
          </Badge>
        )}
        {orderStatus && (
          <Badge variant="outline" className={cn("text-xs px-2.5 py-0.5 rounded-full", statusConfig[statusLower]?.className)}>
            {statusConfig[statusLower]?.label || orderStatus}
          </Badge>
        )}
        {priority === 'urgent' && (
          <Badge className="bg-red-500 text-white text-xs px-2.5 py-0.5 rounded-full border-0">
            🔴 Urgent
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
            <div className="px-5 py-4 border-b bg-muted/30">
              <p className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">Order Information</p>
              <div className="flex items-end gap-3 flex-wrap">
                <div className="w-[80px]">
                  <Label className="text-[11px] text-muted-foreground">Request ID</Label>
                  <p className="text-sm font-medium h-8 flex items-center">#{id}</p>
                </div>
                <div className="min-w-[160px]">
                  <Label className="text-[11px] text-muted-foreground">Supplier</Label>
                  <p className="text-sm font-medium h-8 flex items-center">{selectedSupplier?.name || '-'}</p>
                </div>
                {warehouseName && !(statusLower === 'received' || statusLower === 'pending') && (
                  <div className="min-w-[120px]">
                    <Label className="text-[11px] text-muted-foreground">Warehouse</Label>
                    <p className="text-sm h-8 flex items-center">{warehouseName}</p>
                  </div>
                )}
                {createdAt && (
                  <div className="w-[140px]">
                    <Label className="text-[11px] text-muted-foreground">Request Date</Label>
                    <p className="text-sm h-8 flex items-center">{format(new Date(createdAt), 'dd MMM yyyy')}</p>
                  </div>
                )}
                <div className="w-[120px]">
                  <Label className="text-[11px] text-muted-foreground">Invoice No.</Label>
                  {isReceive ? (
                    <Input className="h-8 text-sm mt-0.5" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                  ) : (
                    <p className="text-sm h-8 flex items-center">{invoiceNumber || '—'}</p>
                  )}
                </div>
                <div className="w-[110px]">
                  <Label className="text-[11px] text-muted-foreground">Amount (₹)</Label>
                  {isReceive ? (
                    <Input type="number" min="0" className="h-8 text-sm mt-0.5" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                  ) : (
                    <p className="text-sm h-8 flex items-center">{invoiceAmount ? `₹${Number(invoiceAmount).toLocaleString()}` : '—'}</p>
                  )}
                </div>
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
                {(isView || paymentMode) && (
                  <div className="w-[100px]">
                    <Label className="text-[11px] text-muted-foreground">Payment Mode</Label>
                    <p className="text-sm h-8 flex items-center">{paymentMode || '—'}</p>
                  </div>
                )}
                {updatedAt && statusLower === 'received' && (
                  <div className="w-[140px]">
                    <Label className="text-[11px] text-muted-foreground">Received Date</Label>
                    <p className="text-sm h-8 flex items-center">{format(new Date(updatedAt), 'dd MMM yyyy')}</p>
                  </div>
                )}
                {selectedSupplier?.email && (
                  <div>
                    <Label className="text-[11px] text-muted-foreground">Email</Label>
                    <p className="text-sm h-8 flex items-center">{selectedSupplier.email}</p>
                  </div>
                )}
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
          {/* CREATE MODE — Side-by-side Supplier + Deliver To + Priority   */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {isCreate && (
            <div className="px-5 py-3 border-b bg-muted/20">
              <div className="flex items-stretch gap-0">
                {/* Supplier Dropdown */}
                <div className="min-w-[200px] flex flex-col justify-center pr-4">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-9 text-sm bg-background border-input hover:border-primary/50 shadow-sm transition-colors">
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Priority Toggle */}
                <div className="flex flex-col justify-center pr-4">
                  <Label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide mb-1">Priority</Label>
                  <div className="flex items-center gap-2 h-9">
                    <Switch
                      checked={priority === 'urgent'}
                      onCheckedChange={(checked) => setPriority(checked ? 'urgent' : 'normal')}
                      className={cn(
                        priority === 'urgent' && "data-[state=checked]:bg-destructive"
                      )}
                    />
                    <span className={cn(
                      "text-sm font-semibold transition-colors",
                      priority === 'urgent' ? "text-destructive" : "text-muted-foreground"
                    )}>
                      {priority === 'urgent' ? 'URGENT' : 'Normal'}
                    </span>
                  </div>
                </div>

                {/* Divider 1 */}
                {selectedSupplier && (
                  <div className="flex items-center px-3 self-stretch py-2">
                    <div className="w-px h-full bg-border" />
                  </div>
                )}

                {/* Supplier Address */}
                {selectedSupplier && (
                  <div className="flex-1 flex flex-col justify-center pr-3 min-w-[180px]">
                    <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Supplier Address</p>
                    <p className="text-xs font-semibold text-foreground leading-tight">{selectedSupplier.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">📞 {selectedSupplier.contact || '-'}</p>
                    <p className="text-[11px] mt-0.5 text-primary/70 italic leading-snug truncate" title={supplierAddress}>{supplierAddress || '-'}</p>
                  </div>
                )}

                {/* Divider 2 */}
                {selectedSupplier && (
                  <div className="flex items-center px-3 self-stretch py-2">
                    <div className="w-px h-full bg-border" />
                  </div>
                )}

                {/* Deliver To */}
                {selectedSupplier && (
                  <div className="flex-1 flex flex-col justify-center min-w-[180px]">
                    <div className="flex items-center gap-1 mb-0.5">
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider">Deliver To</p>
                      {warehouseDetail && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-3 w-3 text-muted-foreground cursor-help hover:text-primary transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="max-w-xs text-xs">
                            <p className="font-semibold mb-1">{warehouseDetail.name}</p>
                            <p>{warehouseAddress}</p>
                            {warehouseDetail.phoneNumber && <p className="mt-1">📞 {warehouseDetail.phoneNumber}</p>}
                            {warehouseDetail.email && <p>✉️ {warehouseDetail.email}</p>}
                            {warehouseDetail.authorizedPerson && <p className="mt-1">Contact: {warehouseDetail.authorizedPerson}</p>}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    {warehouseDetail ? (
                      <>
                        <p className="text-xs font-semibold text-foreground leading-tight">{warehouseDetail.name}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">📞 {warehouseDetail.phoneNumber || '-'}</p>
                        <p className="text-[11px] mt-0.5 text-primary/70 italic leading-snug truncate" title={warehouseAddress}>{warehouseAddress || '-'}</p>
                      </>
                    ) : (
                      <p className="text-[11px] text-muted-foreground italic">No warehouse assigned</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* MEDICINE TABLE                                                */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {(isCreate && !supplierId) ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">Select a Supplier</p>
              <p className="text-xs text-muted-foreground">Choose a supplier above to load their medicine catalog</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                <Package className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground">No medicines found</p>
            </div>
          ) : (
            <>
              {/* Search bar + Add Medicine */}
              <div className="px-4 py-3 border-b flex items-center gap-3 bg-background">
                <p className="text-xs font-semibold text-primary uppercase tracking-wider">Medicine Details</p>
                <Badge className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full font-medium border-0">{medicines.length}</Badge>
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input className="h-8 text-sm pl-8 w-48 bg-muted/30 border-input focus:bg-background transition-colors" placeholder="Filter medicines..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                  </div>
                  {canEdit && (
                    <Button variant="outline" size="sm" className="h-8 text-sm gap-1.5" onClick={() => { setShowAddMedicine(true); setAddMedSearch(''); }}>
                      <PlusCircle className="h-3.5 w-3.5" /> Add Medicine
                    </Button>
                  )}
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-muted/40 border-border">
                      <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground w-12">#</th>
                      <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground">Medicine Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">Batch / Strength</th>

                      {/* CREATE columns */}
                      {isCreate && (
                        <>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-28">Current Stock</th>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20">Unit</th>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-36">Request Qty</th>
                        </>
                      )}

                      {/* VIEW/RECEIVE columns */}
                      {!isCreate && (
                        <>
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">Req Qty</th>
                          {!(statusLower === 'received' || statusLower === 'pending') && (
                            <>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-24">Batch</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">Exp Date</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20">HSN</th>
                              <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-20">Stock</th>
                            </>
                          )}
                          <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground w-32">Recv Qty</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredMedicines.map((med, idx) => {
                      const origIdx = medicines.findIndex(m => m.medicineId === med.medicineId);
                      const stock = getStock(med.medicineId);
                      const stockColor = stock <= 0 ? 'text-red-500 font-semibold' : stock < 30 ? 'text-amber-600 font-medium' : 'text-emerald-600 font-medium';
                      const hasReqQty = med.requestedQty > 0;
                      const hasRecvQty = med.receivedQty > 0;

                      return (
                        <tr key={med.medicineId} className={cn("transition-colors duration-150 hover:bg-primary/[0.03]", (isCreate ? hasReqQty : hasRecvQty) && "bg-emerald-50/60")}>
                          <td className="px-4 py-2 text-muted-foreground text-sm w-12">{origIdx + 1}</td>
                          <td className="px-4 py-2">
                            <span className="font-semibold text-foreground text-sm">{med.medicineName}</span>
                            {med.category !== '-' && <span className="text-muted-foreground ml-2 text-xs">({med.category})</span>}
                          </td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">{med.batchStrength !== '-' ? med.batchStrength : '—'}</td>

                          {/* CREATE columns */}
                          {isCreate && (
                            <>
                              <td className={cn("px-4 py-2 text-center text-sm tabular-nums w-28", stockColor)}>{stock}</td>
                              <td className="px-4 py-2 text-center text-sm text-muted-foreground w-20">{med.unit !== '-' ? med.unit : '—'}</td>
                              <td className="px-4 py-2 text-center w-36">
                                <Input type="number" min="0"
                                  className={cn("w-28 h-9 mx-auto text-center text-sm rounded-lg border-input focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-sm", hasReqQty && "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200")}
                                  value={med.requestedQty || ''} placeholder="0"
                                  onChange={e => updateMedicine(origIdx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </td>
                            </>
                          )}

                          {/* VIEW / RECEIVE columns */}
                          {!isCreate && (
                            <>
                              <td className="px-4 py-2 text-center text-sm font-medium">{med.requestedQty}</td>
                              {!(statusLower === 'received' || statusLower === 'pending') && (
                                <>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input className="w-24 h-8 mx-auto text-center text-sm rounded-lg border-input shadow-sm" placeholder="Batch"
                                        value={med.batchNo} onChange={e => updateMedicine(origIdx, 'batchNo', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">{med.batchNo || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input type="date" className="w-32 h-8 mx-auto text-sm rounded-lg border-input shadow-sm"
                                        value={med.expDate} onChange={e => updateMedicine(origIdx, 'expDate', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">{med.expDate || '—'}</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-center">
                                    {isReceive ? (
                                      <Input className="w-20 h-8 mx-auto text-center text-sm rounded-lg border-input shadow-sm" placeholder="HSN"
                                        value={med.hsnNo} onChange={e => updateMedicine(origIdx, 'hsnNo', e.target.value)} />
                                    ) : (
                                      <span className="text-sm text-muted-foreground">{med.hsnNo || '—'}</span>
                                    )}
                                  </td>
                                  <td className={cn("px-4 py-2 text-center text-sm tabular-nums", stockColor)}>{stock}</td>
                                </>
                              )}
                              <td className="px-4 py-2 text-center">
                                {isReceive ? (
                                  <Input type="number" min="0"
                                    className={cn("w-28 h-9 mx-auto text-center text-sm rounded-lg border-input focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all shadow-sm", hasRecvQty && "border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200")}
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
              <div className="flex items-center justify-between px-5 py-3.5 border-t bg-muted/20">
                <div className="flex items-center gap-5 text-sm text-muted-foreground">
                  <span>Items with qty: <strong className="text-foreground font-semibold">{totalSelected}</strong></span>
                  <span>Total Qty: <strong className="text-foreground font-semibold">{isReceive ? totalRecvQty : totalReqQty}</strong></span>
                  {isReceive && <span>Requested: <strong className="text-foreground font-semibold">{totalReqQty}</strong></span>}
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="h-9 px-4 text-sm text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => navigate('/supplier-orders')}>
                    Cancel
                  </Button>
                  {(isCreate || isEditDraft) && (
                    <>
                      <Button variant="outline" size="sm" className="h-9 px-4 text-sm border-input shadow-sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                        <Save className="mr-1.5 h-4 w-4" /> Save Draft
                      </Button>
                      <Button size="sm" className="h-9 px-5 text-sm shadow-lg" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
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

      {/* Add Medicine Dialog */}
      <Dialog open={showAddMedicine} onOpenChange={setShowAddMedicine}>
        <DialogContent className="sm:max-w-md max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold">Add Medicine</DialogTitle>
          </DialogHeader>
          <div className="relative mb-3">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input className="pl-8 h-9 text-sm" placeholder="Search medicines..." value={addMedSearch} onChange={e => setAddMedSearch(e.target.value)} autoFocus />
          </div>
          <div className="overflow-auto max-h-[50vh] border rounded-lg divide-y divide-border/50">
            {addMedicineFiltered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No medicines found</p>
            ) : (
              addMedicineFiltered.map((med: any) => {
                const alreadyAdded = medicines.some(m => String(m.medicineId) === String(med.id));
                return (
                  <div key={med.id} className={cn("flex items-center justify-between px-3 py-2.5 text-sm transition-colors", alreadyAdded ? "bg-muted/40 opacity-60" : "hover:bg-primary/[0.03] cursor-pointer")} onClick={() => !alreadyAdded && addMedicineToList(med)}>
                    <div>
                      <p className="font-medium text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground">{med.category || med.medicineType || '-'}</p>
                    </div>
                    {alreadyAdded ? (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">Added</Badge>
                    ) : (
                      <PlusCircle className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
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
