import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMedicines, mockStockItems, mockSuppliers } from '@/data/mockData';
import { WarehouseTab } from '@/components/stock/WarehouseTab';
import { StockDistributionTab } from '@/components/stock/StockDistributionTab';
import { SupplierOrdersTab } from '@/components/stock/SupplierOrdersTab';
import { InventoryTab } from '@/components/stock/InventoryTab';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const [activeTab, setActiveTab] = useState('warehouse');
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);

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

  return (
    <DashboardLayout>
      <div className="page-header flex items-center justify-between flex-wrap gap-4">
        <h1 className="page-title">Stock</h1>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => setShowAddSupplier(true)}>
            <Truck className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => setShowCreateWarehouse(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Warehouse
          </Button>
        </div>
      </div>

      {/* Inventory always visible */}
      <InventoryTab stockItems={stockItems} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="warehouse">Warehouses</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="orders">Supplier Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse">
          <WarehouseTab
            showAddSupplier={showAddSupplier}
            setShowAddSupplier={setShowAddSupplier}
            showCreateWarehouse={showCreateWarehouse}
            setShowCreateWarehouse={setShowCreateWarehouse}
          />
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
