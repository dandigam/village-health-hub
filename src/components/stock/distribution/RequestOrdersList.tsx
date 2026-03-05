import { useState } from 'react';
import { FileText, Clock, User, MapPin, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRequestOrders, useWarehouses } from '@/hooks/useApiData';
import type { RequestOrder } from '@/types';
import { OrderFulfillmentModal } from './OrderFulfillmentModal';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  draft: { label: 'Draft', dot: 'bg-muted-foreground', bg: 'bg-muted/60', text: 'text-muted-foreground' },
  partial: { label: 'Partial', dot: 'bg-orange-500 animate-pulse', bg: 'bg-orange-50', text: 'text-orange-700' },
  sent: { label: 'Sent', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
};

const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
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
      <div className="space-y-3">
        {/* Summary stats */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            {activeOrders.filter(o => o.status === 'pending').length} pending
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
            {activeOrders.filter(o => o.status === 'draft').length} draft
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
            {activeOrders.length} active
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No pending requests</p>
              <p className="text-xs text-muted-foreground">All distribution orders have been fulfilled</p>
            </CardContent>
          </Card>
        ) : (
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-2">
            {activeOrders.map(order => {
              const wh = warehouses.find(w => w.id === order.warehouseId);
              const cfg = statusConfig[order.status];
              return (
                <motion.div
                  key={order.id}
                  variants={fadeUp}
                  onClick={() => setSelectedOrder(order)}
                  className="flex items-center justify-between p-3 border rounded-xl cursor-pointer hover:shadow-md hover:border-primary/20 transition-all duration-200 group bg-card"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate">{order.clientName}</span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><User className="h-3 w-3" />{order.requestedBy}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{wh?.name || '-'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-sm font-semibold">{order.items.length} medicines</p>
                      <p className="text-[11px] text-muted-foreground">{totalItems(order)} units</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
      {selectedOrder && <OrderFulfillmentModal order={selectedOrder} open={!!selectedOrder} onOpenChange={(open) => { if (!open) setSelectedOrder(null); }} onUpdate={handleOrderUpdate} />}
    </>
  );
}
