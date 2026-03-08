import { useState, useMemo } from 'react';
import { X, Send, Save, CheckCircle, AlertTriangle, Printer, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMedicines, useStockItems, useWarehouses } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { RequestOrder, RequestOrderItem } from '@/types';
import { cn } from '@/lib/utils';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',    dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50',   text: 'text-amber-700' },
  draft:     { label: 'Draft',      dot: 'bg-muted-foreground',        bg: 'bg-muted/60',   text: 'text-muted-foreground' },
  partial:   { label: 'Partial',    dot: 'bg-orange-500 animate-pulse',bg: 'bg-orange-50',  text: 'text-orange-700' },
  sent:      { label: 'Completed',  dot: 'bg-emerald-500',             bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled',  dot: 'bg-red-500',                 bg: 'bg-red-50',     text: 'text-red-700' },
};

// Mock batches for demo
const mockBatches: Record<string, { batch: string; expiry: string; qty: number }[]> = {
  '1': [{ batch: 'B001', expiry: '08/26', qty: 200 }, { batch: 'B002', expiry: '11/26', qty: 150 }],
  '2': [{ batch: 'B003', expiry: '09/26', qty: 300 }],
  '3': [{ batch: 'B002', expiry: '11/26', qty: 100 }],
  '4': [{ batch: 'B004', expiry: '06/26', qty: 80 }],
  '5': [{ batch: 'B005', expiry: '12/26', qty: 120 }],
  '6': [{ batch: 'B006', expiry: '10/26', qty: 200 }],
  '7': [{ batch: 'B001', expiry: '08/26', qty: 500 }, { batch: 'B002', expiry: '11/26', qty: 300 }],
  '8': [{ batch: 'B007', expiry: '07/26', qty: 150 }],
  '9': [{ batch: 'B008', expiry: '01/27', qty: 400 }],
  '10': [{ batch: 'B009', expiry: '05/26', qty: 100 }],
};

interface Props {
  order: RequestOrder;
  allOrders: RequestOrder[];
  onClose: () => void;
  onUpdate: (order: RequestOrder) => void;
  onSelectOrder: (order: RequestOrder) => void;
}

