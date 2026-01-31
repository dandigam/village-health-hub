import { useState } from 'react';
import { Plus, AlertTriangle, Package, Truck, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockMedicines, mockStockItems, mockSuppliers } from '@/data/mockData';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [showAddStock, setShowAddStock] = useState(false);
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showPurchaseOrder, setShowPurchaseOrder] = useState(false);

  const getStockWithDetails = () => {
    return mockStockItems.map(stock => {
      const medicine = mockMedicines.find(m => m.id === stock.medicineId);
      const supplier = mockSuppliers.find(s => s.id === stock.supplierId);
      return {
        ...stock,
        medicineName: medicine?.name || 'Unknown',
        medicineCode: medicine?.code || '',
        category: medicine?.category || '',
        supplierName: supplier?.name || 'Unknown',
        isLowStock: stock.quantity < MIN_STOCK_LEVEL,
      };
    });
  };

  const stockItems = getStockWithDetails();
  const lowStockItems = stockItems.filter(item => item.isLowStock);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Stock Management</h1>
        <div className="flex gap-2">
          <Dialog open={showAddSupplier} onOpenChange={setShowAddSupplier}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Truck className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Supplier Name</Label>
                  <Input placeholder="Enter supplier name" className="mt-2" />
                </div>
                <div>
                  <Label>Contact Number</Label>
                  <Input placeholder="Enter contact number" className="mt-2" />
                </div>
                <div>
                  <Label>Address</Label>
                  <Input placeholder="Enter address" className="mt-2" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddSupplier(false)}>Cancel</Button>
                <Button onClick={() => setShowAddSupplier(false)}>Add Supplier</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showAddStock} onOpenChange={setShowAddStock}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Package className="mr-2 h-4 w-4" />
                Add Stock
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Stock</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Medicine</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select medicine" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMedicines.map(m => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input type="number" placeholder="Enter quantity" className="mt-2" />
                </div>
                <div>
                  <Label>Batch Number</Label>
                  <Input placeholder="Enter batch number" className="mt-2" />
                </div>
                <div>
                  <Label>Expiry Date</Label>
                  <Input type="date" className="mt-2" />
                </div>
                <div>
                  <Label>Supplier</Label>
                  <Select>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockSuppliers.map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddStock(false)}>Cancel</Button>
                <Button onClick={() => setShowAddStock(false)}>Add Stock</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showPurchaseOrder} onOpenChange={setShowPurchaseOrder}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Purchase Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Purchase Order</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Supplier</Label>
                    <Select>
                      <SelectTrigger className="mt-2">
                        <SelectValue placeholder="Select supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockSuppliers.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Order Date</Label>
                    <Input type="date" className="mt-2" />
                  </div>
                </div>
                <div>
                  <Label>Select Medicines</Label>
                  <div className="mt-2 border rounded-lg max-h-60 overflow-auto">
                    {mockMedicines.map(m => {
                      const stock = mockStockItems.find(s => s.medicineId === m.id);
                      return (
                        <div key={m.id} className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-muted/50">
                          <div>
                            <p className="font-medium">{m.name}</p>
                            <p className="text-sm text-muted-foreground">Current Stock: {stock?.quantity || 0}</p>
                          </div>
                          <Input type="number" placeholder="Qty" className="w-24 h-8" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowPurchaseOrder(false)}>Cancel</Button>
                <Button onClick={() => setShowPurchaseOrder(false)}>Create Order</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-700">
                  {lowStockItems.length} items are running low on stock (below {MIN_STOCK_LEVEL} units)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="reports">Stock Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Medicine Inventory - Bapatla Camp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="data-table">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th>Medicine Name</th>
                      <th>Code</th>
                      <th>Category</th>
                      <th>Current Qty</th>
                      <th>Batch No.</th>
                      <th>Expiry Date</th>
                      <th>Supplier</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockItems.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.medicineName}</td>
                        <td className="font-mono text-sm">{item.medicineCode}</td>
                        <td>{item.category}</td>
                        <td>{item.quantity}</td>
                        <td>{item.batchNumber}</td>
                        <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                        <td>{item.supplierName}</td>
                        <td>
                          {item.isLowStock ? (
                            <Badge className="bg-red-100 text-red-700 border-red-200">
                              Low Stock
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-700 border-green-200">
                              In Stock
                            </Badge>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchases">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No purchase orders yet.</p>
                <Button className="mt-4" onClick={() => setShowPurchaseOrder(true)}>
                  Create First Order
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockSuppliers.map(supplier => (
                  <Card key={supplier.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-full bg-accent/10">
                          <Truck className="h-5 w-5 text-accent" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{supplier.name}</h3>
                          <p className="text-sm text-muted-foreground">{supplier.contact}</p>
                          <p className="text-sm text-muted-foreground">{supplier.address}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Package className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Stock Report</h3>
                    <p className="text-sm text-muted-foreground">Camp-wise stock summary</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <FileText className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Purchase Orders Report</h3>
                    <p className="text-sm text-muted-foreground">Medicine orders history</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-yellow-100">
                    <AlertTriangle className="h-6 w-6 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Low Stock Report</h3>
                    <p className="text-sm text-muted-foreground">Items below minimum level</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100">
                    <Truck className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Supplier Report</h3>
                    <p className="text-sm text-muted-foreground">Supplier-wise purchases</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
