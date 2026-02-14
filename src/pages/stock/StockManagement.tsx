import { useState } from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMedicines, mockStockItems, mockSuppliers } from '@/data/mockData';
import { WarehouseTab } from '@/components/stock/WarehouseTab';
import { StockDistributionTab } from '@/components/stock/StockDistributionTab';
import { SupplierOrdersTab } from '@/components/stock/SupplierOrdersTab';
import { InventoryTab } from '@/components/stock/InventoryTab';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState('warehouse');

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
        <h1 className="page-title">Warehouse & Stock Management</h1>
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
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="warehouse">Warehouses</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="orders">Supplier Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse">
          <WarehouseTab />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryTab stockItems={stockItems} />
        </TabsContent>

        <TabsContent value="distribution">
          <StockDistributionTab />
        </TabsContent>

        <TabsContent value="orders">
          <SupplierOrdersTab />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
