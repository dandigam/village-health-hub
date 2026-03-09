import { useState, useEffect, useMemo } from 'react';
import { Plus, Send, Package, CheckCircle, Eye, Clock, ShoppingCart, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupplierOrders, useSuppliers, useMedicines, useStockItems, useWarehouses, useSupplierMedicines } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { SupplierOrder, SupplierOrderItem } from '@/types';

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  draft: { label: 'Draft', dot: 'bg-muted-foreground', bg: 'bg-muted/60', text: 'text-muted-foreground' },
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  sent: { label: 'Sent', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  partial: { label: 'Partial', dot: 'bg-orange-500 animate-pulse', bg: 'bg-orange-50', text: 'text-orange-700' },
  received: { label: 'Received', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

function StatusChip({ status }: { status: string }) {
  const cfg = statusConfig[status] || statusConfig.draft;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

export function SupplierOrdersTab() {
  const { data: supplierOrders = [] } = useSupplierOrders();
  const { data: suppliers = [] } = useSuppliers();
  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  const { data: warehouses = [] } = useWarehouses();
  const { data: supplierMedicines = [] } = useSupplierMedicines();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [subTab, setSubTab] = useState('current');
  const [showRequestStock, setShowRequestStock] = useState(false);
  const [showReceiveStock, setShowReceiveStock] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [receiveOrder, setReceiveOrder] = useState<SupplierOrder | null>(null);

  const [reqSupplierId, setReqSupplierId] = useState('');
  const [reqWarehouseId, setReqWarehouseId] = useState('');
  const [reqItems, setReqItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});

  useEffect(() => {
    if (supplierOrders.length > 0 && orders.length === 0) {
      setOrders(supplierOrders);
    }
  }, [supplierOrders]);

  const getWarehouseStock = (medicineId: string) => {
    const stock = stockItems.find(s => s.medicineId === medicineId);
    return stock?.quantity || 0;
  };

  const supplierMedicinesList = (supplierId: string) => {
    const medIds = supplierMedicines.filter(sm => sm.supplierId === supplierId).map(sm => sm.medicineId);
    return medicines.filter(m => medIds.includes(m.id));
  };

  const addReqItem = () => setReqItems([...reqItems, { medicineId: '', requestedQty: 0 }]);

  const handleSendRequest = () => {
    const now = new Date().toISOString();
    const newOrder: SupplierOrder = {
      id: String(orders.length + 1),
      supplierId: reqSupplierId,
      warehouseId: reqWarehouseId,
      items: reqItems.map(i => ({ medicineId: i.medicineId, requestedQty: i.requestedQty })),
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    };
    setOrders([newOrder, ...orders]);
    const supplier = suppliers.find(s => s.id === reqSupplierId);
    toast({ title: 'Request Sent to Supplier', description: `Stock request sent to ${supplier?.name}.` });
    setShowRequestStock(false);
    setReqSupplierId('');
    setReqWarehouseId('');
    setReqItems([]);
  };

  const handleReceiveStock = () => {
    if (!receiveOrder) return;
    const updatedOrders = orders.map(o => {
      if (o.id !== receiveOrder.id) return o;
      const updatedItems = o.items.map(item => ({ ...item, receivedQty: receiveQtys[item.medicineId] || 0 }));
      const allReceived = updatedItems.every(i => (i.receivedQty || 0) >= i.requestedQty);
      return { ...o, items: updatedItems, status: allReceived ? 'received' as const : 'partial' as const, receivedAt: new Date().toISOString() };
    });
    setOrders(updatedOrders);
    toast({ title: 'Stock Received', description: 'Warehouse stock updated with received quantities.' });
    setShowReceiveStock(false);
    setReceiveOrder(null);
    setReceiveQtys({});
  };

  // Derived data
  const currentOrders = orders.filter(o => ['sent', 'pending', 'partial', 'draft'].includes(o.status));
  const pendingOrders = orders.filter(o => o.status === 'sent' || o.status === 'pending');

  const ordersByMonth: Record<string, SupplierOrder[]> = {};
  orders.forEach(o => {
    const month = new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!ordersByMonth[month]) ordersByMonth[month] = [];
    ordersByMonth[month].push(o);
  });

  // Stats
  const stats = useMemo(() => ({
    current: currentOrders.length,
    total: orders.length,
    received: orders.filter(o => o.status === 'received').length,
    pending: pendingOrders.length,
  }), [orders, currentOrders, pendingOrders]);

  const renderOrderRow = (order: SupplierOrder) => {
    const supplier = suppliers.find(s => s.id === order.supplierId);
    const wh = warehouses.find(w => w.id === order.warehouseId);
    const totalQty = order.items.reduce((s, i) => s + i.requestedQty, 0);
    return (
      <motion.div
        key={order.id}
        variants={fadeUp}
        className="flex items-center justify-between p-3 border rounded-xl hover:shadow-md hover:border-primary/20 cursor-pointer transition-all duration-200 group bg-card"
        onClick={() => setSelectedOrder(order)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 rounded-lg bg-primary/5 group-hover:bg-primary/10 transition-colors shrink-0">
            <ShoppingCart className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold truncate">{supplier?.name || 'Unknown'}</span>
              <StatusChip status={order.status} />
            </div>
            <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(order.createdAt).toLocaleDateString()}</span>
              <span>{wh?.name || '-'}</span>
              <span>{order.items.length} items · {totalQty} units</span>
            </div>
          </div>
        </div>
        <Button size="icon" variant="ghost" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <Eye className="h-4 w-4" />
        </Button>
      </motion.div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />{stats.pending} pending</span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />{stats.received} received</span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">{stats.total} total</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setShowReceiveStock(true)} disabled={pendingOrders.length === 0}>
            <Package className="mr-1.5 h-3.5 w-3.5" /> Receive Stock
          </Button>
          <Button size="sm" className="h-8 text-xs" onClick={() => setShowRequestStock(true)}>
            <Plus className="mr-1.5 h-3.5 w-3.5" /> Create Purchase Order
          </Button>
        </div>
      </div>

      {/* Tabs: Current → Monthly → All */}
      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList className="h-9">
          <TabsTrigger value="current" className="text-xs gap-1.5">
            <AlertCircle className="h-3 w-3" /> Current Orders
            {stats.current > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px] ml-0.5">{stats.current}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="monthly" className="text-xs gap-1.5">
            <Calendar className="h-3 w-3" /> Monthly Tracking
          </TabsTrigger>
          <TabsTrigger value="orders" className="text-xs gap-1.5">
            <TrendingUp className="h-3 w-3" /> All Orders
          </TabsTrigger>
        </TabsList>

        {/* Current Orders */}
        <TabsContent value="current">
          <motion.div initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.04 } } }} className="space-y-2">
            {currentOrders.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 text-center">
                  <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">No active orders</p>
                  <p className="text-xs text-muted-foreground mb-4">All orders have been fulfilled</p>
                  <Button size="sm" variant="outline" onClick={() => setShowRequestStock(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Create First Order
                  </Button>
                </CardContent>
              </Card>
            ) : (
              currentOrders.map(renderOrderRow)
            )}
          </motion.div>
        </TabsContent>

        {/* Monthly Tracking */}
        <TabsContent value="monthly">
          <div className="space-y-4">
            {Object.keys(ordersByMonth).length === 0 ? (
              <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">No orders to track yet.</CardContent></Card>
            ) : (
              Object.entries(ordersByMonth).map(([month, monthOrders]) => (
                <Card key={month} className="overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-semibold">{month}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-[10px] h-5">{monthOrders.length} orders</Badge>
                      <Badge variant="outline" className="text-[10px] h-5">
                        {monthOrders.reduce((s, o) => s + o.items.reduce((t, i) => t + i.requestedQty, 0), 0)} units
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-2 space-y-1.5">
                    {monthOrders.map(order => {
                      const supplier = suppliers.find(s => s.id === order.supplierId);
                      return (
                        <div key={order.id} className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-medium">{supplier?.name}</span>
                            <span className="text-xs text-muted-foreground">({order.items.length} items)</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</span>
                            <StatusChip status={order.status} />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* All Orders */}
        <TabsContent value="orders">
          {orders.length === 0 ? (
            <Card className="border-dashed"><CardContent className="py-10 text-center text-sm text-muted-foreground">No orders yet.</CardContent></Card>
          ) : (
            <div className="data-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th><th>Supplier</th><th>Warehouse</th><th>Items</th><th>Units</th><th>Status</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => {
                    const supplier = suppliers.find(s => s.id === order.supplierId);
                    const wh = warehouses.find(w => w.id === order.warehouseId);
                    const totalQty = order.items.reduce((s, i) => s + i.requestedQty, 0);
                    return (
                      <tr key={order.id} className="cursor-pointer" onClick={() => setSelectedOrder(order)}>
                        <td className="text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="font-medium">{supplier?.name || '-'}</td>
                        <td>{wh?.name || '-'}</td>
                        <td>{order.items.length}</td>
                        <td>{totalQty}</td>
                        <td><StatusChip status={order.status} /></td>
                        <td><Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-primary" />Order Details</DialogTitle></DialogHeader>
          {selectedOrder && (() => {
            const supplier = suppliers.find(s => s.id === selectedOrder.supplierId);
            const wh = warehouses.find(w => w.id === selectedOrder.warehouseId);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Supplier</p>
                    <p className="text-sm font-semibold">{supplier?.name}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Warehouse</p>
                    <p className="text-sm font-semibold">{wh?.name}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Order Date</p>
                    <p className="text-sm font-semibold">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Status</p>
                    <StatusChip status={selectedOrder.status} />
                  </div>
                </div>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/30"><th className="p-2.5 text-left text-xs font-medium text-muted-foreground">Medicine</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Requested</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Received</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map((item, i) => {
                        const med = medicines.find(m => m.id === item.medicineId);
                        return (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-2.5 font-medium">{med?.name || '-'}</td>
                            <td className="p-2.5 text-center">{item.requestedQty}</td>
                            <td className="p-2.5 text-center">{item.receivedQty ?? <span className="text-muted-foreground">—</span>}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedOrder.receivedAt && <p className="text-xs text-muted-foreground">Received on: {new Date(selectedOrder.receivedAt).toLocaleDateString()}</p>}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Request Stock Dialog */}
      <Dialog open={showRequestStock} onOpenChange={setShowRequestStock}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Send className="h-4 w-4 text-primary" />Request Stock from Supplier</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Supplier</Label>
                <Select value={reqSupplierId} onValueChange={v => { setReqSupplierId(v); setReqItems([]); }}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>{suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Destination Warehouse</Label>
                <Select value={reqWarehouseId} onValueChange={setReqWarehouseId}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>{warehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {reqSupplierId && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs">Medicines</Label>
                  <Button size="sm" variant="outline" className="h-7 text-xs" onClick={addReqItem}><Plus className="mr-1 h-3 w-3" /> Add</Button>
                </div>
                {reqItems.length === 0 ? (
                  <div className="border border-dashed rounded-xl p-6 text-center">
                    <p className="text-xs text-muted-foreground">Click "Add" to add medicines to this request.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reqItems.map((item, idx) => {
                      const currentQty = getWarehouseStock(item.medicineId);
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded-xl bg-muted/20">
                          <Select value={item.medicineId} onValueChange={v => { const u = [...reqItems]; u[idx].medicineId = v; setReqItems(u); }}>
                            <SelectTrigger className="flex-1 h-9 text-sm"><SelectValue placeholder="Select medicine" /></SelectTrigger>
                            <SelectContent>{supplierMedicinesList(reqSupplierId).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}</SelectContent>
                          </Select>
                          {item.medicineId && <span className="text-[10px] text-muted-foreground whitespace-nowrap px-2 py-1 bg-muted rounded-md">Stock: {currentQty}</span>}
                          <Input type="number" placeholder="Qty" className="w-20 h-9 text-sm" value={item.requestedQty || ''} onChange={e => { const u = [...reqItems]; u[idx].requestedQty = Number(e.target.value); setReqItems(u); }} />
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive shrink-0" onClick={() => setReqItems(reqItems.filter((_, i) => i !== idx))}>×</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowRequestStock(false)}>Cancel</Button>
            <Button size="sm" onClick={handleSendRequest} disabled={!reqSupplierId || !reqWarehouseId || reqItems.length === 0}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={showReceiveStock} onOpenChange={setShowReceiveStock}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" />Receive Stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Select Order to Receive</Label>
              <Select value={receiveOrder?.id || ''} onValueChange={v => {
                const order = pendingOrders.find(o => o.id === v);
                setReceiveOrder(order || null);
                if (order) {
                  const qtys: Record<string, number> = {};
                  order.items.forEach(i => { qtys[i.medicineId] = i.requestedQty; });
                  setReceiveQtys(qtys);
                }
              }}>
                <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select pending order" /></SelectTrigger>
                <SelectContent>
                  {pendingOrders.map(o => {
                    const supplier = suppliers.find(s => s.id === o.supplierId);
                    return <SelectItem key={o.id} value={o.id}>{supplier?.name} — {new Date(o.createdAt).toLocaleDateString()}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>
            {receiveOrder && (
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30"><th className="p-2.5 text-left text-xs font-medium text-muted-foreground">Medicine</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Current</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Receive Qty</th></tr></thead>
                  <tbody>
                    {receiveOrder.items.map((item, i) => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      const existingQty = getWarehouseStock(item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2.5 font-medium">{med?.name || '-'}</td>
                          <td className="p-2.5 text-center text-muted-foreground">{existingQty}</td>
                          <td className="p-2.5 text-center"><Input type="number" className="w-20 h-8 text-sm mx-auto" value={receiveQtys[item.medicineId] || ''} onChange={e => setReceiveQtys({ ...receiveQtys, [item.medicineId]: Number(e.target.value) })} /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" size="sm" onClick={() => { setShowReceiveStock(false); setReceiveOrder(null); }}>Cancel</Button>
            <Button size="sm" onClick={handleReceiveStock} disabled={!receiveOrder}>
              <CheckCircle className="mr-1.5 h-3.5 w-3.5" /> Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
