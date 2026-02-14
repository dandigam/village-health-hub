import { useState } from 'react';
import { Send, Plus, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockDistributions, mockMedicines, mockStockItems, mockWarehouses } from '@/data/mockData';
import { toast } from '@/hooks/use-toast';
import type { StockDistribution, DistributionItem } from '@/types';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  partial: 'bg-orange-100 text-orange-700 border-orange-200',
  sent: 'bg-green-100 text-green-700 border-green-200',
};

export function StockDistributionTab() {
  const [distributions, setDistributions] = useState<StockDistribution[]>(mockDistributions);
  const [showNew, setShowNew] = useState(false);
  const [clientName, setClientName] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<{ medicineId: string; requestedQty: number }[]>([]);
  const [selectedDetail, setSelectedDetail] = useState<StockDistribution | null>(null);

  const addItem = () => setItems([...items, { medicineId: '', requestedQty: 0 }]);

  const updateItem = (index: number, field: string, value: string | number) => {
    const updated = [...items];
    (updated[index] as any)[field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const getAvailableQty = (medicineId: string) => {
    const stock = mockStockItems.find(s => s.medicineId === medicineId);
    return stock?.quantity || 0;
  };

  const handleConfirmSend = () => {
    const distItems: DistributionItem[] = items.map(item => {
      const available = getAvailableQty(item.medicineId);
      const sentQty = Math.min(item.requestedQty, available);
      return { medicineId: item.medicineId, requestedQty: item.requestedQty, sentQty };
    });

    const hasPartial = distItems.some(i => i.sentQty < i.requestedQty);

    const newDist: StockDistribution = {
      id: String(distributions.length + 1),
      warehouseId,
      clientName,
      items: distItems,
      status: hasPartial ? 'partial' : 'sent',
      createdAt: new Date().toISOString(),
      notes: notes || undefined,
    };

    setDistributions([newDist, ...distributions]);
    toast({
      title: 'Distribution Confirmed',
      description: `Stock ${hasPartial ? 'partially ' : ''}sent to ${clientName}. ${hasPartial ? 'Some items had insufficient stock.' : ''}`,
    });
    setShowNew(false);
    setClientName('');
    setWarehouseId('');
    setNotes('');
    setItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Manage outgoing stock distributions to camps and clients.</p>
        <Button onClick={() => setShowNew(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Distribution
        </Button>
      </div>

      {/* Distribution List */}
      <Card>
        <CardHeader>
          <CardTitle>Distribution History</CardTitle>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No distributions yet.</p>
          ) : (
            <div className="data-table">
              <table className="w-full">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Client</th>
                    <th>Warehouse</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map(dist => {
                    const wh = mockWarehouses.find(w => w.id === dist.warehouseId);
                    return (
                      <tr key={dist.id}>
                        <td>{new Date(dist.createdAt).toLocaleDateString()}</td>
                        <td className="font-medium">{dist.clientName}</td>
                        <td>{wh?.name || '-'}</td>
                        <td>{dist.items.length} medicines</td>
                        <td>
                          <Badge className={statusColors[dist.status]}>{dist.status}</Badge>
                        </td>
                        <td>
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
              <div className="border rounded-lg">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/50"><th className="p-2 text-left">Medicine</th><th className="p-2">Requested</th><th className="p-2">Sent</th></tr></thead>
                  <tbody>
                    {selectedDetail.items.map((item, i) => {
                      const med = mockMedicines.find(m => m.id === item.medicineId);
                      return (
                        <tr key={i} className="border-b last:border-b-0">
                          <td className="p-2">{med?.name || '-'}</td>
                          <td className="p-2 text-center">{item.requestedQty}</td>
                          <td className="p-2 text-center">
                            <span className={item.sentQty < item.requestedQty ? 'text-orange-600 font-medium' : ''}>
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

      {/* New Distribution Dialog */}
      <Dialog open={showNew} onOpenChange={setShowNew}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Stock Distribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label>Client / Camp Name</Label>
                <Input placeholder="Enter client name" className="mt-2" value={clientName} onChange={e => setClientName(e.target.value)} />
              </div>
              <div>
                <Label>From Warehouse</Label>
                <Select value={warehouseId} onValueChange={setWarehouseId}>
                  <SelectTrigger className="mt-2"><SelectValue placeholder="Select warehouse" /></SelectTrigger>
                  <SelectContent>
                    {mockWarehouses.map(w => <SelectItem key={w.id} value={w.id}>{w.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Medicines</Label>
                <Button size="sm" variant="outline" onClick={addItem}>
                  <Plus className="mr-1 h-3 w-3" /> Add Item
                </Button>
              </div>
              {items.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg">Click "Add Item" to add medicines.</p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => {
                    const available = getAvailableQty(item.medicineId);
                    const isPartial = item.requestedQty > available && item.medicineId;
                    return (
                      <div key={idx} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Select value={item.medicineId} onValueChange={v => updateItem(idx, 'medicineId', v)}>
                          <SelectTrigger className="flex-1"><SelectValue placeholder="Select medicine" /></SelectTrigger>
                          <SelectContent>
                            {mockMedicines.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number" placeholder="Qty" className="w-24"
                          value={item.requestedQty || ''}
                          onChange={e => updateItem(idx, 'requestedQty', Number(e.target.value))}
                        />
                        {item.medicineId && (
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Avail: {available}
                          </span>
                        )}
                        {isPartial && <AlertTriangle className="h-4 w-4 text-orange-500 shrink-0" />}
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeItem(idx)}>×</Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <Label>Notes (optional)</Label>
              <Textarea placeholder="Any notes..." className="mt-2" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNew(false)}>Cancel</Button>
            <Button onClick={handleConfirmSend} disabled={!clientName || !warehouseId || items.length === 0}>
              <Send className="mr-2 h-4 w-4" />
              Confirm & Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
