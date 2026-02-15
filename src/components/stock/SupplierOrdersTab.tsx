import { useState } from 'react';
import { Plus, Send, Package, CheckCircle, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockSupplierOrders, mockSuppliers, mockMedicines, mockStockItems, mockWarehouses, mockSupplierMedicines } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { SupplierOrder, SupplierOrderItem } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  received: 'bg-green-100 text-green-700 border-green-200',
};

export function SupplierOrdersTab() {
  const [orders, setOrders] = useState<SupplierOrder[]>(mockSupplierOrders);
  const [subTab, setSubTab] = useState('orders');
  const [showRequestStock, setShowRequestStock] = useState(false);
  const [showReceiveStock, setShowReceiveStock] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [receiveOrder, setReceiveOrder] = useState<SupplierOrder | null>(null);

  // Request Stock form
  const [reqSupplierId, setReqSupplierId] = useState('');
  const [reqWarehouseId, setReqWarehouseId] = useState('');
  const [reqItems, setReqItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);

  // Receive stock form
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});

  const getWarehouseStock = (medicineId: string) => {
    const stock = mockStockItems.find(s => s.medicineId === medicineId);
    return stock?.quantity || 0;
  };

  const supplierMedicinesList = (supplierId: string) => {
    const medIds = mockSupplierMedicines.filter(sm => sm.supplierId === supplierId).map(sm => sm.medicineId);
    return mockMedicines.filter(m => medIds.includes(m.id));
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
    const supplier = mockSuppliers.find(s => s.id === reqSupplierId);
    toast({
      title: 'Request Sent to Supplier',
      description: `Stock request sent to ${supplier?.name}. Email notification will be sent.`,
    });
    setShowRequestStock(false);
    setReqSupplierId('');
    setReqWarehouseId('');
    setReqItems([]);
  };

  const handleReceiveStock = () => {
    if (!receiveOrder) return;
    const updatedOrders = orders.map(o => {
      if (o.id !== receiveOrder.id) return o;
      const updatedItems = o.items.map(item => ({
        ...item,
        receivedQty: receiveQtys[item.medicineId] || 0,
      }));
      const allReceived = updatedItems.every(i => (i.receivedQty || 0) >= i.requestedQty);
      return { ...o, items: updatedItems, status: allReceived ? 'received' as const : 'partial' as const, receivedAt: new Date().toISOString() };
    });
    setOrders(updatedOrders);
    toast({ title: 'Stock Received', description: 'Warehouse stock has been updated with received quantities.' });
    setShowReceiveStock(false);
    setReceiveOrder(null);
    setReceiveQtys({});
  };

  const pendingOrders = orders.filter(o => o.status === 'sent' || o.status === 'pending');

  // Monthly order tracking
  const ordersByMonth: Record<string, SupplierOrder[]> = {};
  orders.forEach(o => {
    const month = new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!ordersByMonth[month]) ordersByMonth[month] = [];
    ordersByMonth[month].push(o);
  });

  return (
    <div className="space-y-6">
      <div className="flex gap-2 flex-wrap">
        <Button variant="outline" onClick={() => setShowRequestStock(true)}>
          <Send className="mr-2 h-4 w-4" />
          Request Stock from Supplier
        </Button>
        <Button variant="outline" onClick={() => setShowReceiveStock(true)} disabled={pendingOrders.length === 0}>
          <Package className="mr-2 h-4 w-4" />
          Receive Stock
        </Button>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardHeader><CardTitle>Supplier Orders</CardTitle></CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="data-table">
                  <table className="w-full">
                    <thead>
                      <tr><th>Date</th><th>Supplier</th><th>Warehouse</th><th>Items</th><th>Status</th><th>Actions</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        const supplier = mockSuppliers.find(s => s.id === order.supplierId);
                        const wh = mockWarehouses.find(w => w.id === order.warehouseId);
                        return (
                          <tr key={order.id}>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="font-medium">{supplier?.name || '-'}</td>
                            <td>{wh?.name || '-'}</td>
                            <td>{order.items.length} medicines</td>
                            <td><Badge className={statusColors[order.status]}>{order.status}</Badge></td>
                            <td><Button size="sm" variant="ghost" onClick={() => setSelectedOrder(order)}><Eye className="h-4 w-4" /></Button></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly">
          <div className="space-y-4">
            {Object.entries(ordersByMonth).map(([month, monthOrders]) => (
              <Card key={month}>
                <CardHeader className="py-3">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base">{month}</CardTitle>
                    <Badge variant="secondary">{monthOrders.length} orders</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {monthOrders.map(order => {
                      const supplier = mockSuppliers.find(s => s.id === order.supplierId);
                      return (
                        <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => setSelectedOrder(order)}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{supplier?.name}</span>
                            <span className="text-xs text-muted-foreground">({order.items.length} items)</span>
                          </div>
                          <Badge className={statusColors[order.status]}>{order.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {selectedOrder && (() => {
            const supplier = mockSuppliers.find(s => s.id === selectedOrder.supplierId);
            const wh = mockWarehouses.find(w => w.id === selectedOrder.warehouseId);
            return (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Supplier:</span> {supplier?.name}</div>
                  <div><span className="text-muted-foreground">Warehouse:</span> {wh?.name}</div>
                  <div><span className="text-muted-foreground">Date:</span> {new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge></div>
                </div>
                <div className="border rounded-lg">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Medicine</th><th className="p-2">Requested</th><th className="p-2">Received</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map((item, i) => {
                        const med = mockMedicines.find(m => m.id === item.medicineId);
                        return (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-2">{med?.name || '-'}</td>
                            <td className="p-2 text-center">{item.requestedQty}</td>
                            <td className="p-2 text-center">{item.receivedQty ?? '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {selectedOrder.receivedAt && (
                  <p className="text-xs text-muted-foreground">Received on: {new Date(selectedOrder.receivedAt).toLocaleDateString()}</p>
                )}
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Request Stock Dialog */}
      <Dialog open={showRequestStock} onOpenChange={setShowRequestStock}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Request Stock from Supplier</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Supplier</Label>
                <Select value={reqSupplierId} onValueChange={v => { setReqSupplierId(v); setReqItems([]); }}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {mockSuppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Destination Warehouse</Label>
                <Select value={reqWarehouseId} onValueChange={setReqWarehouseId}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {reqSupplierId && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label>Medicines</Label>
                  <Button size="sm" variant="outline" onClick={addReqItem}><Plus className="mr-1 h-3 w-3" /> Add</Button>
                </div>
                {reqItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">Add medicines to request.</p>
                ) : (
                  <div className="space-y-2">
                    {reqItems.map((item, idx) => {
                      const currentQty = getWarehouseStock(item.medicineId);
                      return (
                        <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                          <Select value={item.medicineId} onValueChange={v => { const u = [...reqItems]; u[idx].medicineId = v; setReqItems(u); }}>
                            <SelectTrigger className="flex-1"><SelectValue placeholder="Select medicine" /></SelectTrigger>
                            <SelectContent>
                              {supplierMedicinesList(reqSupplierId).map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          {item.medicineId && <span className="text-xs text-muted-foreground whitespace-nowrap">Current: {currentQty}</span>}
                          <Input type="number" placeholder="Qty" className="w-24" value={item.requestedQty || ''} onChange={e => { const u = [...reqItems]; u[idx].requestedQty = Number(e.target.value); setReqItems(u); }} />
                          <Button size="sm" variant="ghost" className="text-destructive" onClick={() => setReqItems(reqItems.filter((_, i) => i !== idx))}>×</Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestStock(false)}>Cancel</Button>
            <Button onClick={handleSendRequest} disabled={!reqSupplierId || !reqWarehouseId || reqItems.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Receive Stock Dialog */}
      <Dialog open={showReceiveStock} onOpenChange={setShowReceiveStock}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Receive Stock</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Select Order to Receive</Label>
              <Select value={receiveOrder?.id || ''} onValueChange={v => {
                const order = pendingOrders.find(o => o.id === v);
                setReceiveOrder(order || null);
                if (order) {
                  const qtys: Record<string, number> = {};
                  order.items.forEach(i => { qtys[i.medicineId] = i.requestedQty; });
                  setReceiveQtys(qtys);
                }
              }}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select pending order" /></SelectTrigger>
                <SelectContent>
                  {pendingOrders.map(o => {
                    const supplier = mockSuppliers.find(s => s.id === o.supplierId);
                    return <SelectItem key={o.id} value={o.id}>{supplier?.name} - {new Date(o.createdAt).toLocaleDateString()}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {receiveOrder && (
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Medicine</th><th className="p-2">Existing Qty</th><th className="p-2">New Qty</th></tr></thead>
                  <tbody>
                    {receiveOrder.items.map((item, i) => {
                      const med = mockMedicines.find(m => m.id === item.medicineId);
                      const existingQty = getWarehouseStock(item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2">{med?.name || '-'}</td>
                          <td className="p-2 text-center">{existingQty}</td>
                          <td className="p-2">
                            <Input
                              type="number" className="w-20 h-8 mx-auto"
                              value={receiveQtys[item.medicineId] || ''}
                              onChange={e => setReceiveQtys({ ...receiveQtys, [item.medicineId]: Number(e.target.value) })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowReceiveStock(false); setReceiveOrder(null); }}>Cancel</Button>
            <Button onClick={handleReceiveStock} disabled={!receiveOrder}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Receipt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