export function DistributionFulfillment({ order, allOrders, onClose, onUpdate, onSelectOrder }: Props) {
  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  const { data: warehouses = [] } = useWarehouses();

  const isCompleted = order.status === 'sent' || order.status === 'cancelled';

  const [items, setItems] = useState<(RequestOrderItem & { selectedBatch?: string })[]>(() =>
    order.items.map(item => {
      const batches = mockBatches[item.medicineId] || [];
      return {
        ...item,
        sendQty: item.sendQty || Math.min(item.requestedQty, batches[0]?.qty || 0),
        selectedBatch: batches[0] ? `${batches[0].batch}` : undefined,
      };
    })
  );
  const [notes, setNotes] = useState(order.notes || '');

  const updateSendQty = (idx: number, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      return { ...item, sendQty: Math.max(0, Math.min(value, item.requestedQty)) };
    }));
  };

  const updateBatch = (idx: number, batch: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, selectedBatch: batch } : item));
  };

  const totalRequested = items.reduce((s, i) => s + i.requestedQty, 0);
  const totalPicked = items.reduce((s, i) => s + i.sendQty, 0);

  const handleAction = (status: 'draft' | 'sent' | 'cancelled') => {
    const updated: RequestOrder = {
      ...order,
      items: items.map(({ selectedBatch, ...rest }) => rest),
      notes: notes || undefined,
      status,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
    const msgs = {
      draft: 'Order saved as draft.',
      sent: `Stock dispatched to ${order.clientName}.`,
      cancelled: 'Order has been cancelled.',
    };
    toast({ title: status === 'sent' ? 'Dispatched' : status === 'draft' ? 'Draft Saved' : 'Cancelled', description: msgs[status] });
  };

  const pendingOrders = allOrders.filter(o => o.id !== order.id);
  const wh = warehouses.find(w => w.id === order.warehouseId);
  const cfg = statusConfig[order.status];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 top-14 sm:top-[60px] z-40 bg-black/40 flex"
    >
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="ml-auto flex h-full w-full max-w-[1100px] bg-background shadow-2xl"
      >
        {/* Left sidebar - Pending Requests (only for non-completed) */}
        {!isCompleted && pendingOrders.length > 0 && (
          <div className="w-[280px] border-r bg-muted/20 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b">
              <h3 className="text-sm font-semibold text-foreground">Pending Requests</h3>
              <p className="text-[11px] text-muted-foreground">{pendingOrders.length} other orders</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {pendingOrders.map(o => {
                const oCfg = statusConfig[o.status];
                return (
                  <div
                    key={o.id}
                    onClick={() => onSelectOrder(o)}
                    className="p-3.5 rounded-xl border bg-card cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-primary">ORD-{o.id.padStart(4, '0')}</span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${oCfg.bg} ${oCfg.text}`}>
                        <span className={`w-1 h-1 rounded-full ${oCfg.dot}`} />
                        {oCfg.label}
                      </span>
                    </div>
                    <p className="text-xs font-medium mt-1">{o.clientName}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{o.requestedBy}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-5 py-3 border-b flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold">Order #{order.id.padStart(4, '0')} — {order.clientName}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-0.5 text-[11px] text-muted-foreground">
                <span>Requested by: <strong className="text-foreground">{order.requestedBy}</strong></span>
                <span>Date: <strong className="text-foreground">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isCompleted && (
                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                  <Printer className="h-3 w-3" /> Print Manifest
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Medicine table */}
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <div className="border rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Medicine Requested</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qty Needed</th>
                    {!isCompleted && (
                      <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Batch Selector
                      </th>
                    )}
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Qty Picked</th>
                    <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => {
                    const med = medicines.find(m => m.id === item.medicineId);
                    const batches = mockBatches[item.medicineId] || [];
                    const isFull = item.sendQty >= item.requestedQty;
                    const isPartial = item.sendQty > 0 && item.sendQty < item.requestedQty;
                    return (
                      <tr key={item.medicineId} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium">{med?.name || '-'}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-semibold">
                          {item.requestedQty} <span className="text-muted-foreground font-normal text-[11px]">Units</span>
                        </td>
                        {!isCompleted && (
                          <td className="px-4 py-3">
                            <Select value={item.selectedBatch || ''} onValueChange={(v) => updateBatch(idx, v)}>
                              <SelectTrigger className="h-8 text-xs w-[200px] border-primary/30">
                                <SelectValue placeholder="Select Batch" />
                              </SelectTrigger>
                              <SelectContent>
                                {batches.map(b => (
                                  <SelectItem key={b.batch} value={b.batch}>
                                    Batch ({b.batch} - Exp: {b.expiry})
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        )}
                        <td className="px-4 py-3 text-center">
                          {isCompleted ? (
                            <span className="font-semibold">{item.sendQty}</span>
                          ) : (
                            <div className="flex items-center justify-center gap-1.5">
                              <Input
                                type="number"
                                className="h-8 w-16 text-center text-sm"
                                value={item.sendQty}
                                min={0}
                                max={item.requestedQty}
                                onChange={e => updateSendQty(idx, Number(e.target.value))}
                              />
                              {isPartial && (
                                <span className="text-[11px] text-orange-600 font-medium">[ {item.sendQty} ]</span>
                              )}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isFull ? (
                            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] gap-1 px-2">
                              <CheckCircle className="h-3 w-3" /> Ready
                            </Badge>
                          ) : isPartial ? (
                            <Badge className="bg-orange-50 text-orange-700 border-orange-200 text-[10px] gap-1 px-2">
                              <AlertTriangle className="h-3 w-3" /> Partial
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-2">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Notes */}
            {!isCompleted && (
              <div className="mt-4 space-y-1.5">
                <Label className="text-xs font-medium">Logistics Notes</Label>
                <Textarea
                  className="resize-none h-16 text-sm"
                  placeholder="Any notes for this dispatch..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            )}

            {isCompleted && order.notes && (
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border">
                <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {!isCompleted && (
            <div className="px-5 py-3 border-t flex items-center justify-between shrink-0 bg-muted/10">
              <div className="text-xs text-muted-foreground">
                Picking <strong className="text-foreground">{totalPicked}</strong> / {totalRequested} units
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="text-xs" onClick={() => handleAction('draft')}>
                  <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
                </Button>
                <Button size="sm" className="text-xs bg-primary hover:bg-primary/90" onClick={() => handleAction('sent')}>
                  <Send className="mr-1.5 h-3.5 w-3.5" /> Confirm Dispatch & Deduct Stock
                </Button>
              </div>
            </div>
          )}

          {isCompleted && (
            <div className="px-5 py-3 border-t flex items-center justify-end shrink-0 bg-muted/10">
              <Button variant="outline" size="sm" className="text-xs" onClick={onClose}>Close</Button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
