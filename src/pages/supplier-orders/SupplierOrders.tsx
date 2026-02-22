import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Eye, Pencil, Clock, Info, Save, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupplierOrders, useWarehouseInventory, useSupplierList } from '@/hooks/useApiData';
import { toast } from '@/hooks/use-toast';
import type { SupplierOrder } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/services/api';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 border-gray-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  sent: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  received: 'bg-green-100 text-green-700 border-green-200',
};

export default function SupplierOrders() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.wareHouse?.id ? Number(authUser.wareHouse.id) : undefined;
  const { data: supplierOrders = [], refetch: refetchOrders } = useSupplierOrders(warehouseId);
  const { data: suppliers = [], refetch: refetchSuppliers } = useSupplierList(warehouseId);
  const { data: warehouseInventory = [], refetch: refetchInventory } = useWarehouseInventory(warehouseId);
  const [subTab, setSubTab] = useState('orders');
  const [showRequestStock, setShowRequestStock] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [editOrder, setEditOrder] = useState<SupplierOrder | null>(null);
  const [editQtys, setEditQtys] = useState<Record<string, number>>({});
  const [editDraftOrder, setEditDraftOrder] = useState<any | null>(null);
  const [draftItems, setDraftItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);
  const [originalDraftItems, setOriginalDraftItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);
  const [loadingDraft, setLoadingDraft] = useState(false);
  const [cancelOrderId, setCancelOrderId] = useState<number | string | null>(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<number, number>>({});

  const [reqSupplierId, setReqSupplierId] = useState('');
  const [reqItems, setReqItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);

  // Fetch order details when clicking view
  const handleViewOrder = async (orderId: number | string) => {
    setLoadingOrder(true);
    setReceivedQtys({});
    try {
      const response = await api.get(`/supplier-orders/${orderId}`, null);
      if (response.data) {
        setSelectedOrder(response.data);
        // Initialize received quantities with existing values or 0
        const qtys: Record<number, number> = {};
        response.data.items?.forEach((item: any) => {
          qtys[item.id] = item.receivedQuantity ?? 0;
        });
        setReceivedQtys(qtys);
      } else {
        toast({ title: 'Error', description: 'Order not found', variant: 'destructive' });
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to fetch order details', variant: 'destructive' });
    } finally {
      setLoadingOrder(false);
    }
  };

  // Handle receiving stock for PENDING orders
  const handleReceiveStock = async () => {
    if (!selectedOrder?.id) return;
    
    // Validate received qty doesn't exceed requested qty
    const overReceivedItems = selectedOrder.items?.filter((item: any) => {
      const receivedQty = receivedQtys[item.id] || 0;
      const requestedQty = item.requestedQuantity || 0;
      return receivedQty > requestedQty;
    });
    
    if (overReceivedItems && overReceivedItems.length > 0) {
      const itemNames = overReceivedItems.map((i: any) => i.medicineName).join(', ');
      toast({ 
        title: 'Invalid Quantity', 
        description: `Received quantity cannot exceed requested quantity for: ${itemNames}`, 
        variant: 'destructive' 
      });
      return;
    }
    
    // Build items with received quantities > 0
    const items = selectedOrder.items
      ?.filter((item: any) => receivedQtys[item.id] > 0)
      .map((item: any) => ({
        id: item.id,
        receivedQuantity: receivedQtys[item.id] || 0
      }));
    
    if (!items || items.length === 0) {
      toast({ title: 'Error', description: 'Enter received quantity for at least one item.', variant: 'destructive' });
      return;
    }
    
    // Determine status: RECEIVED if all items fully received, PARTIAL otherwise
    let isFullyReceived = true;
    selectedOrder.items?.forEach((item: any) => {
      const receivedQty = receivedQtys[item.id] || 0;
      const requestedQty = item.requestedQuantity || 0;
      if (receivedQty < requestedQty) {
        isFullyReceived = false;
      }
    });
    
    const status = isFullyReceived ? 'RECEIVED' : 'PARTIAL';
    
    try {
      await api.put(`/supplier-orders/${selectedOrder.id}`, { items, status });
      toast({ 
        title: status === 'RECEIVED' ? 'Stock Received' : 'Partially Received', 
        description: status === 'RECEIVED' 
          ? 'All items have been fully received.' 
          : 'Some items were partially received.' 
      });
      setSelectedOrder(null);
      setReceivedQtys({});
      if (typeof refetchOrders === 'function') refetchOrders();
      if (typeof refetchInventory === 'function') refetchInventory();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update received quantities', variant: 'destructive' });
    }
  };

  // Handle edit click - for DRAFT orders, open special edit dialog
  const handleEditClick = async (order: any) => {
    if (order.status?.toUpperCase() === 'DRAFT') {
      setLoadingDraft(true);
      try {
        const response = await api.get(`/supplier-orders/${order.id}`, null);
        if (response.data) {
          const orderData = response.data;
          setEditDraftOrder(orderData);
          
          // Get all supplier medicines
          const supplier = suppliers.find(s => String(s.id) === String(orderData.supplierId));
          const allMeds = supplier?.medicines ?? [];
          
          // Track original items from the order (what's already in DB)
          const originalItems: { medicineId: string; requestedQty: number }[] = [];
          orderData.items?.forEach((item: any) => {
            originalItems.push({ medicineId: String(item.medicineId), requestedQty: item.requestedQuantity || 0 });
          });
          setOriginalDraftItems(originalItems);
          
          // Initialize items with existing order items and remaining medicines
          const existingMedIds = new Set(orderData.items?.map((i: any) => String(i.medicineId)) || []);
          const items: { medicineId: string; requestedQty: number }[] = [];
          
          // Add existing order items first
          orderData.items?.forEach((item: any) => {
            items.push({ medicineId: String(item.medicineId), requestedQty: item.requestedQuantity || 0 });
          });
          
          // Add remaining supplier medicines with 0 qty
          allMeds.forEach(med => {
            if (!existingMedIds.has(String(med.id))) {
              items.push({ medicineId: String(med.id), requestedQty: 0 });
            }
          });
          
          setDraftItems(items);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to fetch draft details', variant: 'destructive' });
      } finally {
        setLoadingDraft(false);
      }
    } else {
      // Non-draft orders - fetch full details from API
      setEditOrder({ id: order.id, loading: true } as any); // Open dialog with loading state
      try {
        const response = await api.get(`/supplier-orders/${order.id}`, null);
        if (response.data) {
          setEditOrder(response.data);
          const qtys: Record<string, number> = {};
          response.data.items?.forEach((i: any) => { 
            qtys[i.medicineId] = i.receivedQuantity ?? i.requestedQuantity ?? 0; 
          });
          setEditQtys(qtys);
        }
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to fetch order details', variant: 'destructive' });
        setEditOrder(null);
      }
    }
  };

  // Cancel/Delete draft order
  const handleCancelDraft = async () => {
    if (!editDraftOrder?.id) return;
    try {
      await api.delete(`/supplier-orders/${editDraftOrder.id}`);
      toast({ title: 'Draft Cancelled', description: 'The draft order has been cancelled.' });
      setEditDraftOrder(null);
      setDraftItems([]);
      setOriginalDraftItems([]);
      if (typeof refetchOrders === 'function') refetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel draft', variant: 'destructive' });
    }
  };

  // Cancel order from list (for DRAFT/PENDING)
  const handleCancelOrder = async () => {
    if (!cancelOrderId) return;
    try {
      await api.delete(`/supplier-orders/${cancelOrderId}`);
      toast({ title: 'Order Cancelled', description: 'The order has been cancelled.' });
      setCancelOrderId(null);
      if (typeof refetchOrders === 'function') refetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to cancel order', variant: 'destructive' });
    }
  };

  // Update draft order with new status
  const handleUpdateDraft = async (newStatus: 'DRAFT' | 'PENDING') => {
    if (!editDraftOrder?.id) return;
    
    // Get all items with qty > 0
    const validItems = draftItems.filter(i => i.requestedQty > 0);
    
    // Check if there are any items with qty > 0
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' });
      return;
    }
    
    let itemsToSend = validItems;
    
    // For DRAFT status only - check for changes
    if (newStatus === 'DRAFT') {
      // Build map of original quantities for comparison
      const originalQtyMap = new Map(originalDraftItems.map(i => [i.medicineId, i.requestedQty]));
      
      // Filter items to send:
      // 1. Items with qty > 0 that are NEW (not in original) or CHANGED from original
      // 2. Items that originally had qty > 0 but now have 0 (to indicate removal)
      itemsToSend = draftItems.filter(item => {
        const originalQty = originalQtyMap.get(item.medicineId);
        
        if (item.requestedQty > 0) {
          // Has qty now - send if new or changed
          return originalQty === undefined || originalQty !== item.requestedQty;
        } else {
          // Qty is 0 now - only send if original had qty > 0 (removing from order)
          return originalQty !== undefined && originalQty > 0;
        }
      });
      
      if (itemsToSend.length === 0) {
        toast({ title: 'No Changes', description: 'No changes detected to save.', variant: 'default' });
        return;
      }
    }
    
    try {
      const payload = {
        warehouseId,
        supplierId: Number(editDraftOrder.supplierId),
        status: newStatus,
        items: itemsToSend.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      await api.put(`/supplier-orders/${editDraftOrder.id}`, payload);
      toast({ 
        title: newStatus === 'PENDING' ? 'Request Sent' : 'Draft Updated', 
        description: newStatus === 'PENDING' ? `Stock request sent to ${editDraftOrder.supplierName}.` : 'Draft has been updated.' 
      });
      setEditDraftOrder(null);
      setDraftItems([]);
      setOriginalDraftItems([]);
      setShowSendConfirm(false);
      if (typeof refetchOrders === 'function') refetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update order', variant: 'destructive' });
    }
  };

  // Always fetch fresh data when page loads (on mount or navigation)
  useEffect(() => {
    if (typeof refetchSuppliers === 'function') refetchSuppliers();
    if (typeof refetchOrders === 'function') refetchOrders();
    if (typeof refetchInventory === 'function') refetchInventory();
  }, []);

  // Sort orders by date descending (newest first)
  const orders = [...supplierOrders].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getWarehouseStock = (medicineId: string | number) => {
    const item = warehouseInventory.find(inv => String(inv.medicineId) === String(medicineId));
    return item?.totalQty || 0;
  };

  // Get medicines for a supplier from suppliers.medicines
  const supplierMedicinesList = (supplierId: string | number) => {
    const supplier = suppliers.find(s => String(s.id) === String(supplierId));
    return supplier?.medicines ?? [];
  };

  // Auto-load medicines when supplier is selected
  useEffect(() => {
    if (reqSupplierId) {
      const meds = supplierMedicinesList(reqSupplierId);
      setReqItems(meds.map(m => ({ medicineId: String(m.id), requestedQty: 0 })));
    } else {
      setReqItems([]);
    }
  }, [reqSupplierId, suppliers]);

  const handleSendRequest = async () => {
    const validItems = reqItems.filter(i => i.requestedQty > 0);
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        warehouseId,
        supplierId: Number(reqSupplierId),
        status: 'PENDING',
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      await api.post('/supplier-orders', payload);
      const supplier = suppliers.find(s => String(s.id) === String(reqSupplierId));
      toast({ title: 'Request Sent', description: `Stock request sent to ${supplier?.name}.` });
      setShowRequestStock(false);
      setReqSupplierId('');
      setReqItems([]);
      if (typeof refetchOrders === 'function') refetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to send request', variant: 'destructive' });
    }
  };

  const handleSaveDraft = async () => {
    const validItems = reqItems.filter(i => i.requestedQty > 0);
    if (validItems.length === 0) {
      toast({ title: 'Error', description: 'Enter quantity for at least one medicine.', variant: 'destructive' });
      return;
    }
    try {
      const payload = {
        warehouseId,
        supplierId: Number(reqSupplierId),
        status: 'DRAFT',
        items: validItems.map(i => ({ medicineId: Number(i.medicineId), requestedQuantity: i.requestedQty }))
      };
      await api.post('/supplier-orders', payload);
      const supplier = suppliers.find(s => String(s.id) === String(reqSupplierId));
      toast({ title: 'Draft Saved', description: `Stock request draft saved for ${supplier?.name}.` });
      setShowRequestStock(false);
      setReqSupplierId('');
      setReqItems([]);
      if (typeof refetchOrders === 'function') refetchOrders();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save draft', variant: 'destructive' });
    }
  };

  const handleEditSave = async () => {
    if (!editOrder) return;
    
    // Validate received qty doesn't exceed requested qty
    const overReceivedItems = editOrder.items?.filter((item: any) => {
      const receivedQty = editQtys[item.medicineId] || 0;
      const requestedQty = item.requestedQuantity || 0;
      return receivedQty > requestedQty;
    });
    
    if (overReceivedItems && overReceivedItems.length > 0) {
      const itemNames = overReceivedItems.map((i: any) => i.medicineName).join(', ');
      toast({ 
        title: 'Invalid Quantity', 
        description: `Received quantity cannot exceed requested quantity for: ${itemNames}`, 
        variant: 'destructive' 
      });
      return;
    }
    
    // Build items with received quantities
    const items = editOrder.items
      ?.filter((item: any) => editQtys[item.medicineId] > 0)
      .map((item: any) => ({
        id: item.id,
        receivedQuantity: editQtys[item.medicineId] || 0
      }));
    
    if (!items || items.length === 0) {
      toast({ title: 'Error', description: 'Enter received quantity for at least one item.', variant: 'destructive' });
      return;
    }
    
    // Determine status: RECEIVED if all items fully received, PARTIAL otherwise
    let isFullyReceived = true;
    editOrder.items?.forEach((item: any) => {
      const receivedQty = editQtys[item.medicineId] || 0;
      const requestedQty = item.requestedQuantity || 0;
      if (receivedQty < requestedQty) {
        isFullyReceived = false;
      }
    });
    
    const status = isFullyReceived ? 'RECEIVED' : 'PARTIAL';
    
    try {
      await api.put(`/supplier-orders/${editOrder.id}`, { items, status });
      toast({ 
        title: status === 'RECEIVED' ? 'Stock Received' : 'Partially Received', 
        description: status === 'RECEIVED' 
          ? 'All items have been fully received.' 
          : 'Some items were partially received.' 
      });
      setEditOrder(null);
      setEditQtys({});
      if (typeof refetchOrders === 'function') refetchOrders();
      if (typeof refetchInventory === 'function') refetchInventory();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update received quantities', variant: 'destructive' });
    }
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
        <Button onClick={() => { setReqSupplierId(''); setReqItems([]); setShowRequestStock(true); }}>
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
                      <tr><th>Date</th><th>Supplier</th><th>Items</th><th>Status</th><th className="text-center w-28">Actions</th></tr>
                    </thead>
                    <tbody>
                      {orders.map(order => {
                        return (
                          <tr key={order.id}>
                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="font-medium">{order.supplierName || '-'}</td>
                            <td>{order.items?.length || 0} medicines</td>
                            <td><Badge className={statusColors[order.status?.toLowerCase()]}>{order.status}</Badge></td>
                            <td className="text-center w-28">
                              <div className="flex items-center justify-center gap-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleViewOrder(order.id)}>
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {(order.status?.toUpperCase() === 'DRAFT' || order.status?.toUpperCase() === 'PENDING') && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEditClick(order)}>
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                )}
                                {(order.status?.toUpperCase() === 'DRAFT' || order.status?.toUpperCase() === 'PENDING') && (
                                  <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setCancelOrderId(order.id)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                )}
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
                      return (
                        <div key={order.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer" onClick={() => handleViewOrder(order.id)}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{order.supplierName}</span>
                            <span className="text-xs text-muted-foreground">({order.items?.length || 0} items)</span>
                          </div>
                          <Badge className={statusColors[order.status?.toLowerCase()]}>{order.status}</Badge>
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
      <Dialog open={!!selectedOrder} onOpenChange={() => { setSelectedOrder(null); setReceivedQtys({}); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              {selectedOrder?.status?.toUpperCase() === 'PENDING' 
                ? 'Enter received quantities and mark stock as received.' 
                : 'View the complete order information and item details.'}
            </DialogDescription>
          </DialogHeader>
          {loadingOrder ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          ) : selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Supplier</p>
                  <p className="font-medium">{selectedOrder.supplierName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Status</p>
                  <Badge className={statusColors[selectedOrder.status?.toLowerCase()]}>{selectedOrder.status}</Badge>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Medicine</th>
                      <th className="p-3 text-center">Requested</th>
                      <th className="p-3 text-center">Received</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items?.map((item: any, i: number) => (
                      <tr key={item.id || i} className="border-b last:border-b-0">
                        <td className="p-3 font-medium">{item.medicineName}</td>
                        <td className="p-3 text-center">{item.requestedQuantity}</td>
                        <td className="p-3 text-center">
                          {selectedOrder.status?.toUpperCase() === 'PENDING' ? (
                            <Input 
                              type="number" 
                              min="0"
                              max={item.requestedQuantity}
                              className="w-24 h-8 mx-auto text-center" 
                              value={receivedQtys[item.id] ?? ''} 
                              onChange={e => setReceivedQtys({ ...receivedQtys, [item.id]: Number(e.target.value) })} 
                            />
                          ) : (
                            item.receivedQuantity ?? '-'
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {selectedOrder?.status?.toUpperCase() === 'PENDING' && (
            <DialogFooter>
              <Button variant="outline" onClick={() => { setSelectedOrder(null); setReceivedQtys({}); }}>Cancel</Button>
              <Button onClick={handleReceiveStock}>
                <Save className="mr-2 h-4 w-4" /> Save
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog - For non-draft orders */}
      <Dialog open={!!editOrder} onOpenChange={() => setEditOrder(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Received Quantities</DialogTitle>
            <DialogDescription>Enter the actual quantities received for each medicine.</DialogDescription>
          </DialogHeader>
          {editOrder?.loading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading order details...</p>
            </div>
          ) : editOrder && (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-3 text-left">Medicine</th><th className="p-3 text-center">Requested</th><th className="p-3 text-center">Received</th></tr></thead>
                  <tbody>
                    {editOrder.items?.map((item: any, i: number) => {
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-3 font-medium">{item.medicineName || '-'}</td>
                          <td className="p-3 text-center">{item.requestedQuantity || item.requestedQty}</td>
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
          {!editOrder?.loading && (
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditOrder(null)}>Cancel</Button>
              <Button onClick={handleEditSave}>Save</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Draft Order Dialog */}
      <Dialog open={!!editDraftOrder} onOpenChange={() => { setEditDraftOrder(null); setDraftItems([]); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Draft Order</DialogTitle>
            <DialogDescription>Update requested quantities or add more medicines from the supplier's catalog.</DialogDescription>
          </DialogHeader>
          {loadingDraft ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading draft details...</p>
            </div>
          ) : editDraftOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Supplier</p>
                  <p className="font-medium">{editDraftOrder.supplierName}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">Created</p>
                  <p className="font-medium">{new Date(editDraftOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left">Medicine Name</th>
                      <th className="p-3 text-center">Current Stock</th>
                      <th className="p-3 text-center">Request Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {draftItems.map((item, idx) => {
                      const supplier = suppliers.find(s => String(s.id) === String(editDraftOrder.supplierId));
                      const med = supplier?.medicines?.find(m => String(m.id) === String(item.medicineId));
                      const orderItem = editDraftOrder.items?.find((i: any) => String(i.medicineId) === String(item.medicineId));
                      const currentQty = getWarehouseStock(item.medicineId);
                      return (
                        <tr key={idx} className="border-b last:border-b-0">
                          <td className="p-3 font-medium">{orderItem?.medicineName || med?.name || '-'}</td>
                          <td className="p-3 text-center text-muted-foreground">{currentQty}</td>
                          <td className="p-3 text-center">
                            <Input 
                              type="number" 
                              min="0"
                              className="w-24 h-8 mx-auto text-center" 
                              value={item.requestedQty === 0 ? '0' : (item.requestedQty || '')} 
                              onChange={e => { 
                                const u = [...draftItems]; 
                                u[idx].requestedQty = e.target.value === '' ? 0 : Number(e.target.value); 
                                setDraftItems(u); 
                              }} 
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="destructive" onClick={handleCancelDraft}>Cancel Draft</Button>
            <div className="flex-1" />
            <Button variant="outline" onClick={() => { setEditDraftOrder(null); setDraftItems([]); setOriginalDraftItems([]); }}>Close</Button>
            <Button variant="secondary" onClick={() => handleUpdateDraft('DRAFT')}>Update Draft</Button>
            <Button onClick={() => setShowSendConfirm(true)}>
              <Send className="mr-2 h-4 w-4" /> Send Request
            </Button>
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
                  {suppliers.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
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
                          const supplier = suppliers.find(s => String(s.id) === String(reqSupplierId));
                          const med = supplier?.medicines?.find(m => String(m.id) === String(item.medicineId));
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
            <Button variant="secondary" onClick={handleSaveDraft} disabled={!reqSupplierId || reqItems.every(i => i.requestedQty <= 0)}>
              <Save className="mr-2 h-4 w-4" /> Save Draft
            </Button>
            <Button onClick={handleSendRequest} disabled={!reqSupplierId || reqItems.every(i => i.requestedQty <= 0)}>
              <Send className="mr-2 h-4 w-4" /> Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Confirmation Dialog */}
      <DeleteConfirmDialog
        open={cancelOrderId !== null}
        onOpenChange={(open) => !open && setCancelOrderId(null)}
        onConfirm={handleCancelOrder}
        title="Cancel Order"
        description="Are you sure you want to cancel this order? This action cannot be undone."
      />

      {/* Send Request Confirmation Dialog */}
      <Dialog open={showSendConfirm} onOpenChange={setShowSendConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Send Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to send this request to {editDraftOrder?.supplierName}? 
              This will change the order status from Draft to Pending.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSendConfirm(false)}>Cancel</Button>
            <Button onClick={() => handleUpdateDraft('PENDING')}>
              <Send className="mr-2 h-4 w-4" /> Yes, Send Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
