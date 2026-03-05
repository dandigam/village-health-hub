import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, Package, Calendar, CreditCard, Building2, Truck } from 'lucide-react';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  received: { label: 'Received', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-400', bg: 'bg-red-50', text: 'text-red-700' },
  partial: { label: 'Partial', dot: 'bg-blue-500 animate-pulse', bg: 'bg-blue-50', text: 'text-blue-700' },
  draft: { label: 'Draft', dot: 'bg-muted-foreground/50', bg: 'bg-muted/50', text: 'text-muted-foreground' },
};

interface InvoiceDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: any;
}

export function InvoiceDetailDrawer({ open, onOpenChange, order }: InvoiceDetailDrawerProps) {
  if (!order) return null;

  const cfg = statusConfig[order.status?.toLowerCase()] || statusConfig.draft;
  const items = order.items || order.orderItems || [];
  const totalQty = items.reduce((sum: number, i: any) => sum + (i.quantity || i.requestedQty || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
          <SheetHeader className="p-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Invoice #{order.id}
              </SheetTitle>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label}
              </span>
            </div>
          </SheetHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Building2, label: 'Camp', value: order.campName || '—' },
              { icon: Truck, label: 'Supplier', value: order.supplierName || '—' },
              { icon: Calendar, label: 'Date', value: order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—' },
              { icon: CreditCard, label: 'Amount', value: `₹${order.totalAmount?.toLocaleString() || '0'}` },
            ].map((item) => (
              <div key={item.label} className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <item.icon className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-semibold truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Extra details */}
          {(order.paymentMode || order.invoiceId || order.remarks) && (
            <div className="bg-muted/20 border border-border/40 rounded-lg p-3 space-y-2">
              {order.invoiceId && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Invoice ID</span>
                  <span className="font-medium">{order.invoiceId}</span>
                </div>
              )}
              {order.paymentMode && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Payment Mode</span>
                  <Badge variant="secondary" className="text-[10px] h-5 capitalize">{order.paymentMode}</Badge>
                </div>
              )}
              {order.remarks && (
                <div className="text-xs">
                  <span className="text-muted-foreground block mb-0.5">Remarks</span>
                  <p className="text-foreground">{order.remarks}</p>
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" /> Items
              </h3>
              <Badge variant="outline" className="text-[10px] h-5">{items.length} items · {totalQty} units</Badge>
            </div>
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-8">#</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Medicine</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Batch</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-20 text-center text-muted-foreground text-xs">
                        No item details available
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item: any, idx: number) => (
                      <TableRow key={idx} className="border-b border-border/30">
                        <TableCell className="text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{item.medicineName || item.name || '—'}</div>
                          <div className="flex gap-1 mt-0.5">
                            {item.medicineType && <Badge variant="secondary" className="text-[9px] h-4">{item.medicineType}</Badge>}
                            {item.hsnNo && <Badge variant="outline" className="text-[9px] h-4">HSN: {item.hsnNo}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{item.batchNo || '—'}</div>
                          {item.expDate && <div className="text-[10px] text-muted-foreground/70">Exp: {item.expDate}</div>}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">{item.quantity || item.requestedQty || 0}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
