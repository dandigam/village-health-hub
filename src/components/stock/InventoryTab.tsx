import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StockItemDetail {
  id: string;
  medicineId: string;
  campId: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  purchaseDate: string;
  supplierId: string;
  medicineName: string;
  medicineCode: string;
  category: string;
  supplierName: string;
  isLowStock: boolean;
}

interface InventoryTabProps {
  stockItems: StockItemDetail[];
}

export function InventoryTab({ stockItems }: InventoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Medicine Inventory</CardTitle>
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
      </CardContent>
    </Card>
  );
}
