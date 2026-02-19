import { Badge } from '@/components/ui/badge';

interface StockItemDetail {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineType?: string;
  quantity: number;
  minimumQty?: number;
  isLowStock: boolean;
}

interface InventoryTabProps {
  stockItems: StockItemDetail[];
}

export function InventoryTab({ stockItems }: InventoryTabProps) {
  return (
    <div className="data-table">
      <table className="w-full">
        <thead>
          <tr>
            <th>Medicine Name</th>
            <th>Current Qty</th>
           <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {stockItems.map((item) => (
            <tr key={item.id}>
              <td className="font-medium">{item.medicineName}</td>
              <td>{item.quantity}</td>
              <td>
                {item.isLowStock ? (
                  <Badge className="bg-red-100 text-red-700 border-red-200">Low Stock</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-700 border-green-200">In Stock</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
