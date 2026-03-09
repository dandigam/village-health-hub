import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/procurement/StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { mockPurchaseOrders } from '@/data/procurementMockData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ReceiveRow {
  medicineId: string;
  medicineName: string;
  strength?: string;
  unit?: string;
  requestedQty: number;
  alreadyReceived: number;
  pendingQty: number;
  receiveQty: number;
  batchNumber: string;
  expiryDate: Date | undefined;
  error?: string;
}

export default function ReceiveGoods() {
  const { id } = useParams();
  const navigate = useNavigate();

  const order = mockPurchaseOrders.find(o => o.id === id);

  const [rows, setRows] = useState<ReceiveRow[]>(() => {
    if (!order) return [];
    return order.items
      .filter(i => i.pendingQty > 0)
      .map(i => ({
        medicineId: i.medicineId,
        medicineName: i.medicineName,
        strength: i.strength,
        unit: i.unit,
        requestedQty: i.requestedQty,
        alreadyReceived: i.receivedQty,
        pendingQty: i.pendingQty,
        receiveQty: 0,
        batchNumber: '',
        expiryDate: undefined,
      }));
  });

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Purchase order not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/purchase-orders')}>Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const updateRow = (idx: number, field: keyof ReceiveRow, value: any) => {
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: value, error: undefined } : r));
  };

  const totalReceiving = rows.reduce((s, r) => s + r.receiveQty, 0);

  const validate = (): boolean => {
    let valid = true;
    const updated = rows.map(r => {
      if (r.receiveQty > 0) {
        if (!r.batchNumber.trim()) { valid = false; return { ...r, error: 'Batch required' }; }
        if (!r.expiryDate) { valid = false; return { ...r, error: 'Expiry required' }; }
        if (r.expiryDate < new Date()) { valid = false; return { ...r, error: 'Past date' }; }
        if (r.receiveQty > r.pendingQty) { valid = false; return { ...r, error: 'Exceeds pending' }; }
      }
      return { ...r, error: undefined };
    });
    setRows(updated);
    if (totalReceiving === 0) { toast.error('Enter at least one receive quantity'); return false; }
    return valid;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setSubmitting(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 800));
    setSubmitting(false);
    toast.success('Goods received successfully');
    navigate(`/purchase-orders/${order.id}`, { state: { banner: { type: 'success', message: 'Goods receipt recorded successfully.' } } });
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5" onClick={() => navigate(`/purchase-orders/${order.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Receive Goods</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-primary font-medium">{order.poNumber}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{order.supplierName}</span>
              <StatusBadge status={order.status} className="ml-1" />
            </div>
          </div>
        </div>
      </div>

      {/* Receive Table */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm mb-6">
        <div className="px-4 py-3 border-b bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Medicines to Receive</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Enter quantities, batch numbers, and expiry dates for items being received</p>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Medicine</th>
                <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-20">Req Qty</th>
                <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-20">Received</th>
                <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-20">Pending</th>
                <th className="px-3 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-24">Receive Qty</th>
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-32">Batch No.</th>
                <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-36">Expiry Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={row.medicineId} className={cn("border-b last:border-b-0", row.error && "bg-destructive/5")}>
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-foreground">{row.medicineName}</span>
                    {row.strength && row.unit && <span className="ml-1 text-xs text-muted-foreground">{row.strength}{row.unit}</span>}
                    {row.error && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertCircle className="h-3 w-3 text-destructive" />
                        <span className="text-[10px] text-destructive font-medium">{row.error}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center text-muted-foreground">{row.requestedQty}</td>
                  <td className="px-3 py-2.5 text-center text-emerald-600 font-medium">{row.alreadyReceived}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={cn("font-semibold", row.pendingQty > 0 ? "text-amber-600" : "text-muted-foreground")}>{row.pendingQty}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      type="number"
                      min={0}
                      max={row.pendingQty}
                      className={cn("h-8 text-center text-sm w-20 mx-auto", row.error?.includes('Exceeds') && "border-destructive")}
                      value={row.receiveQty || ''}
                      onChange={e => updateRow(idx, 'receiveQty', Math.min(Number(e.target.value), row.pendingQty))}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Input
                      className={cn("h-8 text-sm w-28", row.error?.includes('Batch') && "border-destructive")}
                      placeholder="Batch #"
                      value={row.batchNumber}
                      onChange={e => updateRow(idx, 'batchNumber', e.target.value)}
                      autoFocus={idx === 0}
                    />
                  </td>
                  <td className="px-3 py-2.5">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "h-8 w-32 text-xs justify-start",
                            !row.expiryDate && "text-muted-foreground",
                            row.error?.includes('date') && "border-destructive"
                          )}
                        >
                          <CalendarIcon className="h-3 w-3 mr-1" />
                          {row.expiryDate ? format(row.expiryDate, 'dd/MM/yyyy') : 'Select'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={row.expiryDate}
                          onSelect={d => updateRow(idx, 'expiryDate', d)}
                          disabled={d => d < new Date()}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalReceiving > 0 && (
          <div className="px-4 py-2.5 border-t bg-emerald-50/50 flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            <span className="text-xs font-medium text-emerald-700">Total receiving: {totalReceiving} units</span>
          </div>
        )}
      </div>

      {/* Invoice Section */}
      <div className="border rounded-lg bg-card p-5 shadow-sm mb-6">
        <h2 className="text-sm font-semibold text-foreground mb-4">Invoice Details</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Number</label>
            <Input className="h-9 text-sm" placeholder="INV-2026-XXXX" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Amount (₹)</label>
            <Input className="h-9 text-sm" type="number" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Upload Invoice</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={e => setInvoiceFile(e.target.files?.[0] || null)}
              />
              <Button variant="outline" className="h-9 w-full text-sm justify-start gap-2">
                <Upload className="h-3.5 w-3.5" />
                {invoiceFile ? invoiceFile.name : 'Choose file...'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={() => navigate(`/purchase-orders/${order.id}`)}>Cancel</Button>
        <Button onClick={handleConfirm} disabled={submitting || totalReceiving === 0} className="min-w-[160px]">
          {submitting ? 'Processing...' : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Confirm Receipt
            </>
          )}
        </Button>
      </div>
    </DashboardLayout>
  );
}
