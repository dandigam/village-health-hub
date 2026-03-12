import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye, Pencil, ChevronUp, ChevronDown, FileText, Filter, CheckCircle2, AlertCircle, X, MoreVertical, Download } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useInvoices, useWarehouseDetail } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { downloadInvoicePDF } from '@/utils/pdfGenerator';

type BannerType = 'success' | 'error';
interface BannerState { type: BannerType; message: string }

const paymentConfig: Record<string, { label: string; color: string; bg: string }> = {
  cash: { label: 'Cash', color: 'text-emerald-600', bg: 'bg-emerald-50 border border-emerald-200/50' },
  upi: { label: 'UPI', color: 'text-blue-600', bg: 'bg-blue-50 border border-blue-200/50' },
  bank_transfer: { label: 'Bank', color: 'text-violet-600', bg: 'bg-violet-50 border border-violet-200/50' },
  cheque: { label: 'Cheque', color: 'text-orange-600', bg: 'bg-orange-50 border border-orange-200/50' },
  credit: { label: 'Credit', color: 'text-amber-600', bg: 'bg-amber-50 border border-amber-200/50' },
};

type SortKey = 'id' | 'invoiceDate' | 'supplierName' | 'invoiceNumber' | 'invoiceAmount' | 'itemCount';
type SortDir = 'asc' | 'desc';

export default function Invoices() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const warehouseId = user?.context?.warehouseId ? Number(user.context.warehouseId) : undefined;
  const { data: invoices = [], isLoading, refetch } = useInvoices(warehouseId);
  const { data: warehouseDetail } = useWarehouseDetail(warehouseId);

  const [filterPayment, setFilterPayment] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('invoiceDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // viewInvoice state removed — now navigates to view page
  const [banner, setBanner] = useState<BannerState | null>(null);

  // Pick up banner from navigation state
  useEffect(() => {
    const navBanner = (location.state as any)?.banner;
    if (navBanner) {
      setBanner(navBanner);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => { refetch?.(); }, []);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    if (filterPayment !== 'all') result = result.filter(o => o.paymentMode?.toLowerCase() === filterPayment);
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(o => String(o.id).includes(q) || o.supplierName?.toLowerCase().includes(q) || o.invoiceNumber?.toLowerCase().includes(q));
    }
    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortKey) {
        case 'id': aVal = a.id; bVal = b.id; break;
        case 'invoiceDate': aVal = new Date(a.invoiceDate || a.createdAt).getTime(); bVal = new Date(b.invoiceDate || b.createdAt).getTime(); break;
        case 'supplierName': aVal = (a.supplierName || '').toLowerCase(); bVal = (b.supplierName || '').toLowerCase(); break;
        case 'invoiceNumber': aVal = (a.invoiceNumber || '').toLowerCase(); bVal = (b.invoiceNumber || '').toLowerCase(); break;
        case 'invoiceAmount': aVal = a.invoiceAmount || 0; bVal = b.invoiceAmount || 0; break;
        case 'itemCount': aVal = a.items?.length || 0; bVal = b.items?.length || 0; break;
        default: aVal = 0; bVal = 0;
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [invoices, filterPayment, filterSearch, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filteredInvoices.length / rowsPerPage));
  const pagedInvoices = filteredInvoices.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp className="h-3.5 w-3.5 opacity-30" />;
    return sortDir === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />;
  };

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
        <h1 className="text-lg font-semibold text-foreground">Invoices List</h1>
        <span className="text-sm text-muted-foreground">({invoices.length})</span>
        
        <div className="flex-1 max-w-sm ml-4">
          <Input 
            className="h-9 text-sm" 
            placeholder="Search by Invoice No / Supplier" 
            value={filterSearch} 
            onChange={e => { setFilterSearch(e.target.value); setPage(1); }} 
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Select value={filterPayment} onValueChange={v => { setFilterPayment(v); setPage(1); }}>
            <SelectTrigger className="h-9 w-[130px] text-sm">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="credit">Credit</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={() => navigate('/invoices/new')}>
            <Plus className="mr-1.5 h-4 w-4" /> Add New Entry
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <div className="border rounded-xl bg-gradient-to-br from-card to-muted/10 flex flex-col items-center justify-center py-16 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <FileText className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No Invoices Found</p>
          <p className="text-xs text-muted-foreground mb-4">Create your first stock entry to get started</p>
          <Button size="sm" className="shadow-md" onClick={() => navigate('/invoices/new')}>
            <Plus className="mr-1.5 h-4 w-4" /> New Stock Entry
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-200">
              <tr>
                {[
                  { key: 'invoiceNumber' as SortKey, label: 'Invoice No', align: 'text-left' },
                  { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                  { key: 'invoiceDate' as SortKey, label: 'Invoice Date', align: 'text-left' },
                  { key: 'invoiceAmount' as SortKey, label: 'Amount', align: 'text-right' },
                  { key: 'itemCount' as SortKey, label: 'Items', align: 'text-center' },
                ].map(col => (
                  <th 
                    key={col.key} 
                    className={cn(
                      "px-4 py-3 font-semibold text-xs uppercase tracking-wider text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors",
                      col.align
                    )} 
                    onClick={() => handleSort(col.key)}
                  >
                    <span className={cn("flex items-center gap-1", col.align === 'text-center' && 'justify-center', col.align === 'text-right' && 'justify-end')}>
                      {col.label} <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">Payment</th>
                <th className="px-4 py-3 text-center font-semibold text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pagedInvoices.map((invoice) => {
                const payKey = invoice.paymentMode?.toLowerCase() || '';
                const payConf = paymentConfig[payKey];
                return (
                  <tr 
                    key={invoice.id} 
                    className="border-b last:border-b-0 hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-medium text-primary">{invoice.invoiceNumber || `#${invoice.id}`}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-sm">{invoice.supplierName || '—'}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-sm">
                      {invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-sm tabular-nums">₹{invoice.invoiceAmount?.toLocaleString() || '0'}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-sm text-muted-foreground">{invoice.items?.length || 0}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {payConf ? (
                        <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium", payConf.bg, payConf.color)}>
                          {payConf.label}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">{invoice.paymentMode || '—'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 px-3 text-xs font-medium rounded-full transition-all" 
                          onClick={() => navigate(`/invoices/${invoice.id}`)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> View
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36">
                            <DropdownMenuItem onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                              <Pencil className="h-3.5 w-3.5 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-3.5 w-3.5 mr-2" /> Download
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
              <span className="text-sm text-muted-foreground">Show</span>
              <Select value={String(rowsPerPage)} onValueChange={v => { setRowsPerPage(Number(v)); setPage(1); }}>
                <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 25, 50, 100].map(n => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
              <span className="text-sm text-muted-foreground ml-4">
                {((page - 1) * rowsPerPage) + 1}-{Math.min(page * rowsPerPage, filteredInvoices.length)} of {filteredInvoices.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8" 
                disabled={page <= 1} 
                onClick={() => setPage(p => p - 1)}
              >
                <ChevronUp className="h-4 w-4 -rotate-90" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
                Math.max(0, page - 3),
                Math.min(totalPages, page + 2)
              ).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={cn(
                    "h-8 w-8 rounded text-sm font-medium transition-colors",
                    page === pageNum 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {pageNum}
                </button>
              ))}
              <Button 
                size="icon"
                variant="ghost" 
                className="h-8 w-8" 
                disabled={page >= totalPages} 
                onClick={() => setPage(p => p + 1)}
              >
                <ChevronUp className="h-4 w-4 rotate-90" />
              </Button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
}
