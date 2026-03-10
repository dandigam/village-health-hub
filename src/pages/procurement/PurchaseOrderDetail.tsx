import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Download, Loader2, ClipboardList, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { mockGoodsReceipts } from '@/data/procurementMockData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/procurement/StatusBadge';
import { useSupplierOrder } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useSupplierOrder(id);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading order...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Purchase order not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/purchase-orders')}>Back to Orders</Button>
        </div>
      </DashboardLayout>
    );
  }

  const canReceive = order.status === 'PENDING' || order.status === 'PARTIAL';
  const isFullyReceived = order.status === 'RECEIVED';
  const items = order.items || [];
  const totalRequested = items.reduce((s: number, i: any) => s + (i.requestedQuantity || 0), 0);
  const totalReceived = items.reduce((s: number, i: any) => s + (i.receivedQuantity || 0), 0);
  const totalPending = totalRequested - totalReceived;

  // Get goods receipts linked to this PO
  const poReceipts = mockGoodsReceipts.filter(r => r.poId === id);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-foreground">{order.purchaseOrder || `Order #${order.id}`}</h1>
              <StatusBadge status={order.status} />
              {order.isPriority && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">URGENT</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canReceive && (
            <Button size="sm" onClick={() => navigate(`/purchase-orders/${order.id}/receive`)} className="h-8">
              <Package className="h-3.5 w-3.5 mr-1.5" /> Receive Goods
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => navigate(`/goods-receipts?po=${order.id}`)} className="h-8">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Receipt History
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supplier</p>
          <p className="text-sm font-semibold text-foreground">{order.supplierName}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Requested</p>
          <p className="text-xl font-bold text-foreground">{totalRequested}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Received</p>
          <p className="text-xl font-bold text-emerald-600">{totalReceived}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pending</p>
          <p className={cn("text-xl font-bold", totalPending > 0 ? "text-amber-600" : "text-muted-foreground")}>{totalPending}</p>
        </div>
      </div>

      {/* Medicine Table */}
      {items.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground">Order Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Medicine Name</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Requested Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Received Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pending Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Progress</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const pending = (item.requestedQuantity || 0) - (item.receivedQuantity || 0);
                const pct = item.requestedQuantity > 0 ? Math.round((item.receivedQuantity / item.requestedQuantity) * 100) : 0;
                return (
                  <tr key={item.id || idx} className="border-b last:border-b-0 hover:bg-muted/10">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.medicineName}</span>
                      {item.strength && <span className="ml-1.5 text-xs text-muted-foreground">{item.strength}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.medicineType || '—'}</td>
                    <td className="px-4 py-3 text-center font-medium">{item.requestedQuantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-emerald-600">{item.receivedQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-semibold", pending > 0 ? "text-amber-600" : "text-muted-foreground")}>{pending}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : pct > 0 ? "bg-amber-500" : "bg-muted")}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Receipts — only show when fully received */}
      {isFullyReceived && poReceipts.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm mt-6">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Receipts</h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigate(`/goods-receipts?po=${order.id}`)}>
              View All →
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Receipt #</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Items</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Received By</th>
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {poReceipts.map(receipt => (
                <tr
                  key={receipt.id}
                  className="border-b last:border-b-0 hover:bg-muted/10 cursor-pointer transition-colors"
                  onClick={() => navigate(`/goods-receipts/${receipt.id}`)}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-primary">{receipt.receiptNumber}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {format(new Date(receipt.receivedDate), 'dd MMM yyyy')}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-muted/50 text-xs font-medium">
                      {receipt.items.length}
                    </span>
                  </td>
                  <td className="px-4 py-3">{receipt.receivedBy}</td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                    {receipt.invoiceNumber || '—'}
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
