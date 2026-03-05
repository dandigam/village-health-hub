import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, Package, Calendar, CreditCard, Building2, Truck } from 'lucide-react';
import type { Invoice, InvoiceItem } from '@/hooks/useApiData';

interface InvoiceDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Invoice | null;
}

export function InvoiceDetailDrawer({ open, onOpenChange, order }: InvoiceDetailDrawerProps) {
  if (!order) return null;

  const items = order.items || [];
  const totalQty = items.reduce((sum: number, i) => sum + (i.quantity || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/50 px-5 py-4">
          <SheetHeader className="p-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-base font-bold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                {order.invoiceNumber || `Invoice #${order.id}`}
              </SheetTitle>
              <Badge variant="outline" className="text-[10px] capitalize">{order.paymentMode || 'N/A'}</Badge>
            </div>
          </SheetHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { icon: Truck, label: 'Supplier', value: order.supplierName || '—' },
              { icon: Building2, label: 'Warehouse', value: order.warehouseName || '—' },
              { icon: Calendar, label: 'Invoice Date', value: order.invoiceDate ? format(new Date(order.invoiceDate), 'dd MMM yyyy') : '—' },
              { icon: CreditCard, label: 'Amount', value: `₹${order.invoiceAmount?.toLocaleString() || '0'}` },
            ].map((item, idx) => (
              <div key={idx} className="bg-muted/30 border border-border/40 rounded-lg p-3 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <item.icon className="w-3 h-3" />
                  <span className="text-[10px] font-medium uppercase tracking-wider">{item.label}</span>
                </div>
                <p className="text-sm font-semibold truncate">{item.value}</p>
              </div>
            ))}
          </div>

          {/* Extra details */}
          {order.createdAt && (
            <div className="bg-muted/20 border border-border/40 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Created At</span>
                <span className="font-medium">{format(new Date(order.createdAt), 'dd MMM yyyy HH:mm')}</span>
              </div>
              {order.createdBy && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Created By</span>
                  <span className="font-medium">{order.createdBy}</span>
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
                    items.map((item: InvoiceItem, idx: number) => (
                      <TableRow key={item.id || idx} className="border-b border-border/30">
                        <TableCell className="text-xs text-muted-foreground font-mono">{idx + 1}</TableCell>
                        <TableCell>
                          <div className="text-sm font-medium">{item.medicineName || '—'}</div>
                          <div className="flex gap-1 mt-0.5">
                            {item.medicineType && <Badge variant="secondary" className="text-[9px] h-4">{item.medicineType}</Badge>}
                            {item.hsnNo && <Badge variant="outline" className="text-[9px] h-4">HSN: {item.hsnNo}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <div>{item.batchNo || '—'}</div>
                          {item.expDate && <div className="text-[10px] text-muted-foreground/70">Exp: {item.expDate}</div>}
                        </TableCell>
                        <TableCell className="text-right font-semibold text-sm">{item.quantity || 0}</TableCell>
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
