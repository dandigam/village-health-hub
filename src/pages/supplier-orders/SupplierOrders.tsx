import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Package, Trash2, Search, RotateCcw, ChevronUp, ChevronDown, PackageOpen } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSupplierOrders, useWarehouseInventory, useSupplierList } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { Save } from 'lucide-react';

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
  const { data: suppliers = [], refetch: refetchSuppliers } = useSupplierList(warehouseId);
  const { data: warehouseInventory = [], refetch: refetchInventory } = useWarehouseInventory(warehouseId);

  // Filters
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [filterRequestId, setFilterRequestId] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // Sorting
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<number, number>>({});
  const [cancelOrderId, setCancelOrderId] = useState<number | string | null>(null);

  useEffect(() => {
    if (typeof refetchSuppliers === 'function') refetchSuppliers();
    if (typeof refetchOrders === 'function') refetchOrders();
    if (typeof refetchInventory === 'function') refetchInventory();
  }, []);

  const handleReset = () => {
    setFilterSupplier('all');
    setFilterRequestId('');
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterStatus('all');
    setPage(1);
  };

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    let result = [...supplierOrders];

    if (filterSupplier !== 'all') {
      result = result.filter(o => String(o.supplierId) === filterSupplier);
    }
    if (filterRequestId.trim()) {
      result = result.filter(o => String(o.id).includes(filterRequestId.trim()));
    }
    if (filterDateFrom) {
      result = result.filter(o => new Date(o.createdAt) >= new Date(filterDateFrom));
    }
    if (filterDateTo) {
      const to = new Date(filterDateTo);
      to.setHours(23, 59, 59);
      result = result.filter(o => new Date(o.createdAt) <= to);
    }
    if (filterStatus !== 'all') {
      result = result.filter(o => o.status?.toLowerCase() === filterStatus);
    }

    // Sort
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
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  };

  // View order
  const handleViewOrder = async (orderId: number | string) => {
    setLoadingOrder(true);
    setReceivedQtys({});
    try {
      const response = await api.get(`/supplier-orders/${orderId}`, null);
      if (response.data) {
        setSelectedOrder(response.data);
        const qtys: Record<number, number> = {};
        response.data.items?.forEach((item: any) => {
          qtys[item.id] = item.receivedQuantity ?? 0;
        });
        setReceivedQtys(qtys);
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch order details', variant: 'destructive' });
    } finally {
      setLoadingOrder(false);
    }
  };

  // Receive stock
  const handleReceiveStock = async () => {
    if (!selectedOrder?.id) return;
    const overReceivedItems = selectedOrder.items?.filter((item: any) => {
      return (receivedQtys[item.id] || 0) > (item.requestedQuantity || 0);
    });
    if (overReceivedItems?.length > 0) {
      toast({ title: 'Invalid Quantity', description: `Received qty exceeds requested for: ${overReceivedItems.map((i: any) => i.medicineName).join(', ')}`, variant: 'destructive' });
      return;
    }
    const items = selectedOrder.items?.filter((item: any) => receivedQtys[item.id] > 0).map((item: any) => ({ id: item.id, receivedQuantity: receivedQtys[item.id] || 0 }));
    if (!items?.length) {
      toast({ title: 'Error', description: 'Enter received quantity for at least one item.', variant: 'destructive' });
      return;
    }
    let isFullyReceived = true;
    selectedOrder.items?.forEach((item: any) => {
      if ((receivedQtys[item.id] || 0) < (item.requestedQuantity || 0)) isFullyReceived = false;
    });
    const status = isFullyReceived ? 'RECEIVED' : 'PARTIAL';
    try {
      await api.put(`/supplier-orders/${selectedOrder.id}`, { items, status });
      toast({ title: status === 'RECEIVED' ? 'Stock Received' : 'Partially Received', description: status === 'RECEIVED' ? 'All items fully received.' : 'Some items partially received.' });
      setSelectedOrder(null);
      setReceivedQtys({});
      refetchOrders?.();
      refetchInventory?.();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update', variant: 'destructive' });
    }
  };

  // Cancel order
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
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Supplier Orders</h1>
          <p className="text-xs text-muted-foreground">Manage medicine purchase requests and track order status</p>
        </div>
        <Button size="sm" onClick={() => navigate('/supplier-orders/new')}>
          <Send className="mr-2 h-4 w-4" /> Request Stock
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="border rounded-lg bg-card p-3 mb-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="min-w-[150px]">
            <Label className="text-xs mb-1 block">Supplier</Label>
            <Select value={filterSupplier} onValueChange={v => { setFilterSupplier(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All Suppliers" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[120px]">
            <Label className="text-xs mb-1 block">Request ID</Label>
            <Input className="h-8 text-sm" placeholder="Search ID..." value={filterRequestId} onChange={e => { setFilterRequestId(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block">From Date</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block">To Date</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[120px]">
            <Label className="text-xs mb-1 block">Status</Label>
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
          <div className="flex items-center gap-1.5 ml-auto">
            <Button size="sm" variant="outline" className="h-8" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <div className="border rounded-lg bg-card flex flex-col items-center justify-center py-16">
          <PackageOpen className="h-12 w-12 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground font-medium mb-1">No Supplier Orders Found</p>
          <p className="text-xs text-muted-foreground mb-4">Create a new medicine request to get started</p>
          <Button size="sm" onClick={() => navigate('/supplier-orders/new')}>
            <Send className="mr-2 h-4 w-4" /> Create Medicine Request
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-300px)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  <th className="px-3 py-2 text-left font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('id')}>
                    <span className="flex items-center gap-1">Request ID <SortIcon col="id" /></span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('createdAt')}>
                    <span className="flex items-center gap-1">Request Date <SortIcon col="createdAt" /></span>
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('supplierName')}>
                    <span className="flex items-center gap-1">Supplier Name <SortIcon col="supplierName" /></span>
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('itemCount')}>
                    <span className="flex items-center justify-center gap-1">Total Medicines <SortIcon col="itemCount" /></span>
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('totalQty')}>
                    <span className="flex items-center justify-center gap-1">Total Req Qty <SortIcon col="totalQty" /></span>
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-xs cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <span className="flex items-center justify-center gap-1">Status <SortIcon col="status" /></span>
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-xs w-28">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedOrders.map(order => {
                  const statusKey = order.status?.toLowerCase() || 'pending';
                  const config = statusConfig[statusKey] || statusConfig.pending;
                  const canCancel = statusKey === 'draft' || statusKey === 'pending';
                  return (
                    <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="px-3 py-2 font-mono text-xs">#{order.id}</td>
                      <td className="px-3 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-3 py-2 font-medium">{order.supplierName || '-'}</td>
                      <td className="px-3 py-2 text-center">{order.items?.length || 0}</td>
                      <td className="px-3 py-2 text-center">{getTotalQty(order)}</td>
                      <td className="px-3 py-2 text-center">
                        <Badge variant="outline" className={`text-[10px] px-2 py-0.5 ${config.className}`}>{config.label}</Badge>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" title="View Order" onClick={() => handleViewOrder(order.id)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          {(statusKey === 'pending' || statusKey === 'partial') && (
                            <Button size="icon" variant="ghost" className="h-7 w-7" title="Receive Stock" onClick={() => handleViewOrder(order.id)}>
                              <Package className="h-3.5 w-3.5" />
                            </Button>
                          )}
                          {canCancel && (
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" title="Cancel Order" onClick={() => setCancelOrderId(order.id)}>
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
          <div className="flex items-center justify-between px-3 py-2 border-t bg-muted/30 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Rows per page:</span>
              <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground">{filteredOrders.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="px-2 text-muted-foreground">Page {page} of {totalPages}</span>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* View/Receive Order Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setReceivedQtys({}); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>View order details and update received quantities</DialogDescription>
          </DialogHeader>
          {loadingOrder ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground text-sm">Loading...</p>
            </div>
          ) : selectedOrder && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div><p className="text-xs text-muted-foreground">Supplier</p><p className="font-medium">{selectedOrder.supplierName}</p></div>
                <div><p className="text-xs text-muted-foreground">Date</p><p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p></div>
                <div><p className="text-xs text-muted-foreground">Status</p><Badge variant="outline" className={statusConfig[selectedOrder.status?.toLowerCase()]?.className}>{selectedOrder.status}</Badge></div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left text-xs">Medicine</th><th className="p-2 text-center text-xs">Requested</th><th className="p-2 text-center text-xs">Received</th></tr></thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={item.id || i} className="border-b last:border-b-0">
                        <td className="p-2 font-medium">{item.medicineName}</td>
                        <td className="p-2 text-center">{item.requestedQuantity}</td>
                        <td className="p-2 text-center">
                          {selectedOrder.status?.toUpperCase() === 'PENDING' || selectedOrder.status?.toUpperCase() === 'PARTIAL' ? (
                            <Input type="number" min="0" className="w-20 h-7 mx-auto text-center text-sm" value={receivedQtys[item.id] ?? ''} onChange={e => setReceivedQtys({ ...receivedQtys, [item.id]: Number(e.target.value) })} />
                          ) : (item.receivedQuantity ?? '-')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {selectedOrder && (selectedOrder.status?.toUpperCase() === 'PENDING' || selectedOrder.status?.toUpperCase() === 'PARTIAL') && (
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setSelectedOrder(null); setReceivedQtys({}); }}>Cancel</Button>
              <Button size="sm" onClick={handleReceiveStock}><Save className="mr-1 h-3.5 w-3.5" /> Update Received</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation */}
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
