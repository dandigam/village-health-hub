import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';

export default function GoodsReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const receipt = (location.state as any)?.receipt;

  if (!receipt) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Receipt not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/goods-receipts')}>Back</Button>
        </div>
      </DashboardLayout>
    );
  }

  const totalQty = receipt.items.reduce((s, i) => s + i.receivedQty, 0);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold text-foreground">{receipt.receiptNumber}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Received on {format(new Date(receipt.receivedDate), 'dd MMM yyyy, hh:mm a')} by {receipt.receivedBy}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
          </Button>
          <Button variant="outline" size="sm" className="h-8">
            <Download className="h-3.5 w-3.5 mr-1.5" /> Download
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        <div className="border rounded-lg bg-card px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">PO Number</p>
          <p className="text-xs font-mono font-semibold text-primary cursor-pointer hover:underline" onClick={() => navigate(`/purchase-orders/${receipt.poId}`)}>
            {receipt.poNumber}
          </p>
        </div>
        <div className="border rounded-lg bg-card px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Supplier</p>
          <p className="text-xs font-semibold text-foreground">{receipt.supplierName}</p>
        </div>
        <div className="border rounded-lg bg-card px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Invoice</p>
          <p className="text-xs font-mono font-medium text-foreground">{receipt.invoiceNumber || '—'}</p>
          {receipt.invoiceAmount && (
            <p className="text-[10px] text-muted-foreground mt-0.5">₹{receipt.invoiceAmount.toLocaleString()}</p>
          )}
        </div>
        <div className="border rounded-lg bg-card px-3 py-2.5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Total Received</p>
          <p className="text-base font-bold text-emerald-600">{totalQty}</p>
          <p className="text-[9px] text-muted-foreground">{receipt.items.length} medicines</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b bg-muted/20">
          <h2 className="text-sm font-semibold text-foreground">Received Items</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-muted/30 border-b">
            <tr>
              <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">#</th>
              <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Medicine</th>
              <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Quantity</th>
              <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Batch Number</th>
              <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Expiry Date</th>
              {receipt.items[0]?.hsnCode && (
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">HSN Code</th>
              )}
            </tr>
          </thead>
          <tbody>
            {receipt.items.map((item, idx) => (
              <tr key={item.medicineId} className="border-b last:border-b-0 hover:bg-muted/10">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{item.medicineName}</span>
                  {item.strength && item.unit && (
                    <span className="ml-1.5 text-xs text-muted-foreground">{item.strength}{item.unit}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-emerald-600">{item.receivedQty}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.batchNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(item.expiryDate), 'dd MMM yyyy')}</td>
                {item.hsnCode && <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{item.hsnCode}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
