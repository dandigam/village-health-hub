import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useInvoices, Invoice } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, X, FileText, Package, Clock, Archive, IndianRupee, TrendingUp, Layers } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceDetailDrawer } from '@/components/invoices/InvoiceDetailDrawer';

const statConfig = [
  { label: 'Total Invoices', key: 'total', icon: Layers, gradient: 'from-primary/90 to-accent/80', iconBg: 'bg-white/20' },
  { label: 'Total Amount', key: 'totalAmount', icon: IndianRupee, gradient: 'from-emerald-500 to-teal-600', iconBg: 'bg-white/20' },
  { label: 'Total Items', key: 'totalItems', icon: Package, gradient: 'from-amber-500 to-orange-600', iconBg: 'bg-white/20' },
  { label: 'This Month', key: 'thisMonth', icon: TrendingUp, gradient: 'from-violet-500 to-purple-600', iconBg: 'bg-white/20' },
] as const;

export default function Invoices() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const warehouseId = (user as any)?.context?.warehouseId ? Number((user as any).context.warehouseId) : undefined;
  const { data: invoices = [], isLoading, refetch } = useInvoices(warehouseId);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('stock-entry');
  const [selectedOrder, setSelectedOrder] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    let result = invoices;
    if (statusFilter !== 'all') {
      result = result.filter((o: Invoice) => o.paymentMode?.toLowerCase() === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((o: Invoice) =>
        String(o.id).includes(q) ||
        o.supplierName?.toLowerCase().includes(q) ||
        o.invoiceNumber?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [invoices, statusFilter, searchQuery]);

  const currentMonth = new Date().getMonth();
  const monthlyOrders = useMemo(() =>
    invoices.filter((o: Invoice) => {
      const d = new Date(o.createdAt);
      return d.getMonth() === currentMonth;
    }), [invoices, currentMonth]);

  const stats = useMemo(() => {
    const totalAmount = invoices.reduce((sum, inv) => sum + (inv.invoiceAmount || 0), 0);
    const totalItems = invoices.reduce((sum, inv) => sum + (inv.items?.length || 0), 0);
    return {
      total: invoices.length,
      totalAmount,
      totalItems,
      thisMonth: monthlyOrders.length,
    };
  }, [invoices, monthlyOrders]);

  const clearFilters = () => {
    setStatusFilter('all');
    setSearchQuery('');
  };

  const getStatValue = (key: string) => {
    if (key === 'totalAmount') return `₹${stats.totalAmount.toLocaleString()}`;
    return stats[key as keyof typeof stats];
  };

  const renderTable = (data: Invoice[]) => (
    <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gradient-to-r from-muted/60 to-muted/30 border-b border-border/60">
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Invoice No</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Supplier</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Payment Mode</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Invoice Date</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70">Created At</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 text-right">Amount</TableHead>
            <TableHead className="text-[11px] font-bold uppercase tracking-wider text-foreground/70 text-right">Items</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-44">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-primary/40" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-foreground/70">No invoices found</p>
                    <p className="text-xs mt-0.5 text-muted-foreground">Create your first stock entry to get started</p>
                  </div>
                  <Button size="sm" className="mt-1 h-8 text-xs shadow-md" onClick={() => navigate('/invoices/new')}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> New Stock Entry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((invoice: Invoice, i: number) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, ease: 'easeOut' }}
                className="border-b border-border/30 hover:bg-primary/[0.04] transition-all duration-200 cursor-pointer group"
                onClick={() => setSelectedOrder(invoice)}
              >
                <TableCell className="font-mono text-xs font-bold text-primary group-hover:text-primary/80 transition-colors">
                  {invoice.invoiceNumber || `#${invoice.id}`}
                </TableCell>
                <TableCell className="text-sm font-medium text-foreground/90">{invoice.supplierName || '—'}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-[10px] capitalize font-medium shadow-sm border border-border/40">
                    {invoice.paymentMode || '—'}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy HH:mm') : '—'}
                </TableCell>
                <TableCell className="text-right font-bold text-sm text-foreground">
                  ₹{invoice.invoiceAmount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell className="text-right">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted/50 text-xs font-semibold text-foreground/70">
                    {invoice.items?.length || 0}
                  </span>
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
      <div className="space-y-5">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Purchase & Stock Entries</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track supplier invoices and incoming inventory</p>
          </div>
          <Button
            className="h-10 text-sm px-5 shadow-lg bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
            onClick={() => navigate('/invoices/new')}
          >
            <Plus className="w-4 h-4 mr-2" /> New Stock Entry
          </Button>
        </motion.div>

        {/* Stats - Vibrant gradient cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {statConfig.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 200 }}
              className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${s.gradient} p-4 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300`}
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-6 translate-x-6" />
              <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/5 rounded-full translate-y-4 -translate-x-4" />
              <div className="flex items-center gap-3 relative z-10">
                <div className={`w-10 h-10 rounded-xl ${s.iconBg} flex items-center justify-center backdrop-blur-sm`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold tracking-tight drop-shadow-sm">{getStatValue(s.key)}</p>
                  <p className="text-[11px] text-white/80 font-medium">{s.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-card border border-border/60 h-10 p-1 shadow-sm">
            <TabsTrigger value="stock-entry" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <Package className="w-3.5 h-3.5 mr-1.5" /> Stock Entry
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <Clock className="w-3.5 h-3.5 mr-1.5" /> Monthly
            </TabsTrigger>
            <TabsTrigger value="all" className="text-xs font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all">
              <Archive className="w-3.5 h-3.5 mr-1.5" /> All Orders
            </TabsTrigger>
          </TabsList>

          {/* Filter Bar */}
          <div className="flex items-center gap-2.5 mt-3 flex-wrap">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-9 text-xs bg-card border-border/60 shadow-sm">
                <Filter className="w-3 h-3 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Payment Mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by invoice ID or supplier"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-xs bg-card border-border/60 shadow-sm"
              />
            </div>
            <Button size="sm" variant="outline" className="h-9 text-xs shadow-sm border-border/60" onClick={() => refetch()}>
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Refresh
            </Button>
            {(statusFilter !== 'all' || searchQuery) && (
              <Button size="sm" variant="ghost" className="h-9 text-xs text-muted-foreground hover:text-destructive" onClick={clearFilters}>
                <X className="w-3.5 h-3.5 mr-1" /> Clear
              </Button>
            )}
          </div>

          <TabsContent value="stock-entry" className="mt-3">
            {renderTable(filtered)}
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
          onEdit={(invoice) => {
            setSelectedOrder(null);
            navigate('/invoices/new', { state: { invoice } });
          }}
        />
      </div>
    </DashboardLayout>
  );
}
