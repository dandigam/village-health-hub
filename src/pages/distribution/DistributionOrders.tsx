import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ArrowRightLeft, FileText, History, Search, Filter, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRequestOrders, useWarehouses, useMedicines, useDistributions } from '@/hooks/useApiData';
import { DistributionFulfillment } from '@/components/stock/distribution/DistributionFulfillment';
import { DistributionHistoryTable } from '@/components/stock/distribution/DistributionHistoryTable';
import type { RequestOrder } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending:   { label: 'Pending',   dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50',   text: 'text-amber-700' },
  draft:     { label: 'Draft',     dot: 'bg-muted-foreground',        bg: 'bg-muted/60',   text: 'text-muted-foreground' },
  partial:   { label: 'Partial',   dot: 'bg-orange-500 animate-pulse',bg: 'bg-orange-50',  text: 'text-orange-700' },
  sent:      { label: 'Completed', dot: 'bg-emerald-500',             bg: 'bg-emerald-50', text: 'text-emerald-700' },
  cancelled: { label: 'Cancelled', dot: 'bg-red-500',                 bg: 'bg-red-50',     text: 'text-red-700' },
};

export default function DistributionOrders() {
  const { data: orders = [] } = useRequestOrders();
  const { data: warehouses = [] } = useWarehouses();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<RequestOrder | null>(null);
  const [localOrders, setLocalOrders] = useState<RequestOrder[]>([]);
  const [init, setInit] = useState(false);

  if (!init && orders.length > 0) { setLocalOrders(orders); setInit(true); }

  const activeOrders = useMemo(() => {
    return localOrders
      .filter(o => o.status !== 'sent' && o.status !== 'cancelled')
      .filter(o => !search || o.clientName.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search))
      .filter(o => statusFilter === 'all' || o.status === statusFilter);
  }, [localOrders, search, statusFilter]);

  const completedOrders = useMemo(() => {
    return localOrders.filter(o => o.status === 'sent' || o.status === 'cancelled');
  }, [localOrders]);

  const handleOrderUpdate = (updated: RequestOrder) => {
    setLocalOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
    setSelectedOrder(null);
  };

  const stats = useMemo(() => ({
    pending: localOrders.filter(o => o.status === 'pending').length,
    draft: localOrders.filter(o => o.status === 'draft').length,
    partial: localOrders.filter(o => o.status === 'partial').length,
    completed: localOrders.filter(o => o.status === 'sent').length,
  }), [localOrders]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-primary/10">
            <ArrowRightLeft className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground">Distribution Orders</h1>
            <p className="text-[11px] text-muted-foreground">{localOrders.length} total orders</p>
          </div>
        </div>
        {/* Stat chips */}
        <div className="flex items-center gap-2">
          {[
            { label: 'Pending', count: stats.pending, color: 'bg-amber-500 animate-pulse' },
            { label: 'Draft', count: stats.draft, color: 'bg-muted-foreground' },
            { label: 'Completed', count: stats.completed, color: 'bg-emerald-500' },
          ].map(s => (
            <span key={s.label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
              <span className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
              {s.count} {s.label}
            </span>
          ))}
        </div>
      </div>

      <Tabs defaultValue="current" className="space-y-3">
        <TabsList className="h-9">
          <TabsTrigger value="current" className="text-xs gap-1.5">
            <FileText className="h-3 w-3" /> Current Orders
          </TabsTrigger>
          <TabsTrigger value="history" className="text-xs gap-1.5">
            <History className="h-3 w-3" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search by ID or name..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 text-xs"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <Filter className="h-3 w-3 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="border rounded-xl overflow-hidden bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30">
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request ID</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Name / Destination</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Request Date</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Requested By</th>
                  <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Priority</th>
                  <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {activeOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                      No active distribution orders found
                    </td>
                  </tr>
                ) : (
                  activeOrders.map(order => {
                    const cfg = statusConfig[order.status];
                    const totalItems = order.items.reduce((s, i) => s + i.requestedQty, 0);
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setSelectedOrder(order)}
                        className="cursor-pointer transition-colors hover:bg-primary/[0.03] group"
                      >
                        <td className="px-4 py-2.5">
                          <span className="font-semibold text-primary">ORD-{order.id.padStart(4, '0')}</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="font-medium">{order.clientName}</div>
                          <div className="text-[11px] text-muted-foreground">{warehouses.find(w => w.id === order.warehouseId)?.name || '-'}</div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{order.requestedBy}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className="font-semibold">{order.items.length}</span>
                          <span className="text-muted-foreground text-[11px] ml-1">({totalItems} units)</span>
                        </td>
                        <td className="px-4 py-2.5">
                          <Badge variant="outline" className="text-[10px] font-medium px-2 py-0.5">Normal</Badge>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="history">
          <DistributionHistoryTable />
        </TabsContent>
      </Tabs>

      {/* Fulfillment Detail - opens when clicking a row */}
      <AnimatePresence>
        {selectedOrder && (
          <DistributionFulfillment
            order={selectedOrder}
            allOrders={activeOrders}
            onClose={() => setSelectedOrder(null)}
            onUpdate={handleOrderUpdate}
            onSelectOrder={setSelectedOrder}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
