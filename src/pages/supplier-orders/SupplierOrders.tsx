import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Send, Eye, Package, Trash2, ChevronUp, ChevronDown, PackageOpen, Filter, CheckCircle2, AlertCircle, X, MoreVertical, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useSupplierOrders } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';
import { cn } from '@/lib/utils';

type BannerType = 'success' | 'error';
interface BannerState { type: BannerType; message: string }

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  partial: { label: 'Partial', dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  received: { label: 'Received', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  cancelled: { label: 'Cancelled', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  draft: { label: 'Draft', dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  sent: { label: 'Sent', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
};

type SortKey = 'id' | 'createdAt' | 'supplierName' | 'itemCount' | 'totalQty' | 'status';
type SortDir = 'asc' | 'desc';

export default function SupplierOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: supplierOrders = [], refetch: refetchOrders } = useSupplierOrders(warehouseId);

  const [filterSearch, setFilterSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [cancelOrderId, setCancelOrderId] = useState<number | string | null>(null);
  const [banner, setBanner] = useState<BannerState | null>(null);

  // Pick up banner from navigation state
  useEffect(() => {
    const navBanner = (location.state as any)?.banner;
    if (navBanner) {
      setBanner(navBanner);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => { refetchOrders?.(); }, []);

  const filteredOrders = useMemo(() => {
    let result = [...supplierOrders];
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(o => String(o.id).includes(q) || o.supplierName?.toLowerCase().includes(q));
    }
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
  }, [supplierOrders, filterSearch, filterStatus, sortKey, sortDir]);

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
      setBanner({ type: 'success', message: 'Order has been cancelled successfully.' });
      setCancelOrderId(null);
      refetchOrders?.();
    } catch (error: any) {
      setBanner({ type: 'error', message: error.message || 'Failed to cancel order.' });
    }
  };

  const getTotalQty = (order: any) => order.items?.reduce((s: number, i: any) => s + (i.requestedQuantity || i.requestedQty || 0), 0) || 0;

  return (
    <DashboardLayout>
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

      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-lg font-semibold text-foreground">Supplier Orders</h1>
        <span className="text-sm text-muted-foreground">({supplierOrders.length})</span>
        
        <div className="flex-1 max-w-sm ml-4">
          <Input 
            className="h-9 text-sm" 
            placeholder="Search by Request ID / Supplier" 
            value={filterSearch} 
            onChange={e => { setFilterSearch(e.target.value); setPage(1); }} 
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[140px] text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/supplier-orders/new')}>
            <Send className="mr-1.5 h-4 w-4" /> Request Stock
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="border rounded-xl bg-gradient-to-br from-card to-muted/10 flex flex-col items-center justify-center py-16 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No Orders Found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first medicine request to get started</p>
          <Button size="sm" className="shadow-md" onClick={() => navigate('/supplier-orders/new')}>
            <Send className="mr-1.5 h-4 w-4" /> New Request
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                {[
                  { key: 'id' as SortKey, label: 'Request ID', align: 'text-left' },
                  { key: 'createdAt' as SortKey, label: 'Date', align: 'text-left' },
                  { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                  { key: 'itemCount' as SortKey, label: 'Medicines', align: 'text-center' },
                  { key: 'totalQty' as SortKey, label: 'Req Qty', align: 'text-center' },
                  { key: 'status' as SortKey, label: 'Status', align: 'text-center' },
                ].map(col => (
                  <th 
                    key={col.key} 
                    className={cn(
                      "px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
                      col.align
                    )} 
                    onClick={() => handleSort(col.key)}
                  >
                    <span className={cn("flex items-center gap-1", col.align === 'text-center' && 'justify-center')}>
                      {col.label} <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedOrders.map((order) => {
                const statusKey = order.status?.toLowerCase() || 'pending';
                const config = statusConfig[statusKey] || statusConfig.pending;
                const canCancel = statusKey === 'draft' || statusKey === 'pending';
                const canReceive = statusKey === 'pending' || statusKey === 'partial';
                return (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-primary">#{order.id}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm">{order.supplierName || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{order.items?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{getTotalQty(order)}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border", config.bg, config.text, config.border)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                        {config.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all" 
                          onClick={() => navigate(`/supplier-orders/${order.id}`)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {canReceive && (
                          <Button 
                            size="sm" 
                            className="h-7 px-3 text-xs font-medium bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm rounded-full transition-all" 
                            onClick={() => navigate(`/supplier-orders/${order.id}/edit`)}
                          >
                            <Package className="h-3.5 w-3.5 mr-1" /> Receive
                          </Button>
                        )}
                        {canCancel && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all" 
                            onClick={() => setCancelOrderId(order.id)}
                            title="Cancel Order"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">{filteredOrders.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="sm"
                variant="ghost" 
                className="h-8" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
              >
                Prev
              </Button>
              <span className="px-3 text-sm text-muted-foreground">{page}/{totalPages}</span>
              <Button 
                size="sm"
                variant="ghost" 
                className="h-8" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
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
