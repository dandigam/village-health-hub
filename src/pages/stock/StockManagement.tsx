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
  const [activeTab, setActiveTab] = useState('inventory');

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

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="warehouse">Warehouses</TabsTrigger>
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
