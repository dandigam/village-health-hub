import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDistributions, useWarehouses, useMedicines } from '@/hooks/useApiData';
import { Eye, History, Package } from 'lucide-react';
import type { StockDistribution } from '@/types';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string }> = {
  pending: { label: 'Pending', dot: 'bg-amber-500 animate-pulse', bg: 'bg-amber-50', text: 'text-amber-700' },
  confirmed: { label: 'Confirmed', dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
  partial: { label: 'Partial', dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
  sent: { label: 'Sent', dot: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700' },
};

export function DistributionHistory() {
  const [selectedDetail, setSelectedDetail] = useState<StockDistribution | null>(null);
  const { data: distributions = [] } = useDistributions();
  const { data: warehouses = [] } = useWarehouses();
  const { data: medicines = [] } = useMedicines();

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">{distributions.length} total</span>
          <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            {distributions.filter(d => d.status === 'sent' || d.status === 'confirmed').length} completed
          </span>
        </div>

        {distributions.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <History className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">No distributions yet</p>
              <p className="text-xs text-muted-foreground">Completed distributions will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="data-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Date</th><th>Client</th><th>Warehouse</th><th>Items</th><th>Status</th><th></th>
                </tr>
              </thead>
              <tbody>
                {distributions.map(dist => {
                  const wh = warehouses.find(w => w.id === dist.warehouseId);
                  const cfg = statusConfig[dist.status];
                  return (
                    <tr key={dist.id} className="cursor-pointer" onClick={() => setSelectedDetail(dist)}>
                      <td className="text-xs">{new Date(dist.createdAt).toLocaleDateString()}</td>
                      <td className="font-medium">{dist.clientName}</td>
                      <td>{wh?.name || '-'}</td>
                      <td>{dist.items.length} medicines</td>
                      <td>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg?.bg} ${cfg?.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                          {cfg?.label || dist.status}
                        </span>
                      </td>
                      <td><Button size="icon" variant="ghost" className="h-7 w-7"><Eye className="h-3.5 w-3.5" /></Button></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Package className="h-4 w-4 text-primary" />Distribution to {selectedDetail?.clientName}</DialogTitle></DialogHeader>
          {selectedDetail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-muted/40">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Date</p>
                  <p className="text-sm font-semibold">{new Date(selectedDetail.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-muted/40">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-0.5">Status</p>
                  {(() => {
                    const cfg = statusConfig[selectedDetail.status];
                    return (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg?.bg} ${cfg?.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot}`} />
                        {cfg?.label || selectedDetail.status}
                      </span>
                    );
                  })()}
                </div>
              </div>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30"><th className="p-2.5 text-left text-xs font-medium text-muted-foreground">Medicine</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Requested</th><th className="p-2.5 text-center text-xs font-medium text-muted-foreground">Sent</th></tr></thead>
                  <tbody>
                    {selectedDetail.items.map((item, i) => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2.5 font-medium">{med?.name || '-'}</td>
                          <td className="p-2.5 text-center">{item.requestedQty}</td>
                          <td className="p-2.5 text-center">
                            <span className={item.sentQty < item.requestedQty ? 'text-orange-600 font-semibold' : 'text-emerald-600 font-semibold'}>{item.sentQty}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {selectedDetail.notes && (
                <div className="p-2.5 rounded-lg bg-muted/30 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Notes:</span> {selectedDetail.notes}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
