import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package, Search, Upload, FileImage, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupplierList, useWarehouseInventory } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

interface MedicineRow {
  id?: number;
  medicineId: string;
  medicineName: string;
  category: string;
  company: string;
  packSize: string;
  lastOrderedQty: number;
  requestedQty: number;
  receivedQty: number;
  comments: string;
}

type PageMode = 'create' | 'view' | 'edit';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  partial: { label: 'Partial', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  received: { label: 'Received', className: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelled', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-300' },
};

export default function CreateMedicineRequest() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditRoute = window.location.pathname.endsWith('/edit');
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: suppliers = [] } = useSupplierList(warehouseId);
  const { data: warehouseInventory = [] } = useWarehouseInventory(warehouseId);

  const [mode, setMode] = useState<PageMode>(id ? (isEditRoute ? 'edit' : 'view') : 'create');
  const [supplierId, setSupplierId] = useState('');
  const [medicines, setMedicines] = useState<MedicineRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceFiles, setInvoiceFiles] = useState<{ name: string; url: string; file?: File }[]>([]);
  const [showImagePreview, setShowImagePreview] = useState<string | null>(null);

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

  const selectedSupplier = useMemo(() => suppliers.find(s => String(s.id) === supplierId), [suppliers, supplierId]);

  const statusLower = orderStatus.toLowerCase();
  const canEditRequest = mode === 'create' || (mode === 'edit' && statusLower === 'draft');
  const canReceive = mode === 'edit' && (statusLower === 'pending' || statusLower === 'partial');
  const isReadOnly = mode === 'view';

  // Load existing order
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/supplier-orders/${id}`, null).then(res => {
      const order = res.data;
      if (order) {
        setSupplierId(String(order.supplierId));
        setOrderStatus(order.status || '');
        setOrderDate(order.createdAt || '');
        setMedicines((order.items || []).map((item: any) => ({
          id: item.id,
          medicineId: String(item.medicineId),
          medicineName: item.medicineName || '-',
          category: item.category || item.medicineType || '-',
          company: item.company || '-',
          packSize: item.packSize || '-',
          lastOrderedQty: 0,
          requestedQty: item.requestedQuantity || 0,
          receivedQty: item.receivedQuantity || 0,
          comments: item.comments || '',
        })));
      }
    }).catch(err => {
      toast({ title: 'Error', description: err.message || 'Failed to load order', variant: 'destructive' });
    }).finally(() => setLoading(false));
  }, [id]);

  // Load medicines when supplier changes (create mode only)
  useEffect(() => {
    if (mode !== 'create' || !supplierId) { if (mode === 'create') setMedicines([]); return; }
    const supplier = suppliers.find(s => String(s.id) === supplierId);
    const meds = supplier?.medicines ?? [];
    setMedicines(meds.map(m => ({
      medicineId: String(m.id),
      medicineName: m.name || '-',
      category: (m as any).category || (m as any).medicineType || '-',
      company: (m as any).company || '-',
      packSize: (m as any).packSize || '-',
      lastOrderedQty: 0,
      requestedQty: 0,
      receivedQty: 0,
      comments: '',
    })));
  }, [supplierId, suppliers, mode]);

  const totalSelected = medicines.filter(m => m.requestedQty > 0).length;
  const totalQty = medicines.reduce((s, m) => s + m.requestedQty, 0);
  const totalReceived = medicines.reduce((s, m) => s + m.receivedQty, 0);

  const filteredMedicines = useMemo(() => {
    if (!medSearch.trim()) return medicines;
    const q = medSearch.toLowerCase();
    return medicines.filter(m => m.medicineName.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
  }, [medicines, medSearch]);

  const getStock = (medicineId: string) => {
    const item = warehouseInventory.find(inv => String(inv.medicineId) === medicineId);
    return item?.totalQty || 0;
  };

  const handleSubmit = async (status: 'PENDING' | 'DRAFT') => {
    const validItems = medicines.filter(m => m.requestedQty > 0);
    if (validItems.length === 0) { toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' }); return; }
    setSubmitting(true);
    try {
      const payload = {
        warehouseId, supplierId: Number(supplierId), status,
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      if (mode === 'edit' && id) {
        await api.put(`/supplier-orders/${id}`, payload);
      } else {
        await api.post('/supplier-orders', payload);
      }
      toast({ 
        title: status === 'DRAFT' ? '📋 Draft Saved' : '✅ Request Sent Successfully', 
        description: status === 'DRAFT' 
          ? `Medicine request saved as draft with ${validItems.length} items.`
          : `Request has been successfully created and sent to supplier "${selectedSupplier?.name || ''}" with ${validItems.length} medicines (${totalQty} units total).`
      });
      navigate('/supplier-orders');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to submit', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const handleReceiveStock = async () => {
    if (!id) return;
    const overItems = medicines.filter(m => m.receivedQty > m.requestedQty);
    if (overItems.length > 0) {
      toast({ title: 'Invalid', description: `Received exceeds requested for: ${overItems.map(i => i.medicineName).join(', ')}`, variant: 'destructive' });
      return;
    }
    const items = medicines.filter(m => m.receivedQty > 0).map(m => ({ id: m.id, receivedQuantity: m.receivedQty }));
    if (!items.length) { toast({ title: 'Error', description: 'Enter received qty for at least one item.', variant: 'destructive' }); return; }
    const isFullyReceived = medicines.every(m => m.receivedQty >= m.requestedQty);
    const status = isFullyReceived ? 'RECEIVED' : 'PARTIAL';
    setSubmitting(true);
    try {
      await api.put(`/supplier-orders/${id}`, { items, status });
      toast({ 
        title: status === 'RECEIVED' ? '✅ Stock Received Successfully' : '📦 Stock Partially Received', 
        description: status === 'RECEIVED' 
          ? `All items for Request #${id} have been received and stock updated.`
          : `Partial stock received for Request #${id}. ${items.length} items updated with ${totalReceived} units.`
      });
      navigate('/supplier-orders');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
    } finally { setSubmitting(false); }
  };

  const updateMedicine = (idx: number, field: keyof MedicineRow, value: any) => {
    const updated = [...medicines];
    (updated[idx] as any)[field] = value;
    setMedicines(updated);
  };

  const pageTitle = mode === 'create' ? 'Create Medicine Request' : mode === 'edit' ? (canReceive ? 'Receive Stock' : 'Edit Request') : 'View Request';

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-3">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
        {orderStatus && (
          <Badge variant="outline" className={`text-[11px] ml-1 ${statusConfig[statusLower]?.className || ''}`}>
            {orderStatus}
          </Badge>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <div className="border rounded-xl bg-card shadow-sm overflow-hidden">
          {/* ORDER INFORMATION section */}
          <div className="px-4 py-3 border-b">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wider mb-2.5">
              {canReceive ? 'Request & Invoice Information' : 'Order Information'}
            </p>
            <div className="flex flex-wrap items-end gap-x-4 gap-y-2">
              {/* Supplier */}
              <div className="min-w-[160px]">
                <Label className="text-[11px] text-muted-foreground">Supplier *</Label>
                {canEditRequest && mode === 'create' ? (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-8 text-sm mt-0.5"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">{selectedSupplier?.name || '-'}</p>
                )}
              </div>

              {/* Supplier details - show in create/edit (not receive) */}
              {selectedSupplier && !canReceive && (
                <>
                  <div className="min-w-[120px]">
                    <Label className="text-[11px] text-muted-foreground">Contact</Label>
                    <p className="text-sm mt-0.5 h-8 flex items-center">{selectedSupplier.contact || '-'}</p>
                  </div>
                  <div className="min-w-[200px]">
                    <Label className="text-[11px] text-muted-foreground">Address</Label>
                    <p className="text-sm mt-0.5 h-8 flex items-center">{selectedSupplier.address || '-'}</p>
                  </div>
                  {(selectedSupplier as any).city && (
                    <div className="min-w-[100px]">
                      <Label className="text-[11px] text-muted-foreground">City</Label>
                      <p className="text-sm mt-0.5 h-8 flex items-center">{(selectedSupplier as any).city}</p>
                    </div>
                  )}
                  {(selectedSupplier as any).phone && (
                    <div className="min-w-[120px]">
                      <Label className="text-[11px] text-muted-foreground">Phone</Label>
                      <p className="text-sm mt-0.5 h-8 flex items-center">{(selectedSupplier as any).phone}</p>
                    </div>
                  )}
                  {(selectedSupplier as any).gstNumber && (
                    <div className="min-w-[120px]">
                      <Label className="text-[11px] text-muted-foreground">GST No.</Label>
                      <p className="text-sm mt-0.5 h-8 flex items-center">{(selectedSupplier as any).gstNumber}</p>
                    </div>
                  )}
                </>
              )}

              {/* Request ID & Date (receive/view mode) */}
              {(canReceive || isReadOnly) && id && (
                <div className="min-w-[100px]">
                  <Label className="text-[11px] text-muted-foreground">Request ID</Label>
                  <p className="text-sm font-semibold font-mono mt-0.5 h-8 flex items-center">#{id}</p>
                </div>
              )}
              {(canReceive || isReadOnly) && (
                <div className="min-w-[100px]">
                  <Label className="text-[11px] text-muted-foreground">Request Date</Label>
                  <p className="text-sm font-medium mt-0.5 h-8 flex items-center">{orderDate ? new Date(orderDate).toLocaleDateString() : '-'}</p>
                </div>
              )}

              {/* Invoice fields - ONLY in receive mode */}
              {canReceive && (
                <>
                  <div className="min-w-[120px]">
                    <Label className="text-[11px] text-muted-foreground">Invoice No.</Label>
                    <Input className="h-8 text-sm mt-0.5" placeholder="INV-001" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
                  </div>
                  <div className="min-w-[100px]">
                    <Label className="text-[11px] text-muted-foreground">Amount (₹)</Label>
                    <Input type="number" min="0" className="h-8 text-sm mt-0.5" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
                  </div>
                  <div className="min-w-[140px]">
                    <Label className="text-[11px] text-muted-foreground">Invoice Date</Label>
                    <Input type="date" className="h-8 text-sm mt-0.5" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                  </div>
                  {/* Inline Attachments */}
                  <div className="flex items-center gap-1.5 ml-auto pb-0.5">
                    {invoiceFiles.map((f, idx) => (
                      <div key={idx} className="group relative flex items-center gap-1 border rounded bg-muted/30 px-1.5 py-1 text-[11px] cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setShowImagePreview(f.url)}>
                        <FileImage className="w-3 h-3 text-primary shrink-0" />
                        <span className="max-w-[80px] truncate">{f.name}</span>
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
                </>
              )}
            </div>
          </div>

          {/* MEDICINE DETAILS section */}
          {!supplierId ? (
            <div className="flex flex-col items-center justify-center py-14">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Select a supplier to load medicine catalog</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14">
              <p className="text-sm text-muted-foreground">No medicines assigned to this supplier</p>
            </div>
          ) : (
            <>
              {/* Medicine header bar */}
              <div className="px-4 py-2 border-b flex items-center gap-3">
                <p className="text-[11px] font-semibold text-primary uppercase tracking-wider">Medicine Details</p>
                <Badge variant="secondary" className="text-[11px] px-2 py-0 h-5">{medicines.length} medicines</Badge>
                <div className="ml-auto flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      className="h-8 text-sm pl-8 w-48"
                      placeholder="Filter medicines..."
                      value={medSearch}
                      onChange={e => setMedSearch(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-auto max-h-[calc(100vh-320px)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/60 backdrop-blur-sm">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-10">#</th>
                      <th className="px-3 py-2 text-left font-semibold text-[11px] uppercase tracking-wider text-muted-foreground">Medicine</th>
                      <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">Stock</th>
                      {canReceive && <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-24">Req Qty</th>}
                      {canReceive && <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-28">Batch</th>}
                      {canReceive && <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-36">Exp Date</th>}
                      {canReceive && <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">HSN</th>}
                      <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">
                        {canReceive ? 'Recv Qty' : 'Qty'}
                      </th>
                      {!canEditRequest && !canReceive && <th className="px-3 py-2 text-center font-semibold text-[11px] uppercase tracking-wider text-muted-foreground w-20">Recv Qty</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMedicines.map((med, idx) => {
                      const origIdx = medicines.findIndex(m => m.medicineId === med.medicineId);
                      const hasQty = canReceive ? med.receivedQty > 0 : med.requestedQty > 0;
                      const stock = getStock(med.medicineId);
                      const stockColor = stock <= 0 ? 'text-destructive font-bold' : stock < 30 ? 'text-orange-600 font-semibold' : 'text-muted-foreground';
                      const zebra = idx % 2 === 1 ? 'bg-muted/10' : '';
                      const rowBg = hasQty ? 'bg-primary/5' : zebra;
                      return (
                        <tr key={med.medicineId} className={`border-b last:border-b-0 hover:bg-accent/20 transition-colors ${rowBg}`}>
                          <td className="px-3 py-1.5 text-muted-foreground text-xs">{origIdx + 1}</td>
                          <td className="px-3 py-1.5">
                            <span className="font-medium">{med.medicineName}</span>
                            <span className="text-muted-foreground ml-2 text-xs">{med.category !== '-' ? med.category : ''}</span>
                          </td>
                          <td className={`px-3 py-1.5 text-center text-xs ${stockColor}`}>{stock}</td>
                          {canReceive && (
                            <td className="px-3 py-1.5 text-center font-medium">{med.requestedQty}</td>
                          )}
                          {canEditRequest && (
                            <>
                              <td className="px-3 py-1.5 text-center">
                                <Input className="w-20 h-7 mx-auto text-center text-xs" placeholder="Batch" />
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <Input type="date" className="w-32 h-7 mx-auto text-xs" />
                              </td>
                              <td className="px-3 py-1.5 text-center">
                                <Input className="w-16 h-7 mx-auto text-center text-xs" placeholder="HSN" />
                              </td>
                            </>
                          )}
                          <td className="px-3 py-1.5 text-center">
                            {canEditRequest ? (
                              <Input type="number" min="0" className={`w-16 h-7 mx-auto text-center text-xs ${hasQty ? 'border-primary/50 bg-primary/5' : ''}`}
                                value={med.requestedQty || ''} placeholder="0"
                                onChange={e => updateMedicine(origIdx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))} />
                            ) : canReceive ? (
                              <Input type="number" min="0" className={`w-16 h-7 mx-auto text-center text-xs ${hasQty ? 'border-emerald-500/50 bg-emerald-50' : ''}`}
                                value={med.receivedQty || ''} placeholder="0"
                                onChange={e => updateMedicine(origIdx, 'receivedQty', e.target.value === '' ? 0 : Number(e.target.value))} />
                            ) : (
                              <span>{med.requestedQty}</span>
                            )}
                          </td>
                          {!canEditRequest && !canReceive && (
                            <td className="px-3 py-1.5 text-center">{med.receivedQty}</td>
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-4 py-2.5 border-t">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>Items with qty: <strong className="text-foreground">{totalSelected}</strong></span>
                  <span>Total Qty: <strong className="text-foreground">{canReceive ? totalReceived : totalQty}</strong></span>
                  {canReceive && <span>Requested: <strong className="text-foreground">{totalQty}</strong></span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="h-8 px-4 text-xs text-muted-foreground hover:text-foreground" onClick={() => navigate('/supplier-orders')}>
                    {isReadOnly ? 'Back' : 'Cancel'}
                  </Button>
                  {canEditRequest && (
                    <>
                      <Button variant="secondary" size="sm" className="h-8 px-4 text-xs shadow-sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                        <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
                      </Button>
                      <Button size="sm" className="h-8 px-5 text-xs bg-gradient-to-r from-primary to-[hsl(var(--accent))] shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Submit Request
                      </Button>
                    </>
                  )}
                  {canReceive && (
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
          <DialogHeader>
            <DialogTitle className="text-sm">Invoice Preview</DialogTitle>
          </DialogHeader>
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
