import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Eye, PackageOpen, ArrowLeft, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGoodsReceipts } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';

export default function GoodsReceipts() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const poFilter = searchParams.get('po');
  const { user } = useAuth();
  const warehouseId = user?.context?.warehouseId ?? undefined;

  const { data: receipts = [], isLoading } = useGoodsReceipts(warehouseId);

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let result = [...receipts];
    if (poFilter) result = result.filter(r => String(r.poId) === poFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(r =>
        r.receiptNumber?.toLowerCase().includes(q) ||
        r.poNumber?.toLowerCase().includes(q) ||
        r.supplierName?.toLowerCase().includes(q) ||
        r.receivedBy?.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.receivedDate || b.createdAt).getTime() - new Date(a.receivedDate || a.createdAt).getTime());
  }, [search, poFilter, receipts]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        {poFilter && (
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate('/goods-receipts')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-lg font-semibold text-foreground">Goods Receipts</h1>
          <p className="text-xs text-muted-foreground">
            {poFilter ? `Filtered by PO #${receipts.find(r => String(r.poId) === poFilter)?.poNumber || poFilter}` : `${filtered.length} receipts`}
          </p>
        </div>

        <div className="flex-1 max-w-sm ml-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="h-9 text-sm pl-9"
              placeholder="Search receipt, PO, supplier, or user..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="border rounded-xl bg-gradient-to-br from-card to-muted/10 flex flex-col items-center justify-center py-16 shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
            <PackageOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-semibold text-foreground mb-1">No Receipts Found</p>
          <p className="text-xs text-muted-foreground">Goods receipts will appear here after receiving stock</p>
        </div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm" style={{ minHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Receipt Number</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">PO Number</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Received Date</th>
                <th className="px-4 py-3 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Items</th>
                <th className="px-4 py-3 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Invoice</th>
                <th className="px-4 py-3 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(receipt => (
                <tr
                  key={receipt.id}
                  className="border-b last:border-b-0 hover:bg-muted/20 transition-colors duration-150 cursor-pointer"
                  onClick={() => navigate(`/goods-receipts/${receipt.id}`, { state: { receipt } })}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-primary">{receipt.receiptNumber}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-muted-foreground">{receipt.poNumber}</span>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{receipt.supplierName}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {receipt.receivedDate ? format(new Date(receipt.receivedDate), 'dd MMM yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-muted/50 text-xs font-medium">
                      {receipt.items?.length || 0}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono">{receipt.invoiceNumber || '—'}</span>
                    {receipt.invoiceAmount && (
                      <span className="ml-1.5 text-[10px] text-muted-foreground">₹{Number(receipt.invoiceAmount).toLocaleString()}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-3 text-xs rounded-full"
                      onClick={e => { e.stopPropagation(); navigate(`/goods-receipts/${receipt.id}`, { state: { receipt } }); }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
