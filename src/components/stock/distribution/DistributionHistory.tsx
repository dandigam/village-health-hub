import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDistributions, useWarehouses, useMedicines } from '@/hooks/useApiData';
import type { StockDistribution } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  sent: 'bg-green-100 text-green-700 border-green-200',
};

export function DistributionHistory() {
  const [selectedDetail, setSelectedDetail] = useState<StockDistribution | null>(null);
  const { data: distributions = [] } = useDistributions();
  const { data: warehouses = [] } = useWarehouses();
  const { data: medicines = [] } = useMedicines();

  return (
    <>
      <Card>
        <CardHeader><CardTitle className="text-lg">Distribution History</CardTitle></CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No distributions yet.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-muted/50"><th className="text-left p-3 font-medium">Date</th><th className="text-left p-3 font-medium">Client</th><th className="text-left p-3 font-medium">Warehouse</th><th className="text-center p-3 font-medium">Items</th><th className="text-center p-3 font-medium">Status</th><th className="text-center p-3 font-medium">Actions</th></tr></thead>
                <tbody>
                  {distributions.map(dist => {
                    const wh = warehouses.find(w => w.id === dist.warehouseId);
                    return (
                      <tr key={dist.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">{new Date(dist.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 font-medium">{dist.clientName}</td>
                        <td className="p-3">{wh?.name || '-'}</td>
                        <td className="p-3 text-center">{dist.items.length} medicines</td>
                        <td className="p-3 text-center"><Badge className={statusColors[dist.status]}>{dist.status}</Badge></td>
                        <td className="p-3 text-center"><Button size="sm" variant="ghost" onClick={() => setSelectedDetail(dist)}>View</Button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Distribution to {selectedDetail?.clientName}</DialogTitle></DialogHeader>
          {selectedDetail && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-muted-foreground">Date:</span> {new Date(selectedDetail.createdAt).toLocaleDateString()}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[selectedDetail.status]}>{selectedDetail.status}</Badge></div>
              </div>
              <div className="border rounded-lg overflow-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Medicine</th><th className="p-2 text-center">Requested</th><th className="p-2 text-center">Sent</th></tr></thead>
                  <tbody>
                    {selectedDetail.items.map((item, i) => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      return (<tr key={i} className="border-b last:border-b-0"><td className="p-2">{med?.name || '-'}</td><td className="p-2 text-center">{item.requestedQty}</td><td className="p-2 text-center"><span className={item.sentQty < item.requestedQty ? 'text-orange-600 font-semibold' : ''}>{item.sentQty}</span></td></tr>);
                    })}
                  </tbody>
                </table>
              </div>
              {selectedDetail.notes && <p className="text-sm text-muted-foreground">Notes: {selectedDetail.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
