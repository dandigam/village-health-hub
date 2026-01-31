import { Plus, AlertTriangle, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const mockStock = [
  { id: '1', name: 'T.RABI 20 MG', code: '258410', quantity: 500, minLevel: 100, status: 'ok' },
  { id: '2', name: 'A.BENZ 10 MG', code: '258411', quantity: 45, minLevel: 100, status: 'low' },
  { id: '3', name: 'C.CALCIUM 500 MG', code: '258412', quantity: 200, minLevel: 50, status: 'ok' },
  { id: '4', name: 'D.DOSTINEX 0.5 MG', code: '258413', quantity: 20, minLevel: 50, status: 'low' },
  { id: '5', name: 'E.ERGO 250 MG', code: '258414', quantity: 150, minLevel: 100, status: 'ok' },
  { id: '6', name: 'F.FERROUS 100 MG', code: '258415', quantity: 300, minLevel: 100, status: 'ok' },
];

export default function Stock() {
  const lowStockItems = mockStock.filter((item) => item.status === 'low');

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">Stock Management</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <Package className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
          <Button className="bg-accent hover:bg-accent/90">
            <Plus className="mr-2 h-4 w-4" />
            Purchase Medicine
          </Button>
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
                  {lowStockItems.length} items are running low on stock
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="inventory">
        <TabsList className="mb-6">
          <TabsTrigger value="inventory">Current Inventory</TabsTrigger>
          <TabsTrigger value="purchases">Purchase Orders</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
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
                      <th>Current Qty</th>
                      <th>Min Level</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockStock.map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium">{item.name}</td>
                        <td className="font-mono text-sm">{item.code}</td>
                        <td>{item.quantity}</td>
                        <td>{item.minLevel}</td>
                        <td>
                          {item.status === 'low' ? (
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
              <p className="text-muted-foreground">Purchase order history will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Supplier management will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
