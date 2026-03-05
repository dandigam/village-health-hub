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
import { Plus, Search, Filter, RefreshCw, X, FileText, Package, Clock, Archive } from 'lucide-react';
import { format } from 'date-fns';
import { InvoiceDetailDrawer } from '@/components/invoices/InvoiceDetailDrawer';

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

  const renderTable = (data: Invoice[]) => (
    <div className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice No</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supplier</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment Mode</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Invoice Date</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Created At</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Amount</TableHead>
            <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground text-right">Items</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
               <TableCell colSpan={7} className="h-40">
                <div className="flex flex-col items-center justify-center text-muted-foreground gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-muted/40 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-muted-foreground/40" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-sm">No invoices found</p>
                    <p className="text-xs mt-0.5">Create your first stock entry to get started</p>
                  </div>
                  <Button size="sm" className="mt-1 h-8 text-xs" onClick={() => navigate('/invoices/new')}>
                    <Plus className="w-3.5 h-3.5 mr-1" /> New Stock Entry
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((invoice: Invoice, i: number) => (
              <motion.tr
                key={invoice.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer"
                onClick={() => setSelectedOrder(invoice)}
              >
                <TableCell className="font-mono text-xs font-semibold text-primary">{invoice.invoiceNumber || `#${invoice.id}`}</TableCell>
                <TableCell className="text-sm">{invoice.supplierName || '—'}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="text-[10px] capitalize">{invoice.paymentMode || '—'}</Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : '—'}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy HH:mm') : '—'}
                </TableCell>
                <TableCell className="text-right font-semibold text-sm">
                  ₹{invoice.invoiceAmount?.toLocaleString() || '0'}
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {invoice.items?.length || 0}
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
            { label: 'Total Amount', value: `₹${stats.totalAmount.toLocaleString()}`, icon: FileText, color: 'text-emerald-600' },
            { label: 'Total Items', value: stats.totalItems, icon: Package, color: 'text-amber-600' },
            { label: 'This Month', value: stats.thisMonth, icon: Clock, color: 'text-blue-600' },
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
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <Filter className="w-3 h-3 mr-1" />
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
        />
      </div>
    </DashboardLayout>
  );
}
