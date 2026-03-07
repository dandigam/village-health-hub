import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Eye, Pencil, RotateCcw, ChevronUp, ChevronDown, FileText, Pill, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useInvoices, Invoice, InvoiceItem } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type BannerType = 'success' | 'error';
interface BannerState { type: BannerType; message: string }

const paymentConfig: Record<string, { label: string; className: string }> = {
  cash: { label: 'Cash', className: 'bg-green-100 text-green-800 border-green-300' },
  upi: { label: 'UPI', className: 'bg-blue-100 text-blue-800 border-blue-300' },
  bank_transfer: { label: 'Bank Transfer', className: 'bg-violet-100 text-violet-800 border-violet-300' },
  cheque: { label: 'Cheque', className: 'bg-orange-100 text-orange-800 border-orange-300' },
  credit: { label: 'Credit', className: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
};

type SortKey = 'id' | 'invoiceDate' | 'supplierName' | 'invoiceNumber' | 'invoiceAmount' | 'itemCount';
type SortDir = 'asc' | 'desc';

export default function Invoices() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const warehouseId = (user as any)?.context?.warehouseId ? Number((user as any).context.warehouseId) : undefined;
  const { data: invoices = [], isLoading, refetch } = useInvoices(warehouseId);

  const [filterPayment, setFilterPayment] = useState('all');
  const [filterSearch, setFilterSearch] = useState('');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('invoiceDate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [viewInvoice, setViewInvoice] = useState<Invoice | null>(null);
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

  const handleReset = () => {
    setFilterPayment('all'); setFilterSearch(''); setFilterDateFrom(''); setFilterDateTo(''); setPage(1);
  };

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];
    if (filterPayment !== 'all') result = result.filter(o => o.paymentMode?.toLowerCase() === filterPayment);
    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase();
      result = result.filter(o => String(o.id).includes(q) || o.supplierName?.toLowerCase().includes(q) || o.invoiceNumber?.toLowerCase().includes(q));
    }
    if (filterDateFrom) result = result.filter(o => new Date(o.invoiceDate || o.createdAt) >= new Date(filterDateFrom));
    if (filterDateTo) { const to = new Date(filterDateTo); to.setHours(23, 59, 59); result = result.filter(o => new Date(o.invoiceDate || o.createdAt) <= to); }
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
  }, [invoices, filterPayment, filterSearch, filterDateFrom, filterDateTo, sortKey, sortDir]);

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
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Purchase & Stock Entries</h1>
        <Button size="sm" onClick={() => navigate('/invoices/new')}>
          <Plus className="mr-1.5 h-4 w-4" /> New Stock Entry
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="border rounded-md bg-card px-3 py-2.5 mb-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <div className="min-w-[140px]">
            <Label className="text-xs mb-1 block text-muted-foreground">Payment Mode</Label>
            <Select value={filterPayment} onValueChange={v => { setFilterPayment(v); setPage(1); }}>
              <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="All" /></SelectTrigger>
              <SelectContent className="bg-popover z-50">
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
                <SelectItem value="credit">Credit</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="min-w-[150px]">
            <Label className="text-xs mb-1 block text-muted-foreground">Search</Label>
            <Input className="h-8 text-sm" placeholder="Invoice / Supplier..." value={filterSearch} onChange={e => { setFilterSearch(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block text-muted-foreground">From</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateFrom} onChange={e => { setFilterDateFrom(e.target.value); setPage(1); }} />
          </div>
          <div className="min-w-[130px]">
            <Label className="text-xs mb-1 block text-muted-foreground">To</Label>
            <Input type="date" className="h-8 text-sm" value={filterDateTo} onChange={e => { setFilterDateTo(e.target.value); setPage(1); }} />
          </div>
          <Button size="sm" variant="outline" className="h-8 ml-auto" onClick={handleReset}>
            <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {filteredInvoices.length === 0 ? (
        <div className="border rounded-md bg-card flex flex-col items-center justify-center py-12">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-2" />
          <p className="text-sm text-muted-foreground font-medium mb-2">No Invoices Found</p>
          <Button size="sm" onClick={() => navigate('/invoices/new')}>
            <Plus className="mr-1.5 h-4 w-4" /> New Stock Entry
          </Button>
        </div>
      ) : (
        <div className="border rounded-md bg-card overflow-hidden">
          <div className="overflow-auto max-h-[calc(100vh-260px)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                <tr className="border-b">
                  {[
                    { key: 'invoiceNumber' as SortKey, label: 'Invoice No', align: 'text-left' },
                    { key: 'supplierName' as SortKey, label: 'Supplier', align: 'text-left' },
                    { key: 'invoiceDate' as SortKey, label: 'Invoice Date', align: 'text-left' },
                    { key: 'invoiceAmount' as SortKey, label: 'Amount', align: 'text-right' },
                    { key: 'itemCount' as SortKey, label: 'Items', align: 'text-center' },
                  ].map(col => (
                    <th key={col.key} className={`px-3 py-2 font-medium text-xs ${col.align} cursor-pointer select-none`} onClick={() => handleSort(col.key)}>
                      <span className={`flex items-center gap-1 ${col.align === 'text-center' ? 'justify-center' : col.align === 'text-right' ? 'justify-end' : ''}`}>{col.label} <SortIcon col={col.key} /></span>
                    </th>
                  ))}
                  <th className="px-3 py-2 text-center font-medium text-xs">Payment</th>
                  <th className="px-3 py-2 text-center font-medium text-xs w-24">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pagedInvoices.map((invoice, idx) => {
                  const payKey = invoice.paymentMode?.toLowerCase() || '';
                  const payConf = paymentConfig[payKey];
                  const zebra = idx % 2 === 1 ? 'bg-muted/20' : '';
                  return (
                    <tr key={invoice.id} className={`border-b last:border-b-0 hover:bg-accent/40 transition-colors ${zebra}`}>
                      <td className="px-3 py-1.5 font-mono text-xs font-bold text-primary">{invoice.invoiceNumber || `#${invoice.id}`}</td>
                      <td className="px-3 py-1.5 font-medium">{invoice.supplierName || '—'}</td>
                      <td className="px-3 py-1.5 text-muted-foreground">{invoice.invoiceDate ? format(new Date(invoice.invoiceDate), 'dd MMM yyyy') : '—'}</td>
                      <td className="px-3 py-1.5 text-right font-bold">₹{invoice.invoiceAmount?.toLocaleString() || '0'}</td>
                      <td className="px-3 py-1.5 text-center">{invoice.items?.length || 0}</td>
                      <td className="px-3 py-1.5 text-center">
                        {payConf ? (
                          <Badge variant="outline" className={`text-[11px] px-2 py-0.5 ${payConf.className}`}>{payConf.label}</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">{invoice.paymentMode || '—'}</span>
                        )}
                      </td>
                      <td className="px-3 py-1.5 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Button size="icon" variant="ghost" className="h-7 w-7" title="View" onClick={() => setViewInvoice(invoice)}>
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7" title="Edit" onClick={() => navigate(`/invoices/${invoice.id}/edit`)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
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
              <span className="text-muted-foreground text-xs">{filteredInvoices.length} total</span>
            </div>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
              <span className="px-2 text-xs text-muted-foreground">{page}/{totalPages}</span>
              <Button size="sm" variant="outline" className="h-7 px-2 text-xs" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          </div>
        </div>
      )}

      {/* View Invoice Dialog */}
      <Dialog open={!!viewInvoice} onOpenChange={open => { if (!open) setViewInvoice(null); }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0">
          {viewInvoice && (
            <>
              <DialogHeader className="px-5 pt-5 pb-0">
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-4.5 h-4.5 text-primary" />
                    {viewInvoice.invoiceNumber || `Invoice #${viewInvoice.id}`}
                  </DialogTitle>
                  <Button size="sm" variant="outline" onClick={() => { setViewInvoice(null); navigate(`/invoices/${viewInvoice.id}/edit`); }}>
                    <Pencil className="mr-1 h-3.5 w-3.5" /> Edit
                  </Button>
                </div>
              </DialogHeader>

              <div className="px-5 pb-5 space-y-3">
                {/* Order Info */}
                <div className="border rounded-md bg-muted/10 px-3 py-2.5">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Order Information</p>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-x-3 gap-y-2">
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Supplier</span>
                      <p className="text-sm font-medium">{viewInvoice.supplierName || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Payment Mode</span>
                      <p className="text-sm font-medium capitalize">{viewInvoice.paymentMode || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Invoice No.</span>
                      <p className="text-sm font-medium">{viewInvoice.invoiceNumber || '—'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Amount</span>
                      <p className="text-sm font-medium">₹{viewInvoice.invoiceAmount?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-muted-foreground block">Date</span>
                      <p className="text-sm font-medium">{viewInvoice.invoiceDate ? format(new Date(viewInvoice.invoiceDate), 'dd MMM yyyy') : '—'}</p>
                    </div>
                  </div>
                </div>

                {/* Items Table — Medicine, Stock, Batch, Exp Date, HSN, Qty */}
                <div className="border rounded-md bg-card overflow-hidden">
                  <div className="flex items-center gap-3 px-3 py-2 border-b bg-muted/20">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Medicine Details</p>
                    <Badge variant="secondary" className="text-[10px] h-5 font-normal">
                      {viewInvoice.items?.length || 0} medicines · {viewInvoice.items?.reduce((s: number, i: InvoiceItem) => s + (i.quantity || 0), 0) || 0} units
                    </Badge>
                  </div>
                  <div className="overflow-auto max-h-[45vh]">
                    {(!viewInvoice.items || viewInvoice.items.length === 0) ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <Pill className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-sm text-muted-foreground">No items</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                          <tr className="border-b">
                            <th className="px-3 py-1.5 text-left font-medium text-[10px] uppercase text-muted-foreground w-10">#</th>
                            <th className="px-3 py-1.5 text-left font-medium text-[10px] uppercase text-muted-foreground">Medicine</th>
                            <th className="px-3 py-1.5 text-center font-medium text-[10px] uppercase text-muted-foreground w-16">Stock</th>
                            <th className="px-3 py-1.5 text-left font-medium text-[10px] uppercase text-muted-foreground w-28">Batch</th>
                            <th className="px-3 py-1.5 text-left font-medium text-[10px] uppercase text-muted-foreground w-28">Exp Date</th>
                            <th className="px-3 py-1.5 text-left font-medium text-[10px] uppercase text-muted-foreground w-20">HSN</th>
                            <th className="px-3 py-1.5 text-right font-medium text-[10px] uppercase text-muted-foreground w-16">Qty</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewInvoice.items.map((item: InvoiceItem, idx: number) => {
                            const zebra = idx % 2 === 1 ? 'bg-muted/15' : '';
                            return (
                              <tr key={item.id || idx} className={`border-b last:border-b-0 ${zebra}`}>
                                <td className="px-3 py-1 text-muted-foreground text-xs">{idx + 1}</td>
                                <td className="px-3 py-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium text-sm">{item.medicineName || '—'}</span>
                                    {item.medicineType && <Badge variant="secondary" className="text-[9px] h-4 font-normal">{item.medicineType}</Badge>}
                                  </div>
                                </td>
                                <td className="px-3 py-1 text-center text-xs text-muted-foreground">{(item as any).stock ?? '—'}</td>
                                <td className="px-3 py-1 text-xs text-muted-foreground">{item.batchNo || '—'}</td>
                                <td className="px-3 py-1 text-xs text-muted-foreground">{item.expDate || '—'}</td>
                                <td className="px-3 py-1 text-xs text-muted-foreground">{item.hsnNo || '—'}</td>
                                <td className="px-3 py-1 text-right font-semibold">{item.quantity || 0}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
