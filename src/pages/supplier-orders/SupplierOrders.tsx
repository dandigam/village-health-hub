import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Package, Trash2, RotateCcw, ChevronUp, ChevronDown, PackageOpen, Pencil } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplierOrders, useSupplierList } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  partial: { label: 'Partial', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  received: { label: 'Received', className: 'bg-green-100 text-green-800 border-green-300' },
  cancelled: { label: 'Cancelled', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  draft: { label: 'Draft', className: 'bg-gray-100 text-gray-700 border-gray-300' },
  sent: { label: 'Sent', className: 'bg-blue-100 text-blue-700 border-blue-300' },
};

type SortKey = 'id' | 'createdAt' | 'supplierName' | 'itemCount' | 'totalQty' | 'status';
type SortDir = 'asc' | 'desc';

export default function SupplierOrders() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: supplierOrders = [], refetch: refetchOrders } = useSupplierOrders(warehouseId);
  const { data: suppliers = [] } = useSupplierList(warehouseId);

  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelOrderId, setCancelOrderId] = useState<number | string | null>(null);

  useEffect(() => { refetchOrders?.(); }, []);

  const handleReset = () => {
    setFilterSupplier('all'); setFilterRequestId(''); setFilterDateFrom(''); setFilterDateTo(''); setFilterStatus('all'); setPage(1);
  };

  const filteredOrders = useMemo(() => {
    let result = [...supplierOrders];
    if (filterSupplier !== 'all') result = result.filter(o => String(o.supplierId) === filterSupplier);
    if (filterRequestId.trim()) result = result.filter(o => String(o.id).includes(filterRequestId.trim()));
    if (filterDateFrom) result = result.filter(o => new Date(o.createdAt) >= new Date(filterDateFrom));
    if (filterDateTo) { const to = new Date(filterDateTo); to.setHours(23, 59, 59); result = result.filter(o => new Date(o.createdAt) <= to); }
    if (filterStatus !== 'all') result = result.filter(o => o.status?.toLowerCase() === filterStatus);
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'id': aVal = a.id; bVal = b.id; break;
        case 'createdAt': aVal = new Date(a.createdAt).getTime(); bVal = new Date(b.createdAt).getTime(); break;
        case 'supplierName': aVal = (a.supplierName || '').toLowerCase(); bVal = (b.supplierName || '').toLowerCase(); break;
        case 'itemCount': aVal = a.items?.length || 0; bVal = b.items?.length || 0; break;
        case 'totalQty': aVal = a.items?.reduce((s: number, i: any) => s + (i.requestedQuantity || i.requestedQty || 0), 0) || 0; bVal = b.items?.reduce((s: number, i: any) => s + (i.requestedQuantity || i.requestedQty || 0), 0) || 0; break;
        case 'status': aVal = a.status?.toLowerCase(); bVal = b.status?.toLowerCase(); break;
        default: aVal = 0; bVal = 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [supplierOrders, filterSupplier, filterRequestId, filterDateFrom, filterDateTo, filterStatus, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / rowsPerPage));
  const pagedOrders = filteredOrders.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      await api.delete(`/supplier-orders/${cancelOrderId}`);
      toast({ title: 'Order Cancelled', description: 'The order has been cancelled.' });
      setCancelOrderId(null);
      refetchOrders?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  const getTotalQty = (order: any) => order.items?.reduce((s: number, i: any) => s + (i.requestedQuantity || i.requestedQty || 0), 0) || 0;

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Supplier Orders</h1>
        <Button size="sm" onClick={() => navigate('/supplier-orders/new')}>
          <Send className="mr-1.5 h-4 w-4" /> Request Stock
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="border rounded-md bg-card px-3 py-2.5 mb-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[150px]">
            <Label className="text-xs mb-1 block text-muted-foreground">Supplier</Label>
            <Select value={filterSupplier} onValueChange={v => { setFilterSupplier(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All Suppliers" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[110px]">
            <Label className="text-xs mb-1 block text-muted-foreground">Request ID</Label>
            <Input className="h-8 text-sm" placeholder="Search ID..." value={filterRequestId} onChange={e => { setFilterRequestId(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block text-muted-foreground">From</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block text-muted-foreground">To</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[110px]">
            <Label className="text-xs mb-1 block text-muted-foreground">Status</Label>
            <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" variant="outline" className="h-8 ml-auto" onClick={handleReset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="border rounded-md bg-card flex flex-col items-center justify-center py-12">
          <PackageOpen className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground font-medium mb-2">No Supplier Orders Found</p>
          <Button size="sm" onClick={() => navigate('/supplier-orders/new')}>
            <Send className="mr-1.5 h-4 w-4" /> Create Medicine Request
          </Button>
        </div>
      ) : (
        <div className="border rounded-md bg-card overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-260px)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  {[
                    { key: 'id' as SortKey, label: 'Request ID', align: 'text-left' },
                    { key: 'createdAt' as SortKey, label: 'Date', align: 'text-left' },
                    { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                    { key: 'itemCount' as SortKey, label: 'Medicines', align: 'text-center' },
                    { key: 'totalQty' as SortKey, label: 'Req Qty', align: 'text-center' },
                    { key: 'status' as SortKey, label: 'Status', align: 'text-center' },
                  ].map(col => (
                    <th key={col.key} className={`px-3 py-2 font-medium text-xs ${col.align} cursor-pointer select-none`} onClick={() => handleSort(col.key)}>
                      <span className={`flex items-center gap-1 ${col.align === 'text-center' ? 'justify-center' : ''}`}>{col.label} <SortIcon col={col.key} /></span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-xs w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map(order => {
                  const statusKey = order.status?.toLowerCase() || 'pending';
                  const config = statusConfig[statusKey] || statusConfig.pending;
                  const canCancel = statusKey === 'draft' || statusKey === 'pending';
                  const canEdit = statusKey === 'draft';
                  const canReceive = statusKey === 'pending' || statusKey === 'partial';
                  return (
                    <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-1.5 font-mono text-xs">#{order.id}</td>
                      <td className="px-3 py-1.5">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-1.5 font-medium">{order.supplierName || '-'}</td>
                      <td className="px-3 py-1.5 text-center">{order.items?.length || 0}</td>
                      <td className="px-3 py-1.5 text-center">{getTotalQty(order)}</td>
                      <td className="px-3 py-1.5 text-center">
                        <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${config.className}`}>{config.label}</Badge>
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" title="View" onClick={() => navigate(`/supplier-orders/${order.id}`)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {canEdit && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => navigate(`/supplier-orders/${order.id}/edit`)}>
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canReceive && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Receive Stock" onClick={() => navigate(`/supplier-orders/${order.id}/edit`)}>
                              <Package className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canCancel && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="Cancel" onClick={() => setCancelOrderId(order.id)}>
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-xs">Rows:</span>
              <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-xs">{filteredOrders.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="px-2 text-xs text-muted-foreground">{page}/{totalPages}</span>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmDialog
        open={cancelOrderId !== null}
        onOpenChange={(open) => !open && setCancelOrderId(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
      />
    </DashboardLayout>
  );
}
