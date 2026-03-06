import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Package, Trash2, RotateCcw, ChevronUp, ChevronDown, PackageOpen, Pencil, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
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
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  partial: { label: 'Partial', dot: 'bg-orange-500 animate-pulse', bg: 'bg-orange-50', text: 'text-orange-700' },
  received: { label: 'Received', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-muted-foreground', bg: 'bg-muted/60', text: 'text-muted-foreground' },
  draft: { label: 'Draft', dot: 'bg-muted-foreground', bg: 'bg-muted/60', text: 'text-muted-foreground' },
  sent: { label: 'Sent', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
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
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { refetchOrders?.(); }, []);

  const handleReset = () => {
    setFilterSupplier('all'); setFilterRequestId(''); setFilterDateFrom(''); setFilterDateTo(''); setFilterStatus('all'); setPage(1);
  };

  const hasActiveFilters = filterSupplier !== 'all' || filterRequestId || filterDateFrom || filterDateTo || filterStatus !== 'all';

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
    if (sortKey !== col) return <ChevronUp className="h-3 w-3 opacity-20" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
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
      <div className="flex items-center gap-3 mb-3">
        <h1 className="text-lg font-bold tracking-tight text-foreground">Supplier Orders</h1>
        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{supplierOrders.length}</Badge>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="outline" size="sm" className={cn("h-8 text-xs", hasActiveFilters && "border-primary text-primary")} onClick={() => setShowFilters(!showFilters)}>
            <Filter className="mr-1.5 h-3 w-3" />
            Filters
            {hasActiveFilters && <span className="ml-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">!</span>}
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => navigate('/supplier-orders/new')}>
            <Send className="mr-1.5 h-3.5 w-3.5" /> Request Stock
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="border rounded-lg bg-card px-3 py-2.5 mb-3 overflow-hidden"
        >
          <div className="flex flex-wrap items-end gap-2.5">
            <div className="min-w-[150px]">
              <Label className="text-[10px] mb-0.5 block text-muted-foreground uppercase tracking-wider">Supplier</Label>
              <Select value={filterSupplier} onValueChange={v => { setFilterSupplier(v); setPage(1); }}>
                <SelectTrigger className="h-7 text-xs"><SelectValue placeholder="All Suppliers" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="min-w-[100px]">
              <Label className="text-[10px] mb-0.5 block text-muted-foreground uppercase tracking-wider">Request ID</Label>
              <Input className="h-7 text-xs" placeholder="ID..." value={filterRequestId} onChange={e => { setFilterRequestId(e.target.value); setPage(1); }} />
            </div>
            <div className="min-w-[120px]">
              <Label className="text-[10px] mb-0.5 block text-muted-foreground uppercase tracking-wider">From</Label>
              <Input type="date" className="h-7 text-xs" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
            </div>
            <div className="min-w-[120px]">
              <Label className="text-[10px] mb-0.5 block text-muted-foreground uppercase tracking-wider">To</Label>
              <Input type="date" className="h-7 text-xs" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
            </div>
            <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={handleReset}>
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
        </motion.div>
      )}

      {/* Table */}
      <div className="border rounded-lg bg-card overflow-hidden flex flex-col" style={{ minHeight: 'calc(100vh - 280px)' }}>
        {filteredOrders.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-16">
            <PackageOpen className="h-12 w-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">No orders found</p>
            <p className="text-xs text-muted-foreground mb-4">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Create your first medicine request'}
            </p>
            {hasActiveFilters ? (
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={handleReset}>
                <RotateCcw className="mr-1.5 h-3 w-3" /> Clear Filters
              </Button>
            ) : (
              <Button size="sm" className="h-7 text-xs" onClick={() => navigate('/supplier-orders/new')}>
                <Send className="mr-1.5 h-3 w-3" /> New Request
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-auto flex-1">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-muted/50 backdrop-blur-sm">
                  <tr className="border-b">
                    {[
                      { key: 'id' as SortKey, label: 'Request ID', align: 'text-left' },
                      { key: 'createdAt' as SortKey, label: 'Date', align: 'text-left' },
                      { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                      { key: 'itemCount' as SortKey, label: 'Medicines', align: 'text-center' },
                      { key: 'totalQty' as SortKey, label: 'Req Qty', align: 'text-center' },
                      { key: 'status' as SortKey, label: 'Status', align: 'text-center' },
                    ].map(col => (
                      <th key={col.key} className={cn("px-3 py-2 font-medium text-[11px] uppercase tracking-wider text-muted-foreground cursor-pointer select-none whitespace-nowrap", col.align)} onClick={() => handleSort(col.key)}>
                        <span className={cn("flex items-center gap-1", col.align === 'text-center' && 'justify-center')}>{col.label} <SortIcon col={col.key} /></span>
                      </th>
                    ))}
                    <th className="px-3 py-2 text-center font-medium text-[11px] uppercase tracking-wider text-muted-foreground w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {pagedOrders.map((order) => {
                    const statusKey = order.status?.toLowerCase() || 'pending';
                    const config = statusConfig[statusKey] || statusConfig.pending;
                    const canCancel = statusKey === 'draft' || statusKey === 'pending';
                    const canEdit = statusKey === 'draft';
                    const canReceive = statusKey === 'pending' || statusKey === 'partial';
                    return (
                      <tr key={order.id} className="hover:bg-accent/30 transition-colors">
                        <td className="px-3 py-2 font-mono text-xs font-medium">#{order.id}</td>
                        <td className="px-3 py-2 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-3 py-2 font-medium text-xs">{order.supplierName || '-'}</td>
                        <td className="px-3 py-2 text-center text-xs tabular-nums">{order.items?.length || 0}</td>
                        <td className="px-3 py-2 text-center text-xs tabular-nums font-medium">{getTotalQty(order)}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium", config.bg, config.text)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                            {config.label}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <div className="flex items-center justify-center gap-0.5">
                            <Button size="icon" variant="ghost" className="h-6 w-6" title="View" onClick={() => navigate(`/supplier-orders/${order.id}`)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            {canEdit && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" title="Edit" onClick={() => navigate(`/supplier-orders/${order.id}/edit`)}>
                                <Pencil className="h-3 w-3" />
                              </Button>
                            )}
                            {canReceive && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" title="Receive Stock" onClick={() => navigate(`/supplier-orders/${order.id}/edit`)}>
                                <Package className="h-3 w-3" />
                              </Button>
                            )}
                            {canCancel && (
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive hover:text-destructive" title="Cancel" onClick={() => setCancelOrderId(order.id)}>
                                <Trash2 className="h-3 w-3" />
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
            <div className="flex items-center justify-between px-3 py-1.5 border-t bg-muted/20 text-xs mt-auto">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rows:</span>
                <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                  <SelectTrigger className="h-6 w-14 text-[11px]"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                  </SelectContent>
                </Select>
                <span className="text-muted-foreground">{filteredOrders.length} total</span>
              </div>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                <span className="px-2 text-muted-foreground">{page}/{totalPages}</span>
                <Button size="sm" variant="outline" className="h-6 px-2 text-[11px]" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

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
