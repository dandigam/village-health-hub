import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useMedicines, useStockItems, useSuppliers } from '@/hooks/useApiData';
import { InventoryTab } from '@/components/stock/InventoryTab';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  const { data: suppliers = [] } = useSuppliers();

  const stockItemDetails = stockItems.map(stock => {
    const medicine = medicines.find(m => m.id === stock.medicineId);
    const supplier = suppliers.find(s => s.id === stock.supplierId);
    return {
      ...stock,
      medicineName: medicine?.name || 'Unknown',
      medicineCode: medicine?.code || '',
      category: medicine?.category || '',
      supplierName: supplier?.name || 'Unknown',
      isLowStock: stock.quantity < MIN_STOCK_LEVEL,
    };
  });

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Medicine Inventory</h1>
      </div>
      <InventoryTab stockItems={stockItemDetails} />
    </DashboardLayout>
  );
}
