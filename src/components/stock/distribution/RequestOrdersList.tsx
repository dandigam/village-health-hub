import { useState } from 'react';
import { FileText, Clock, User, MapPin } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRequestOrders, useWarehouses } from '@/hooks/useApiData';
import type { RequestOrder } from '@/types';
import { OrderFulfillmentModal } from './OrderFulfillmentModal';

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  draft: { label: 'Draft', className: 'bg-muted text-muted-foreground border-border' },
  partial: { label: 'Partial', className: 'bg-orange-100 text-orange-700 border-orange-200' },
  sent: { label: 'Sent', className: 'bg-green-100 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-200' },
};

export function RequestOrdersList() {
  const { data: initialOrders = [] } = useRequestOrders();
  const { data: warehouses = [] } = useWarehouses();
  const [orders, setOrders] = useState<RequestOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<RequestOrder | null>(null);
  const [initialized, setInitialized] = useState(false);

  if (!initialized && initialOrders.length > 0) { setOrders(initialOrders); setInitialized(true); }

  const handleOrderUpdate = (updated: RequestOrder) => { setOrders(prev => prev.map(o => o.id === updated.id ? updated : o)); setSelectedOrder(null); };
  const activeOrders = orders.filter(o => o.status !== 'sent' && o.status !== 'cancelled');
  const totalItems = (order: RequestOrder) => order.items.reduce((s, i) => s + i.requestedQty, 0);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" />Request Orders</CardTitle>
          <p className="text-sm text-muted-foreground">Click on an order to review and fulfill medicines.</p>
        </CardHeader>
        <CardContent>
          {activeOrders.length === 0 ? (<p className="text-center py-8 text-muted-foreground">No pending request orders.</p>) : (
            <div className="space-y-3">
              {activeOrders.map(order => {
                const wh = warehouses.find(w => w.id === order.warehouseId);
                const cfg = statusConfig[order.status];
                return (
                  <div key={order.id} onClick={() => setSelectedOrder(order)} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors group">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2"><span className="font-semibold">{order.clientName}</span><Badge className={cfg.className}>{cfg.label}</Badge></div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3.5 w-3.5" />{order.requestedBy}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{wh?.name || '-'}</span>
                      </div>
                    </div>
                    <div className="text-right"><p className="text-sm font-medium">{order.items.length} medicines</p><p className="text-xs text-muted-foreground">{totalItems(order)} units requested</p></div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      {selectedOrder && <OrderFulfillmentModal order={selectedOrder} open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }} onUpdate={handleOrderUpdate} />}
    </>
  );
}
