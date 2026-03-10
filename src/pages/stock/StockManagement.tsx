import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWarehouseInventory, useWarehouseDetail } from '@/hooks/useApiData';
import { InventoryTab } from '@/components/stock/InventoryTab';
import { useAuth } from '@/context/AuthContext';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.context?.warehouseId ? Number(authUser.context.warehouseId) : undefined;
  const { data: inventoryItems = [] } = useWarehouseInventory(warehouseId);
  const { data: warehouseDetail } = useWarehouseDetail(warehouseId);

  const stockItemDetails = inventoryItems.map(item => ({
    id: String(item.id),
    medicineId: String(item.medicineId),
    medicineName: item.medicineName,
    medicineType: item.medicineType,
    quantity: item.totalQty,
    minimumQty: item.minimumQty,
    isLowStock: item.totalQty < (item.minimumQty || MIN_STOCK_LEVEL),
  }));

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Medicine Inventory</h1>
      </div>
      <InventoryTab stockItems={stockItemDetails} warehouseInfo={warehouseDetail} />
    </DashboardLayout>
  );
}
