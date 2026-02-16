import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Pencil, Clock, Info } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupplierOrders, useSuppliers, useMedicines, useStockItems, useSupplierMedicines } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { SupplierOrder } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  received: 'bg-green-100 text-green-700 border-green-200',
};

export default function SupplierOrders() {
  const navigate = useNavigate();
  const { data: supplierOrders = [] } = useSupplierOrders();
  const { data: suppliers = [] } = useSuppliers();
  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  const { data: supplierMedicines = [] } = useSupplierMedicines();
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [subTab, setSubTab] = useState('orders');
  const [showRequestStock, setShowRequestStock] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrder | null>(null);
  const [editOrder, setEditOrder] = useState<SupplierOrder | null>(null);
  const [editQtys, setEditQtys] = useState<Record<string, number>>({});

  const [reqSupplierId, setReqSupplierId] = useState('');
  const [reqItems, setReqItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);

  useEffect(() => {
    if (supplierOrders.length > 0 && orders.length === 0) setOrders(supplierOrders);
  }, [supplierOrders]);

  const getWarehouseStock = (medicineId: string) => stockItems.find(s => s.medicineId === medicineId)?.quantity || 0;

  const supplierMedicinesList = (supplierId: string) => {
    const medIds = supplierMedicines.filter(sm => sm.supplierId === supplierId).map(sm => sm.medicineId);
    return medicines.filter(m => medIds.includes(m.id));
  };

  // Auto-load medicines when supplier is selected
  useEffect(() => {
    if (reqSupplierId) {
      const meds = supplierMedicinesList(reqSupplierId);
      setReqItems(meds.map(m => ({ medicineId: m.id, requestedQty: 0 })));
    } else {
      setReqItems([]);
    }
  }, [reqSupplierId]);

  const handleSendRequest = () => {
    const validItems = reqItems.filter(i => i.requestedQty > 0);
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' });
      return;
    }
    const now = new Date().toISOString();
    const newOrder: SupplierOrder = {
      id: String(orders.length + 1),
      supplierId: reqSupplierId,
      warehouseId: '',
      items: validItems.map(i => ({ medicineId: i.medicineId, requestedQty: i.requestedQty })),
      status: 'sent',
      createdAt: now,
      updatedAt: now,
    };
    setOrders([newOrder, ...orders]);
    const supplier = suppliers.find(s => s.id === reqSupplierId);
    toast({ title: 'Request Sent', description: `Stock request sent to ${supplier?.name}.` });
    setShowRequestStock(false);
    setReqSupplierId('');
    setReqItems([]);
  };

  const handleEditSave = () => {
    if (!editOrder) return;
    const updated = orders.map(o => {
      if (o.id !== editOrder.id) return o;
      return {
        ...o,
        items: o.items.map(item => ({
          ...item,
          receivedQty: editQtys[item.medicineId] ?? item.receivedQty ?? 0,
        })),
        status: 'partial' as const,
        updatedAt: new Date().toISOString(),
      };
    });
    setOrders(updated);
    toast({ title: 'Order Updated', description: 'Received quantities updated.' });
    setEditOrder(null);
    setEditQtys({});
  };

  const ordersByMonth: Record<string, SupplierOrder[]> = {};
  orders.forEach(o => {
    const month = new Date(o.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
    if (!ordersByMonth[month]) ordersByMonth[month] = [];
    ordersByMonth[month].push(o);
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Supplier Orders</h1>
        <Button onClick={() => setShowRequestStock(true)}>
          <Send className="mr-2 h-4 w-4" /> Request Stock
        </Button>
      </div>

      <Tabs value={subTab} onValueChange={setSubTab}>
        <TabsList>
          <TabsTrigger value="orders">All Orders</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <Card>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No orders yet.</p>
              ) : (
                <div className="data-table">
                  <table className="w-full">
                    <thead>
                      <tr><th>Date</th><th>Supplier</th><th>Items</th><th>Status</th><th className="text-center">Actions</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        const supplier = suppliers.find(s => s.id === order.supplierId);
                        return (
                          <tr key={order.id}>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="font-medium">{supplier?.name || '-'}</td>
                            <td>{order.items.length} medicines</td>
                            <td><Badge className={statusColors[order.status]}>{order.status}</Badge></td>
                            <td>
                              <div className="flex items-center justify-center gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setSelectedOrder(order)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => {
                                  setEditOrder(order);
                                  const qtys: Record<string, number> = {};
                                  order.items.forEach(i => { qtys[i.medicineId] = i.receivedQty ?? i.requestedQty; });
                                  setEditQtys(qtys);
                                }}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
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
                      const supplier = suppliers.find(s => s.id === order.supplierId);
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

      {/* View Order Dialog - Larger */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>View the complete order information and item details.</DialogDescription>
          </DialogHeader>
          {selectedOrder && (() => {
            const supplier = suppliers.find(s => s.id === selectedOrder.supplierId);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Supplier</p>
                    <p className="font-medium">{supplier?.name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Date</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-xs">Status</p>
                    <Badge className={statusColors[selectedOrder.status]}>{selectedOrder.status}</Badge>
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Medicine</th><th className="p-3 text-center">Requested</th><th className="p-3 text-center">Received</th></tr></thead>
                    <tbody>
                      {selectedOrder.items.map((item, i) => {
                        const med = medicines.find(m => m.id === item.medicineId);
                        return (
                          <tr key={i} className="border-b last:border-b-0">
                            <td className="p-3 font-medium">{med?.name || '-'}</td>
                            <td className="p-3 text-center">{item.requestedQty}</td>
                            <td className="p-3 text-center">{item.receivedQty ?? '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog - Larger */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Received Quantities</DialogTitle>
            <DialogDescription>Enter the actual quantities received for each medicine.</DialogDescription>
          </DialogHeader>
          {editOrder && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Medicine</th><th className="p-3 text-center">Requested</th><th className="p-3 text-center">Received</th></tr></thead>
                  <tbody>
                    {editOrder.items.map((item, i) => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-3 font-medium">{med?.name || '-'}</td>
                          <td className="p-3 text-center">{item.requestedQty}</td>
                          <td className="p-3 text-center">
                            <Input type="number" className="w-24 h-8 mx-auto text-center" value={editQtys[item.medicineId] ?? ''} onChange={e => setEditQtys({ ...editQtys, [item.medicineId]: Number(e.target.value) })} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOrder(null)}>Cancel</Button>
            <Button onClick={handleEditSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Stock Dialog - Auto-loads medicines */}
      <Dialog open={showRequestStock} onOpenChange={setShowRequestStock}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Request Stock from Supplier</DialogTitle>
            <DialogDescription>Select a supplier and enter requested quantities for their medicines.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="link" className="p-0 h-auto text-sm" onClick={() => { setShowRequestStock(false); navigate('/suppliers/new'); }}>
                + Add Supplier
              </Button>
            </div>
            <div>
              <Label>Supplier</Label>
              <Select value={reqSupplierId} onValueChange={setReqSupplierId}>
                <SelectTrigger className="mt-2"><SelectValue placeholder="Select supplier" /></SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {reqSupplierId && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Label>Medicines</Label>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    Auto-loaded from supplier's catalog
                  </div>
                </div>
                {reqItems.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6 border rounded-lg">No medicines assigned to this supplier.</p>
                ) : (
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead><tr className="bg-muted/50 border-b"><th className="p-3 text-left">Medicine Name</th><th className="p-3 text-center">Current Qty</th><th className="p-3 text-center">Request Qty</th></tr></thead>
                      <tbody>
                        {reqItems.map((item, idx) => {
                          const med = medicines.find(m => m.id === item.medicineId);
                          const currentQty = getWarehouseStock(item.medicineId);
                          return (
                            <tr key={idx} className="border-b last:border-b-0">
                              <td className="p-3 font-medium">{med?.name || '-'}</td>
                              <td className="p-3 text-center text-muted-foreground">{currentQty}</td>
                              <td className="p-3 text-center">
                                <Input type="number" className="w-24 h-8 mx-auto text-center" value={item.requestedQty || ''} onChange={e => { const u = [...reqItems]; u[idx].requestedQty = Number(e.target.value); setReqItems(u); }} />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRequestStock(false)}>Cancel</Button>
            <Button onClick={handleSendRequest} disabled={!reqSupplierId || reqItems.every(i => i.requestedQty <= 0)}>
              <Send className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
