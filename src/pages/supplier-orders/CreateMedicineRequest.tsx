import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Save, Package, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      toast({ title: status === 'DRAFT' ? 'Draft Saved' : 'Request Sent', description: `Order ${status === 'DRAFT' ? 'saved as draft' : 'submitted'}.` });
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
      toast({ title: status === 'RECEIVED' ? 'Stock Received' : 'Partially Received' });
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
      <div className="flex items-center gap-2.5 mb-2.5">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/supplier-orders')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{pageTitle}</h1>
        {id && <span className="text-sm text-muted-foreground font-mono">#{id}</span>}
        {orderStatus && (
          <Badge variant="outline" className={`text-[11px] ml-1 ${statusConfig[statusLower]?.className || ''}`}>
            {orderStatus}
          </Badge>
        )}
        {orderDate && <span className="text-sm text-muted-foreground ml-auto">{new Date(orderDate).toLocaleDateString()}</span>}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10"><p className="text-sm text-muted-foreground">Loading...</p></div>
      ) : (
        <>
          {/* Supplier Info */}
          <div className="border rounded-md bg-card px-3 py-2.5 mb-2.5">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Supplier</Label>
                {canEditRequest && mode === 'create' ? (
                  <Select value={supplierId} onValueChange={setSupplierId}>
                    <SelectTrigger className="h-8 text-sm mt-1"><SelectValue placeholder="Select Supplier" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm font-medium mt-1">{selectedSupplier?.name || '-'}</p>
                )}
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Contact</Label>
                <p className="text-sm mt-1">{selectedSupplier?.contact || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Address</Label>
                <p className="text-sm mt-1">{selectedSupplier?.address || '-'}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Email</Label>
                <p className="text-sm mt-1">{(selectedSupplier as any)?.email || '-'}</p>
              </div>
            </div>
          </div>

          {/* Medicine Grid */}
          {!supplierId ? (
            <div className="border rounded-md bg-card flex flex-col items-center justify-center py-10">
              <Package className="h-10 w-10 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">Select a supplier to load medicine catalog</p>
            </div>
          ) : medicines.length === 0 ? (
            <div className="border rounded-md bg-card flex flex-col items-center justify-center py-10">
              <p className="text-sm text-muted-foreground">No medicines assigned to this supplier</p>
            </div>
          ) : (
            <div className="border rounded-md bg-card overflow-hidden">
              <div className="overflow-auto max-h-[calc(100vh-300px)]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                    <tr className="border-b">
                      <th className="px-3 py-2 text-left font-medium text-xs w-10">#</th>
                      <th className="px-3 py-2 text-left font-medium text-xs">Medicine</th>
                      <th className="px-3 py-2 text-left font-medium text-xs">Category</th>
                      <th className="px-3 py-2 text-center font-medium text-xs">Stock</th>
                      <th className="px-3 py-2 text-center font-medium text-xs w-28">Req Qty</th>
                      {(canReceive || isReadOnly) && <th className="px-3 py-2 text-center font-medium text-xs w-28">Recv Qty</th>}
                      <th className="px-3 py-2 text-left font-medium text-xs">Comments</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicines.map((med, idx) => {
                      const hasQty = med.requestedQty > 0;
                      const stock = getStock(med.medicineId);
                      return (
                        <tr key={med.medicineId} className={`border-b last:border-b-0 transition-colors ${hasQty ? 'bg-primary/5' : 'hover:bg-muted/30'}`}>
                          <td className="px-3 py-1.5 text-muted-foreground text-xs">{idx + 1}</td>
                          <td className="px-3 py-1.5 font-medium">{med.medicineName}</td>
                          <td className="px-3 py-1.5 text-muted-foreground">{med.category}</td>
                          <td className="px-3 py-1.5 text-center">
                            <span className={stock <= 0 ? 'text-destructive font-medium' : stock < 30 ? 'text-orange-600 font-medium' : 'text-muted-foreground'}>{stock}</span>
                          </td>
                          <td className="px-3 py-1.5 text-center">
                            {canEditRequest ? (
                              <Input type="number" min="0" className={`w-24 h-8 mx-auto text-center text-sm ${hasQty ? 'border-primary/50 bg-primary/5' : ''}`}
                                value={med.requestedQty || ''} placeholder="0"
                                onChange={e => updateMedicine(idx, 'requestedQty', e.target.value === '' ? 0 : Number(e.target.value))} />
                            ) : (
                              <span>{med.requestedQty}</span>
                            )}
                          </td>
                          {(canReceive || isReadOnly) && (
                            <td className="px-3 py-1.5 text-center">
                              {canReceive ? (
                                <Input type="number" min="0" className="w-24 h-8 mx-auto text-center text-sm"
                                  value={med.receivedQty || ''} placeholder="0"
                                  onChange={e => updateMedicine(idx, 'receivedQty', e.target.value === '' ? 0 : Number(e.target.value))} />
                              ) : (
                                <span>{med.receivedQty}</span>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-1.5">
                            {canEditRequest ? (
                              <Input className="h-8 text-sm" placeholder="Optional" value={med.comments}
                                onChange={e => updateMedicine(idx, 'comments', e.target.value)} />
                            ) : (
                              <span className="text-muted-foreground">{med.comments || '-'}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30">
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-muted-foreground">Selected: <strong className="text-foreground">{totalSelected}</strong></span>
                  <span className="text-muted-foreground">Req Qty: <strong className="text-foreground">{totalQty}</strong></span>
                  {(canReceive || isReadOnly) && <span className="text-muted-foreground">Recv Qty: <strong className="text-foreground">{totalReceived}</strong></span>}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigate('/supplier-orders')}>
                    {isReadOnly ? 'Back' : 'Cancel'}
                  </Button>
                  {canEditRequest && (
                    <>
                      <Button variant="secondary" size="sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('DRAFT')}>
                        <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
                      </Button>
                      <Button size="sm" disabled={submitting || totalSelected === 0} onClick={() => handleSubmit('PENDING')}>
                        <Send className="mr-1.5 h-3.5 w-3.5" /> Submit
                      </Button>
                    </>
                  )}
                  {canReceive && (
                    <Button size="sm" disabled={submitting} onClick={handleReceiveStock}>
                      <Package className="mr-1.5 h-3.5 w-3.5" /> Update Received
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
