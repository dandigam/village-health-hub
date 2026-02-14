import { useState } from 'react';
import { Send, Save, X, CheckCircle, AlertTriangle, Package, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockMedicines, mockStockItems, mockWarehouses } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { RequestOrder, RequestOrderItem } from '@/types';

interface Props {
  order: RequestOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (order: RequestOrder) => void;
}

export function OrderFulfillmentModal({ order, open, onOpenChange, onUpdate }: Props) {
  const [items, setItems] = useState<RequestOrderItem[]>(() =>
    order.items.map(item => {
      const stock = mockStockItems.find(s => s.medicineId === item.medicineId);
      const available = stock?.quantity || 0;
      return { ...item, sendQty: item.sendQty || Math.min(item.requestedQty, available) };
    })
  );
  const [warehouseId, setWarehouseId] = useState(order.warehouseId);
  const [notes, setNotes] = useState(order.notes || '');

  const getAvailable = (medicineId: string) => {
    const stock = mockStockItems.find(s => s.medicineId === medicineId);
    return stock?.quantity || 0;
  };

  const updateSendQty = (index: number, value: number) => {
    setItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const available = getAvailable(item.medicineId);
      return { ...item, sendQty: Math.max(0, Math.min(value, available, item.requestedQty)) };
    }));
  };

  const totalRequested = items.reduce((s, i) => s + i.requestedQty, 0);
  const totalSending = items.reduce((s, i) => s + i.sendQty, 0);
  const hasShortage = items.some(i => i.sendQty < i.requestedQty);

  const handleAction = (status: 'draft' | 'sent' | 'cancelled') => {
    const updated: RequestOrder = {
      ...order,
      items,
      warehouseId,
      notes: notes || undefined,
      status,
      updatedAt: new Date().toISOString(),
    };
    onUpdate(updated);
    const messages = {
      draft: 'Order saved as draft.',
      sent: `Stock ${hasShortage ? 'partially ' : ''}sent to ${order.clientName}.`,
      cancelled: 'Order has been cancelled.',
    };
    toast({ title: status === 'sent' ? 'Distribution Sent' : status === 'draft' ? 'Draft Saved' : 'Order Cancelled', description: messages[status] });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-base font-semibold">
            Request Stock from Supplier
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Order #{order.id} · Requested by {order.requestedBy} on {new Date(order.createdAt).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Supplier & Warehouse row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Client / Camp</Label>
              <Input value={order.clientName} readOnly className="h-9 bg-muted/30" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">From Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Medicines header */}
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Medicines</Label>
            <div className="text-xs text-muted-foreground">
              Sending <span className="font-semibold text-foreground">{totalSending}</span> / {totalRequested} requested
            </div>
          </div>

          {/* Medicine rows */}
          <div className="space-y-2">
            {items.map((item, idx) => {
              const med = mockMedicines.find(m => m.id === item.medicineId);
              const available = getAvailable(item.medicineId);
              const isShort = available < item.requestedQty;
              const isFull = item.sendQty >= item.requestedQty;

              return (
                <div key={item.medicineId} className="flex items-center gap-3 p-3 border rounded-lg bg-muted/20">
                  {/* S.No */}
                  <span className="text-xs text-muted-foreground w-5 shrink-0">{idx + 1}.</span>

                  {/* Medicine name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{med?.name || '-'}</div>
                  </div>

                  {/* Current stock */}
                  <div className="text-center shrink-0 w-20">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Current</div>
                    <span className={`text-sm font-semibold ${isShort ? 'text-destructive' : 'text-green-600'}`}>
                      {available}
                    </span>
                  </div>

                  {/* Requested */}
                  <div className="text-center shrink-0 w-20">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">Requested</div>
                    <span className="text-sm font-semibold">{item.requestedQty}</span>
                  </div>

                  {/* Send Qty */}
                  <div className="shrink-0 w-20">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5 text-center">Send</div>
                    <Input
                      type="number"
                      className="h-8 text-center text-sm"
                      value={item.sendQty}
                      min={0}
                      max={Math.min(item.requestedQty, available)}
                      onChange={e => updateSendQty(idx, Number(e.target.value))}
                    />
                  </div>

                  {/* Status */}
                  <div className="shrink-0 w-16 text-center">
                    {isFull ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] gap-0.5 px-1.5">
                        <CheckCircle className="h-3 w-3" /> Full
                      </Badge>
                    ) : (
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-[10px] gap-0.5 px-1.5">
                        <AlertTriangle className="h-3 w-3" /> Partial
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {hasShortage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-xs text-orange-700">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>Some medicines have insufficient stock. They will be partially fulfilled.</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Notes (optional)</Label>
            <Textarea className="resize-none h-16 text-sm" placeholder="Any notes for this order..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <div className="px-6 py-4 border-t flex items-center justify-between">
          <Button variant="destructive" size="sm" onClick={() => handleAction('cancelled')}>
            <X className="mr-1.5 h-3.5 w-3.5" /> Cancel Order
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => handleAction('draft')}>
              <Save className="mr-1.5 h-3.5 w-3.5" /> Save Draft
            </Button>
            <Button size="sm" onClick={() => handleAction('sent')}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send & Confirm
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
