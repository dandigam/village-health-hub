import { useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useWarehouseInventory } from '@/hooks/useApiData';
import { InventoryTab } from '@/components/stock/InventoryTab';
import { useAuth } from '@/context/AuthContext';

const MIN_STOCK_LEVEL = 50;

export default function StockManagement() {
  const { user: authUser } = useAuth();
  const warehouseId = authUser?.wareHouse?.id ? Number(authUser.wareHouse.id) : undefined;
  const { data: inventoryItems = [], refetch } = useWarehouseInventory(warehouseId);

  // Refetch data when page loads
  useEffect(() => {
    if (typeof refetch === 'function') refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      <InventoryTab stockItems={stockItemDetails} />
    </DashboardLayout>
  );
}
