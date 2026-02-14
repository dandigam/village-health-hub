import { useState } from 'react';
import { Send, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { mockDistributions, mockMedicines, mockStockItems, mockWarehouses } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { StockDistribution, DistributionItem } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  sent: 'bg-green-100 text-green-700 border-green-200',
};

interface RequestItem {
  medicineId: string;
  medicineName: string;
  requestedQty: number;
  availableQty: number;
  sendQty: number;
}

// Pre-populated requested medicines (simulating a client request)
const getInitialRequestItems = (): RequestItem[] => {
  return mockMedicines.map(med => {
    const stock = mockStockItems.find(s => s.medicineId === med.id);
    const available = stock?.quantity || 0;
    const requested = med.id === '1' ? 100 : med.id === '2' ? 100 : med.id === '3' ? 80 :
      med.id === '4' ? 50 : med.id === '5' ? 100 : med.id === '6' ? 100 :
      med.id === '7' ? 200 : med.id === '8' ? 100 : med.id === '9' ? 150 : 100;
    return {
      medicineId: med.id,
      medicineName: med.name,
      requestedQty: requested,
      availableQty: available,
      sendQty: Math.min(requested, available),
    };
  });
};

export function StockDistributionTab() {
  const [distributions, setDistributions] = useState<StockDistribution[]>(mockDistributions);
  const [requestItems, setRequestItems] = useState<RequestItem[]>(getInitialRequestItems);
  const [showConfirm, setShowConfirm] = useState(false);
  const [clientName, setClientName] = useState('Bapatla Camp');
  const [warehouseId, setWarehouseId] = useState('1');
  const [notes, setNotes] = useState('');
  const [selectedDetail, setSelectedDetail] = useState<StockDistribution | null>(null);

  const updateSendQty = (index: number, value: number) => {
    setRequestItems(prev => prev.map((item, i) => {
      if (i !== index) return item;
      const capped = Math.max(0, Math.min(value, item.availableQty, item.requestedQty));
      return { ...item, sendQty: capped };
    }));
  };

  const totalRequested = requestItems.reduce((sum, i) => sum + i.requestedQty, 0);
  const totalSending = requestItems.reduce((sum, i) => sum + i.sendQty, 0);
  const hasShortage = requestItems.some(i => i.sendQty < i.requestedQty);

  const handleSend = () => {
    const distItems: DistributionItem[] = requestItems.map(item => ({
      medicineId: item.medicineId,
      requestedQty: item.requestedQty,
      sentQty: item.sendQty,
    }));

    const newDist: StockDistribution = {
      id: String(distributions.length + 1),
      warehouseId,
      clientName,
      items: distItems,
      status: hasShortage ? 'partial' : 'sent',
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    setDistributions([newDist, ...distributions]);
    toast({
      title: 'Distribution Sent',
      description: `Stock ${hasShortage ? 'partially ' : ''}sent to ${clientName}.`,
    });
    setShowConfirm(false);
    setRequestItems(getInitialRequestItems());
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Current Request / Fulfillment Table */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Requested Medicines
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Review requested quantities, adjust send amounts based on availability, then confirm.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <span className="text-muted-foreground">Sending</span>{' '}
              <span className="font-semibold">{totalSending}</span>
              <span className="text-muted-foreground"> / {totalRequested} requested</span>
            </div>
            <Button onClick={() => setShowConfirm(true)}>
              <Send className="mr-2 h-4 w-4" />
              Confirm & Send
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium">S.No</th>
                  <th className="text-left p-3 font-medium">Medicine</th>
                  <th className="text-center p-3 font-medium">Requested Qty</th>
                  <th className="text-center p-3 font-medium">Available Stock</th>
                  <th className="text-center p-3 font-medium">Send Qty</th>
                  <th className="text-center p-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {requestItems.map((item, idx) => {
                  const isShort = item.availableQty < item.requestedQty;
                  const isFull = item.sendQty >= item.requestedQty;
                  return (
                    <tr key={item.medicineId} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-muted-foreground">{idx + 1}</td>
                      <td className="p-3 font-medium">{item.medicineName}</td>
                      <td className="p-3 text-center font-semibold">{item.requestedQty}</td>
                      <td className="p-3 text-center">
                        <span className={isShort ? 'text-destructive font-semibold' : 'text-green-600 font-medium'}>
                          {item.availableQty}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <Input
                          type="number"
                          className="w-20 mx-auto text-center h-8"
                          value={item.sendQty}
                          min={0}
                          max={Math.min(item.requestedQty, item.availableQty)}
                          onChange={e => updateSendQty(idx, Number(e.target.value))}
                        />
                      </td>
                      <td className="p-3 text-center">
                        {isFull ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 gap-1">
                            <CheckCircle className="h-3 w-3" /> Full
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200 gap-1">
                            <AlertTriangle className="h-3 w-3" /> Partial
                          </Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirm Send Dialog */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Confirm Distribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client / Camp</Label>
                <Input className="mt-1.5" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div>
                <Label>From Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border rounded-lg overflow-auto max-h-48">
              <table className="w-full text-sm">
                <thead><tr className="bg-muted/50 border-b"><th className="p-2 text-left">Medicine</th><th className="p-2 text-center">Requested</th><th className="p-2 text-center">Sending</th></tr></thead>
                <tbody>
                  {requestItems.filter(i => i.sendQty > 0).map(item => (
                    <tr key={item.medicineId} className="border-b last:border-b-0">
                      <td className="p-2">{item.medicineName}</td>
                      <td className="p-2 text-center">{item.requestedQty}</td>
                      <td className="p-2 text-center">
                        <span className={item.sendQty < item.requestedQty ? 'text-orange-600 font-semibold' : 'text-green-600 font-semibold'}>
                          {item.sendQty}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {hasShortage && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-sm text-orange-700">
                <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Some medicines have insufficient stock. They will be partially fulfilled.</span>
              </div>
            )}

            <div>
              <Label>Notes (optional)</Label>
              <Textarea className="mt-1.5" placeholder="Any notes..." value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button onClick={handleSend} disabled={!clientName || !warehouseId}>
              <Send className="mr-2 h-4 w-4" />
              Send Stock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribution History */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No distributions yet.</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Client</th>
                    <th className="text-left p-3 font-medium">Warehouse</th>
                    <th className="text-center p-3 font-medium">Items</th>
                    <th className="text-center p-3 font-medium">Status</th>
                    <th className="text-center p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map(dist => {
                    const wh = mockWarehouses.find(w => w.id === dist.warehouseId);
                    return (
                      <tr key={dist.id} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="p-3">{new Date(dist.createdAt).toLocaleDateString()}</td>
                        <td className="p-3 font-medium">{dist.clientName}</td>
                        <td className="p-3">{wh?.name || '-'}</td>
                        <td className="p-3 text-center">{dist.items.length} medicines</td>
                        <td className="p-3 text-center">
                          <Badge className={statusColors[dist.status]}>{dist.status}</Badge>
                        </td>
                        <td className="p-3 text-center">
                          <Button size="sm" variant="ghost" onClick={() => setSelectedDetail(dist)}>View</Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedDetail} onOpenChange={() => setSelectedDetail(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Distribution to {selectedDetail?.clientName}</DialogTitle>
          </DialogHeader>
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
                      const med = mockMedicines.find(m => m.id === item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2">{med?.name || '-'}</td>
                          <td className="p-2 text-center">{item.requestedQty}</td>
                          <td className="p-2 text-center">
                            <span className={item.sentQty < item.requestedQty ? 'text-orange-600 font-semibold' : ''}>
                              {item.sentQty}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {selectedDetail.notes && <p className="text-sm text-muted-foreground">Notes: {selectedDetail.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
