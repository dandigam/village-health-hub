import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { FileText, Package, Calendar, CreditCard, Truck, Pencil, Hash, Clock, Pill } from 'lucide-react';
import type { Invoice, InvoiceItem } from '@/hooks/useApiData';

interface InvoiceDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Invoice | null;
  onEdit?: (order: Invoice) => void;
}

export function InvoiceDetailDrawer({ open, onOpenChange, order, onEdit }: InvoiceDetailDrawerProps) {
  if (!order) return null;

  const items = order.items || [];
  const totalQty = items.reduce((sum: number, i) => sum + (i.quantity || 0), 0);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-0 border-l-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-primary to-accent px-5 py-5 text-white">
          <SheetHeader className="p-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-extrabold flex items-center gap-2.5 text-white">
                <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5" />
                </div>
                {order.invoiceNumber || `Invoice #${order.id}`}
              </SheetTitle>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white/20" onClick={() => onEdit(order)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                <Badge className="bg-white/20 text-white border-white/30 text-[11px] capitalize backdrop-blur-sm">
                  {order.paymentMode || 'N/A'}
                </Badge>
              </div>
            </div>
          </SheetHeader>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Key Info Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-stat-blue/80 to-stat-blue rounded-xl p-4 border border-stat-blue-text/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Truck className="w-3.5 h-3.5 text-stat-blue-text" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stat-blue-text">Supplier</span>
              </div>
              <p className="text-sm font-bold text-stat-blue-text truncate">{order.supplierName || '—'}</p>
            </div>

            <div className="bg-gradient-to-br from-stat-green/80 to-stat-green rounded-xl p-4 border border-stat-green-text/10">
              <div className="flex items-center gap-1.5 mb-2">
                <CreditCard className="w-3.5 h-3.5 text-stat-green-text" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stat-green-text">Amount</span>
              </div>
              <p className="text-sm font-bold text-stat-green-text">₹{order.invoiceAmount?.toLocaleString() || '0'}</p>
            </div>

            <div className="bg-gradient-to-br from-stat-orange/80 to-stat-orange rounded-xl p-4 border border-stat-orange-text/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Calendar className="w-3.5 h-3.5 text-stat-orange-text" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stat-orange-text">Invoice Date</span>
              </div>
              <p className="text-sm font-bold text-stat-orange-text">
                {order.invoiceDate ? format(new Date(order.invoiceDate), 'dd MMM yyyy') : '—'}
              </p>
            </div>

            <div className="bg-gradient-to-br from-stat-purple/80 to-stat-purple rounded-xl p-4 border border-stat-purple-text/10">
              <div className="flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-stat-purple-text" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stat-purple-text">Created</span>
              </div>
              <p className="text-sm font-bold text-stat-purple-text">
                {order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy') : '—'}
              </p>
              {order.createdAt && (
                <p className="text-[10px] text-stat-purple-text/70 mt-0.5">
                  {format(new Date(order.createdAt), 'HH:mm')}
                </p>
              )}
            </div>
          </div>

          {order.createdBy && (
            <div className="flex items-center justify-between bg-muted/30 rounded-lg px-4 py-2.5 border border-border/40">
              <span className="text-xs text-muted-foreground font-medium">Created By</span>
              <span className="text-xs font-semibold text-foreground">{order.createdBy}</span>
            </div>
          )}

          <Separator className="bg-border/40" />

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-widest text-foreground/70 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-3.5 h-3.5 text-primary" />
                </div>
                Line Items
              </h3>
              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] h-6 font-semibold">
                {items.length} items · {totalQty} units
              </Badge>
            </div>
            <div className="rounded-xl border border-border/50 overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gradient-to-r from-muted/60 to-muted/30 border-b border-border/50">
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider w-10 text-foreground/60">
                      <Hash className="w-3 h-3" />
                    </TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Medicine</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-foreground/60">Batch</TableHead>
                    <TableHead className="text-[10px] font-bold uppercase tracking-wider text-right text-foreground/60">Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-10 h-10 rounded-xl bg-muted/40 flex items-center justify-center">
                            <Pill className="w-5 h-5 text-muted-foreground/40" />
                          </div>
                          <p className="text-xs text-muted-foreground">No item details available</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((item: InvoiceItem, idx: number) => (
                      <TableRow key={item.id || idx} className="border-b border-border/20 hover:bg-primary/[0.03] transition-colors">
                        <TableCell>
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-muted/50 text-[10px] font-bold text-muted-foreground">
                            {idx + 1}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-semibold text-foreground">{item.medicineName || '—'}</div>
                          <div className="flex gap-1 mt-1">
                            {item.medicineType && (
                              <Badge variant="secondary" className="text-[9px] h-4 font-medium">{item.medicineType}</Badge>
                            )}
                            {item.hsnNo && (
                              <Badge variant="outline" className="text-[9px] h-4 font-medium border-border/50">HSN: {item.hsnNo}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="font-medium text-foreground/80">{item.batchNo || '—'}</div>
                          {item.expDate && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">Exp: {item.expDate}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center justify-center min-w-[2.5rem] h-8 rounded-lg bg-primary/10 text-primary font-bold text-sm px-2">
                            {item.quantity || 0}
                          </span>
                        </TableCell>
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
