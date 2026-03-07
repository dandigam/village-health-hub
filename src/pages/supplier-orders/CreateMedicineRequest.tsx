import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package, Search, Upload, FileImage, X, CalendarIcon } from 'lucide-react';
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
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

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

  // Receive mode fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDateObj, setInvoiceDateObj] = useState<Date | undefined>(undefined);
  const [invoiceFiles, setInvoiceFiles] = useState<{ name: string; url: string; file?: File }[]>([]);
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
      }
    }).catch(err => {
      toast({ title: 'Error', description: err.message || 'Failed to load order', variant: 'destructive' });
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
    if (validItems.length === 0) { toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const payload = {
        warehouseId, supplierId: Number(supplierId), status,
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      if (isEditDraft && id) await api.put(`/supplier-orders/${id}`, payload);
      else await api.post('/supplier-orders', payload);
      toast({ title: status === 'DRAFT' ? 'Draft Saved' : 'Request Sent', description: `${validItems.length} medicines, ${totalReqQty} units total.` });
      navigate('/supplier-orders');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to submit', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  // Receive stock
  const handleReceiveStock = async () => {
    if (!id) return;
    const overItems = medicines.filter(m => m.receivedQty > m.requestedQty);
    if (overItems.length > 0) {
      toast({ title: 'Invalid', description: `Received exceeds requested for: ${overItems.map(i => i.medicineName).join(', ')}`, variant: 'destructive' });
      return;
    }
    const items = medicines.filter(m => m.receivedQty > 0).map(m => ({
      id: m.id, receivedQuantity: m.receivedQty, batchNo: m.batchNo, expDate: m.expDate, hsnNo: m.hsnNo,
    }));
    if (!items.length) { toast({ title: 'Error', description: 'Enter received qty for at least one item.', variant: 'destructive' }); return; }
    const isFullyReceived = medicines.every(m => m.receivedQty >= m.requestedQty);
    setSubmitting(true);
    try {
      await api.put(`/supplier-orders/${id}`, {
        items, status: isFullyReceived ? 'RECEIVED' : 'PARTIAL',
        invoiceNumber, invoiceAmount: parseFloat(invoiceAmount) || 0,
        invoiceDate: invoiceDateObj ? format(invoiceDateObj, 'yyyy-MM-dd') : undefined,
      });
      toast({ title: isFullyReceived ? 'Stock Received' : 'Partial Stock Received', description: `${items.length} items updated.` });
      navigate('/supplier-orders');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  // Page title
  const pageTitle = isCreate ? 'Medicine Request' : (isReceive ? 'View Request' : (isEditDraft ? 'Edit Request' : 'View Request'));

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-lg font-bold tracking-tight text-foreground">{pageTitle}</h1>
        {orderStatus && (
          <Badge variant="outline" className={cn("text-[11px]", statusConfig[statusLower]?.className)}>
            {statusConfig[statusLower]?.label || orderStatus}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* ORDER INFORMATION — only shown for view/receive (not create)  */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          {!isCreate && (
            <div className="px-4 py-3 border-b">
              <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2">Order Information</p>
              <div className="flex items-end gap-3 flex-wrap">
                {/* Supplier (always read-only here) */}
                <div className="min-w-[160px]">
                  <Label className="text-[11px] text-muted-foreground">Supplier</Label>
                  <p className="text-sm font-medium h-8 flex items-center">{selectedSupplier?.name || '-'}</p>
                </div>
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
                <div className="w-[160px]">
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
            <div className="px-4 py-3 border-b">
              <div className="flex items-end gap-3">
                <div className="min-w-[200px]">
                  <Label className="text-[11px] text-muted-foreground">Supplier *</Label>
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSupplier && (
                  <>
                    <div>
                      <Label className="text-[11px] text-muted-foreground">Contact</Label>
                      <p className="text-sm font-medium h-8 flex items-center">{selectedSupplier.contact || '-'}</p>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <Label className="text-[11px] text-muted-foreground">Address</Label>
                      <p className="text-sm h-8 flex items-center truncate">
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
            <div className="flex flex-col items-center justify-center py-14">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Select a supplier to load medicine catalog</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <p className="text-sm text-muted-foreground">No medicines found</p>
            </div>
          ) : (
            <>
              {/* Search bar */}
              <div className="px-3 py-1.5 border-b flex items-center gap-3 bg-muted/30">
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Medicine Details</p>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{medicines.length}</Badge>
                <div className="ml-auto relative">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  <Input className="h-7 text-xs pl-7 w-44 bg-background" placeholder="Search..." value={medSearch} onChange={e => setMedSearch(e.target.value)} />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                <table className="w-full text-sm border-collapse">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b bg-muted/40">
                      <th className="px-3 py-2 text-left font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-10">#</th>
                      <th className="px-3 py-2 text-left font-medium text-[11px] uppercase tracking-wider text-muted-foreground">Medicine</th>

                      {/* CREATE: Current Stock, Request Qty */}
                      {isCreate && (
                        <>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-24">Current Stock</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-24">Request Qty</th>
                        </>
                      )}

                      {/* RECEIVE / VIEW (pending/partial/received): Req Qty, Batch, Exp Date, HSN, Stock, Recv Qty */}
                      {!isCreate && (
                        <>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-20">Req Qty</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-24">Batch</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-32">Exp Date</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-20">HSN</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-20">Stock</th>
                          <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-24">Recv Qty</th>
                        </>
                      )}

                      {/* EDIT DRAFT: same as create */}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filteredMedicines.map((med, idx) => {
                      const origIdx = medicines.findIndex(m => m.medicineId === med.medicineId);
                      const stock = getStock(med.medicineId);
                      const stockColor = stock <= 0 ? 'text-destructive font-semibold' : stock < 30 ? 'text-orange-600 font-medium' : 'text-foreground';
                      const hasReqQty = med.requestedQty > 0;
                      const hasRecvQty = med.receivedQty > 0;

                      return (
                        <tr key={med.medicineId} className={cn("transition-colors hover:bg-accent/30", (isCreate ? hasReqQty : hasRecvQty) && "bg-primary/[0.03]")}>
                          <td className="px-3 py-1 text-muted-foreground text-xs">{origIdx + 1}</td>
                          <td className="px-3 py-1">
                            <span className="font-semibold text-foreground text-xs">{med.medicineName}</span>
                            {med.category !== '-' && <span className="text-muted-foreground ml-2 text-[11px]">({med.category})</span>}
                          </td>

                          {/* ── CREATE columns ── */}
                          {isCreate && (
                            <>
                              <td className={cn("px-3 py-1 text-center text-xs tabular-nums", stockColor)}>{stock}</td>
                              <td className="px-3 py-1 text-center">
                                <Input type="number" min="0"
                                  className={cn("w-16 h-6 mx-auto text-center text-xs rounded-md", hasReqQty && "border-primary/40 ring-1 ring-primary/10")}
                                  value={med.requestedQty || ''} placeholder="0"
                                  onChange={e => updateMedicine(origIdx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                                />
                              </td>
                            </>
                          )}

                          {/* ── VIEW / RECEIVE columns ── */}
                          {!isCreate && (
                            <>
                              <td className="px-3 py-1 text-center text-xs font-medium">{med.requestedQty}</td>
                              <td className="px-3 py-1 text-center">
                                {isReceive ? (
                                  <Input className="w-24 h-6 mx-auto text-center text-xs rounded-md" placeholder="Batch"
                                    value={med.batchNo} onChange={e => updateMedicine(origIdx, 'batchNo', e.target.value)} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{med.batchNo || '—'}</span>
                                )}
                              </td>
                              <td className="px-3 py-1 text-center">
                                {isReceive ? (
                                  <Input type="date" className="w-32 h-6 mx-auto text-xs rounded-md"
                                    value={med.expDate} onChange={e => updateMedicine(origIdx, 'expDate', e.target.value)} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{med.expDate || '—'}</span>
                                )}
                              </td>
                              <td className="px-3 py-1 text-center">
                                {isReceive ? (
                                  <Input className="w-20 h-6 mx-auto text-center text-xs rounded-md" placeholder="HSN"
                                    value={med.hsnNo} onChange={e => updateMedicine(origIdx, 'hsnNo', e.target.value)} />
                                ) : (
                                  <span className="text-xs text-muted-foreground">{med.hsnNo || '—'}</span>
                                )}
                              </td>
                              <td className={cn("px-3 py-1 text-center text-xs tabular-nums", stockColor)}>{stock}</td>
                              <td className="px-3 py-1 text-center">
                                {isReceive ? (
                                  <Input type="number" min="0"
                                    className={cn("w-16 h-6 mx-auto text-center text-xs rounded-md", hasRecvQty && "border-emerald-500/40 ring-1 ring-emerald-500/10 bg-emerald-50/50")}
                                    value={med.receivedQty || ''} placeholder="0"
                                    onChange={e => updateMedicine(origIdx, 'receivedQty', e.target.value === '' ? 0 : Number(e.target.value))}
                                  />
                                ) : (
                                  <span className="text-xs font-medium">{med.receivedQty}</span>
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
              <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/20">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Items with qty: <strong className="text-foreground">{totalSelected}</strong></span>
                  <span>Total Qty: <strong className="text-foreground">{isReceive ? totalRecvQty : totalReqQty}</strong></span>
                  {isReceive && <span>Requested: <strong className="text-foreground">{totalReqQty}</strong></span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-4 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/supplier-orders')}>
                    {isReadOnly ? 'Back' : 'Cancel'}
                  </Button>
                  {(isCreate || isEditDraft) && (
                    <>
                      <Button variant="secondary" size="sm" className="h-8 px-4 text-xs shadow-sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                        <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
                      </Button>
                      <Button size="sm" className="h-8 px-5 text-xs" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                      </Button>
                    </>
                  )}
                  {isReceive && (
                    <Button size="sm" className="h-8 px-5 text-xs bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-md shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30 transition-all" disabled={submitting} onClick={handleReceiveStock}>
                      <Package className="mr-1.5 h-3.5 w-3.5" /> Save Stock
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
