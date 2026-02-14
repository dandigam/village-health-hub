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
  const [activeTab, setActiveTab] = useState('inventory');
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="page-header flex items-center gap-4 flex-wrap">
          <h1 className="page-title">Stock</h1>
          <TabsList className="bg-transparent p-0 h-auto rounded-none border-none">
            <TabsTrigger value="inventory" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Inventory</TabsTrigger>
            <TabsTrigger value="warehouse" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Warehouses</TabsTrigger>
            <TabsTrigger value="distribution" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Distribution</TabsTrigger>
            <TabsTrigger value="orders" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none">Supplier Orders</TabsTrigger>
          </TabsList>
          <div className="flex gap-2 flex-wrap ml-auto">
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
        <div className="mt-6">
          <TabsContent value="inventory">
            <InventoryTab stockItems={stockItems} />
          </TabsContent>

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
        </div>
      </Tabs>
    </DashboardLayout>
  );
}
