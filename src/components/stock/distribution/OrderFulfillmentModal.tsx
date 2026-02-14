import { useState } from 'react';
import { Send, Save, X, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                {order.clientName} — Order #{order.id}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Requested by <span className="font-medium">{order.requestedBy}</span> on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Warehouse selector */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>From Warehouse</Label>
              <Select value={warehouseId} onValueChange={setWarehouseId}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <div className="text-sm">
                <span className="text-muted-foreground">Sending </span>
                <span className="font-semibold text-lg">{totalSending}</span>
                <span className="text-muted-foreground"> / {totalRequested} requested</span>
              </div>
            </div>
          </div>

          {/* Medicine table */}
          <div className="border rounded-lg overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">S.No</th>
                  <th className="text-left p-3 font-medium">Medicine</th>
                  <th className="text-center p-3 font-medium">Requested</th>
                  <th className="text-center p-3 font-medium">Available</th>
                  <th className="text-center p-3 font-medium">Send Qty</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => {
                  const med = mockMedicines.find(m => m.id === item.medicineId);
                  const available = getAvailable(item.medicineId);
                  const isShort = available < item.requestedQty;
                  const isFull = item.sendQty >= item.requestedQty;
                  return (
                    <tr key={item.medicineId} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 font-medium">{med?.name || '-'}</td>
                      <td className="p-3 text-center font-semibold">{item.requestedQty}</td>
                      <td className="p-3 text-center">
                        <span className={isShort ? 'text-destructive font-semibold' : 'text-green-600 font-medium'}>
                          {available}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          className="w-20 mx-auto text-center h-8"
                          value={item.sendQty}
                          min={0}
                          max={Math.min(item.requestedQty, available)}
                          onChange={e => updateSendQty(idx, Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 text-center">
                        {isFull ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                            <CheckCircle className="h-3 w-3" /> Full
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                            <AlertTriangle className="h-3 w-3" /> Partial
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {hasShortage && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>Some medicines have insufficient stock. They will be partially fulfilled.</span>
            </div>
          )}

          <div>
            <Label>Notes (optional)</Label>
            <Textarea className="mt-1.5" placeholder="Any notes for this order..." value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button variant="destructive" onClick={() => handleAction('cancelled')}>
            <X className="mr-2 h-4 w-4" /> Cancel Order
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleAction('draft')}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button onClick={() => handleAction('sent')}>
              <Send className="mr-2 h-4 w-4" /> Send & Confirm
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
