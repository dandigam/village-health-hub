import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useSupplierOrders } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, X, FileText, Package, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceDetailDrawer } from '@/components/invoices/InvoiceDetailDrawer';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  received: { label: 'Received', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700' },
  partial: { label: 'Partial', dot: 'bg-blue-500 animate-pulse', bg: 'bg-blue-50', text: 'text-blue-700' },
  draft: { label: 'Draft', dot: 'bg-muted-foreground/50', bg: 'bg-muted/50', text: 'text-muted-foreground' },
};

function StatusChip({ status }: { status: string }) {
  const cfg = statusConfig[status?.toLowerCase()] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = (user as any)?.warehouseId;
  const { data: orders = [], isLoading, refetch } = useSupplierOrders(warehouseId);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stock-entry');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const filtered = useMemo(() => {
    let result = orders;
    if (statusFilter !== 'all') {
      result = result.filter((o: any) => o.status?.toLowerCase() === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o: any) =>
        String(o.id).includes(q) ||
        o.supplierName?.toLowerCase().includes(q) ||
        o.campName?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [orders, statusFilter, searchQuery]);

  const currentMonth = new Date().getMonth();
  const monthlyOrders = useMemo(() =>
    orders.filter((o: any) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth;
    }), [orders, currentMonth]);

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o: any) => o.status?.toLowerCase() === 'pending').length,
    received: orders.filter((o: any) => o.status?.toLowerCase() === 'received').length,
    thisMonth: monthlyOrders.length,
  }), [orders, monthlyOrders]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  const renderTable = (data: any[]) => (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Order ID</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Requested At</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Total</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Remarks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
               <TableCell colSpan={6} className="h-40">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">No invoice orders found</p>
                    <p className="text-xs mt-0.5">Create your first stock entry to get started</p>
                  </div>
                  <Button size="sm" className="mt-1 h-8 text-xs" onClick={() => navigate('/invoices/new')}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> New Stock Entry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((order: any, i: number) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <TableCell className="font-mono text-xs font-semibold text-primary">#{order.id}</TableCell>
                <TableCell><StatusChip status={order.status} /></TableCell>
                <TableCell className="text-sm">{order.supplierName || '—'}</TableCell>
                <TableCell><StatusChip status={order.status} /></TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ₹{order.totalAmount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">
                  {order.remarks || '—'}
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Stock Entry (Invoice)</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Record incoming stock from suppliers</p>
          </div>
          <Button className="h-9 text-sm px-4 shadow-md" onClick={() => navigate('/invoices/new')}>
            <Plus className="w-4 h-4 mr-1.5" /> New Stock Entry
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total Invoices', value: stats.total, icon: Archive, color: 'text-primary' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600' },
            { label: 'Received', value: stats.received, icon: Package, color: 'text-emerald-600' },
            { label: 'This Month', value: stats.thisMonth, icon: FileText, color: 'text-blue-600' },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-3 flex items-center gap-3 hover:shadow-md transition-shadow"
            >
              <div className={`w-9 h-9 rounded-lg bg-muted/40 flex items-center justify-center ${s.color}`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-lg font-bold">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-muted/30 border border-border/50 h-9">
            <TabsTrigger value="stock-entry" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Package className="w-3.5 h-3.5 mr-1" /> Stock Entry
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Clock className="w-3.5 h-3.5 mr-1" /> Monthly
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs data-[state=active]:bg-card data-[state=active]:shadow-sm">
              <Archive className="w-3.5 h-3.5 mr-1" /> All Orders
            </TabsTrigger>
          </TabsList>

          {/* Filter Bar */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by camp, supplier or order id"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>
            <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => refetch()}>
              <RefreshCw className="w-3 h-3 mr-1" /> Refresh
            </Button>
            {(statusFilter !== 'all' || searchQuery) && (
              <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground" onClick={clearFilters}>
                <X className="w-3 h-3 mr-1" /> Clear
              </Button>
            )}
          </div>

          <TabsContent value="stock-entry" className="mt-3">
            {renderTable(filtered.filter((o: any) => ['pending', 'draft', 'partial'].includes(o.status?.toLowerCase())))}
          </TabsContent>
          <TabsContent value="monthly" className="mt-3">
            {renderTable(monthlyOrders)}
          </TabsContent>
          <TabsContent value="all" className="mt-3">
            {renderTable(filtered)}
          </TabsContent>
        </Tabs>

        <InvoiceDetailDrawer
          open={!!selectedOrder}
          onOpenChange={(open) => !open && setSelectedOrder(null)}
          order={selectedOrder}
        />
      </div>
    </DashboardLayout>
  );
}
