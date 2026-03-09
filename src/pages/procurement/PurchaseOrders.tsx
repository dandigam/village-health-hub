import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, ChevronUp, ChevronDown, Eye, Package, MoreVertical, Download, PackageOpen, X, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { StatusBadge } from '@/components/procurement/StatusBadge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSupplierOrders } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';

type SortKey = 'poNumber' | 'supplierName' | 'itemCount' | 'status' | 'createdAt';
type SortDir = 'asc' | 'desc';

interface ApiOrder {
  id: number;
  warehouseId: number;
  supplierId: number;
  supplierName: string;
  warehouseName: string;
  status: string;
  purchaseOrder: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  items: any[];
  isPriority: boolean | null;
  invoice: any;
  documents: any;
}

export default function PurchaseOrders() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = user?.context?.warehouseId;
  const { data: apiOrders = [], isLoading } = useSupplierOrders(warehouseId) as { data: ApiOrder[] | undefined; isLoading: boolean };
  const orders: ApiOrder[] = apiOrders || [];

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSupplier, setFilterSupplier] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>();
  const [dateTo, setDateTo] = useState<Date | undefined>();
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>('createdAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const suppliers = useMemo(() => {
    const names = [...new Set(orders.map(o => o.supplierName))];
    return names.sort();
  }, [orders]);

  const filtered = useMemo(() => {
    let result = [...orders];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(o =>
        (o.purchaseOrder || '').toLowerCase().includes(q) ||
        o.supplierName.toLowerCase().includes(q) ||
        String(o.id).includes(q)
      );
    }
    if (filterStatus !== 'all') result = result.filter(o => o.status === filterStatus);
    if (filterSupplier !== 'all') result = result.filter(o => o.supplierName === filterSupplier);
    if (dateFrom) result = result.filter(o => new Date(o.createdAt) >= dateFrom);
    if (dateTo) result = result.filter(o => new Date(o.createdAt) <= dateTo);

    result.sort((a, b) => {
      let aV: any, bV: any;
      switch (sortKey) {
        case 'poNumber': aV = a.purchaseOrder || ''; bV = b.purchaseOrder || ''; break;
        case 'supplierName': aV = a.supplierName.toLowerCase(); bV = b.supplierName.toLowerCase(); break;
        case 'itemCount': aV = a.itemCount || a.items.length; bV = b.itemCount || b.items.length; break;
        case 'status': aV = a.status; bV = b.status; break;
        case 'createdAt': aV = new Date(a.createdAt).getTime(); bV = new Date(b.createdAt).getTime(); break;
        default: aV = 0; bV = 0;
      }
      if (aV < bV) return sortDir === 'asc' ? -1 : 1;
      if (aV > bV) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [orders, search, filterStatus, filterSupplier, dateFrom, dateTo, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const paged = filtered.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3.5 w-3.5 opacity-25" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

  const hasActiveFilters = filterStatus !== 'all' || filterSupplier !== 'all' || dateFrom || dateTo;

  const clearFilters = () => {
    setFilterStatus('all');
    setFilterSupplier('all');
    setDateFrom(undefined);
    setDateTo(undefined);
    setPage(1);
  };

  const canReceive = (status: string) => status === 'PENDING' || status === 'PARTIAL';

  return (
    <DashboardLayout>
      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading orders...</span>
        </div>
      )}
      {!isLoading && (
      <div className="flex items-center gap-4 mb-4">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Purchase Orders</h1>
          <p className="text-xs text-muted-foreground">{filtered.length} orders</p>
        </div>

        <div className="flex-1 max-w-sm ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-9 text-sm pl-9"
              placeholder="Search PO number or supplier..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn("h-9 gap-1.5", hasActiveFilters && "border-primary text-primary")}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-3.5 w-3.5" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                {[filterStatus !== 'all', filterSupplier !== 'all', !!dateFrom, !!dateTo].filter(Boolean).length}
              </span>
            )}
          </Button>
          <Button onClick={() => navigate('/purchase-orders/new')} className="h-9">
            <Plus className="mr-1.5 h-4 w-4" /> Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Collapsible Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex items-end gap-3 pb-4 flex-wrap">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Supplier</label>
                <Select value={filterSupplier} onValueChange={v => { setFilterSupplier(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[180px] text-xs"><SelectValue placeholder="All Suppliers" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Suppliers</SelectItem>
                    {suppliers.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Status</label>
                <Select value={filterStatus} onValueChange={v => { setFilterStatus(v); setPage(1); }}>
                  <SelectTrigger className="h-8 w-[170px] text-xs"><SelectValue placeholder="All Statuses" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="partially_received">Partially Received</SelectItem>
                    <SelectItem value="received">Received</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 w-[140px] text-xs justify-start", !dateFrom && "text-muted-foreground")}>
                      <CalendarIcon className="h-3 w-3 mr-1.5" />
                      {dateFrom ? format(dateFrom, 'dd MMM yyyy') : 'Start'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateFrom} onSelect={setDateFrom} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("h-8 w-[140px] text-xs justify-start", !dateTo && "text-muted-foreground")}>
                      <CalendarIcon className="h-3 w-3 mr-1.5" />
                      {dateTo ? format(dateTo, 'dd MMM yyyy') : 'End'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={dateTo} onSelect={setDateTo} className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
                  <X className="h-3 w-3 mr-1" /> Clear
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="border rounded-xl bg-gradient-to-br from-card to-muted/10 flex flex-col items-center justify-center py-16 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No Purchase Orders Found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first purchase order to get started</p>
          <Button size="sm" className="shadow-md" onClick={() => navigate('/supplier-orders/new')}>
            <Plus className="mr-1.5 h-4 w-4" /> New Purchase Order
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm" style={{ minHeight: 'calc(100vh - 280px)' }}>
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b">
                <tr>
                  {[
                    { key: 'poNumber' as SortKey, label: 'PO Number', align: 'text-left' },
                    { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                    { key: 'itemCount' as SortKey, label: 'Items', align: 'text-center' },
                    { key: 'status' as SortKey, label: 'Status', align: 'text-center' },
                    { key: 'createdAt' as SortKey, label: 'Created Date', align: 'text-left' },
                  ].map(col => (
                    <th
                      key={col.key}
                      className={cn(
                        "px-4 py-3 font-semibold text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
                        col.align
                      )}
                      onClick={() => handleSort(col.key)}
                    >
                      <span className={cn("flex items-center gap-1", col.align === 'text-center' && 'justify-center')}>
                        {col.label} <SortIcon col={col.key} />
                      </span>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold text-[10px] uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((order) => (
                  <tr key={order.id} className="border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-150">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-primary">{order.purchaseOrder || `#${order.id}`}</span>
                      {order.isPriority && (
                        <span className="ml-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-destructive/10 text-destructive border border-destructive/20">URGENT</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm text-foreground">{order.supplierName}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-muted/50 text-xs font-medium">
                        {order.itemCount || order.items.length}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {format(new Date(order.createdAt), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {canReceive(order.status) ? (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-3 text-xs font-medium rounded-full shadow-sm"
                              onClick={() => navigate(`/purchase-orders/${order.id}/receive`)}
                            >
                              <Package className="h-3.5 w-3.5 mr-1" /> Receive
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem onClick={() => navigate(`/purchase-orders/${order.id}`)}>
                                  <Eye className="h-3.5 w-3.5 mr-2" /> View
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className="h-3.5 w-3.5 mr-2" /> Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-3 text-xs font-medium rounded-full"
                              onClick={() => navigate(`/purchase-orders/${order.id}`)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> View
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem>
                                  <Download className="h-3.5 w-3.5 mr-2" /> Download
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows:</span>
              <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-xs text-muted-foreground">{filtered.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="px-3 text-xs text-muted-foreground">{page}/{totalPages}</span>
              <Button size="sm" variant="ghost" className="h-7 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
