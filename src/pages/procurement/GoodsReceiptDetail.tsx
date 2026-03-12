import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Printer, Eye, Loader2, Paperclip } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { API_BASE_URL } from '@/services/api';
import { useWarehouseDetail } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { downloadGoodsReceiptPDF } from '@/utils/pdfGenerator';

export default function GoodsReceiptDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const receipt = (location.state as any)?.receipt;
  const { user } = useAuth();
  const warehouseId = user?.context?.warehouseId ? Number(user.context.warehouseId) : undefined;
  const { data: warehouseDetail } = useWarehouseDetail(warehouseId);

  // Document preview state
  const [showPreview, setShowPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'unknown'>('unknown');
  const [previewLoading, setPreviewLoading] = useState(false);

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

  const totalQty = receipt.items.reduce((s: number, i: any) => s + i.receivedQty, 0);

  // Documents from receipt data
  const documents: { documentId: string | number; documentName?: string; name?: string }[] =
    receipt.documents || receipt.documentList || [];
  const documentIds: (string | number)[] = receipt.documentIds || [];

  // Merge: if we have documentIds but no documents array, create stubs
  const docList = documents.length > 0
    ? documents
    : documentIds.map((docId, idx) => ({ documentId: docId, documentName: `Document ${idx + 1}` }));

  const handlePreview = async (doc: { documentId: string | number; documentName?: string; name?: string }) => {
    const url = `${API_BASE_URL}/documents/download/${doc.documentId}`;
    setShowPreview({ url, name: doc.documentName || doc.name || `Document` });
    setPreviewLoading(true);
    setPreviewBlobUrl(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const contentType = res.headers.get('content-type') || '';
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      const nameLower = (doc.documentName || doc.name || '').toLowerCase();
      if (contentType.includes('pdf') || nameLower.endsWith('.pdf')) setPreviewType('pdf');
      else setPreviewType('image');
    } catch {
      setPreviewType('unknown');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (doc: { documentId: string | number; documentName?: string; name?: string }) => {
    const url = `${API_BASE_URL}/documents/download/${doc.documentId}`;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = doc.documentName || doc.name || 'document';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      // silent
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setShowPreview(null);
    setPreviewBlobUrl(null);
    setPreviewType('unknown');
  };

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
          <p className="text-base font-bold text-[hsl(var(--success))]">{totalQty}</p>
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
            {receipt.items.map((item: any, idx: number) => (
              <tr key={item.medicineId} className="border-b last:border-b-0 hover:bg-muted/10">
                <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className="font-medium text-foreground">{item.medicineName}</span>
                  {item.strength && item.unit && (
                    <span className="ml-1.5 text-xs text-muted-foreground">{item.strength}{item.unit}</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center font-semibold text-[hsl(var(--success))]">{item.receivedQty}</td>
                <td className="px-4 py-3 font-mono text-xs">{item.batchNumber}</td>
                <td className="px-4 py-3 text-muted-foreground">{format(new Date(item.expiryDate), 'dd MMM yyyy')}</td>
                {item.hsnCode && <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{item.hsnCode}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Attached Documents */}
      {docList.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm mt-5">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Attached Documents</h2>
            <span className="text-[10px] text-muted-foreground ml-1">({docList.length})</span>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {docList.map((doc, idx) => {
              const name = doc.documentName || doc.name || `Document ${idx + 1}`;
              const ext = name.split('.').pop()?.toLowerCase();
              const isPdf = ext === 'pdf';
              return (
                <div
                  key={doc.documentId}
                  className="flex items-center gap-2.5 border rounded-lg bg-muted/20 px-3 py-2 text-xs group hover:bg-muted/40 transition-colors"
                >
                  <div className={`h-7 w-7 rounded flex items-center justify-center shrink-0 ${isPdf ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium text-foreground max-w-[140px] truncate">{name}</span>
                  <div className="flex items-center gap-1 ml-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="View"
                      onClick={() => handlePreview(doc)}
                    >
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      title="Download"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="h-3 w-3 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Document Preview Dialog */}
      <Dialog open={!!showPreview} onOpenChange={(open) => { if (!open) closePreview(); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold truncate">{showPreview?.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 min-h-0 overflow-auto flex items-center justify-center rounded-lg bg-muted/20 p-2">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-2 py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <p className="text-xs text-muted-foreground">Loading preview…</p>
              </div>
            ) : previewType === 'pdf' && previewBlobUrl ? (
              <iframe src={previewBlobUrl} className="w-full h-[65vh] rounded border" title="PDF Preview" />
            ) : previewType === 'image' && previewBlobUrl ? (
              <img src={previewBlobUrl} alt={showPreview?.name} className="max-w-full max-h-[65vh] object-contain rounded" />
            ) : (
              <div className="flex flex-col items-center gap-2 py-12">
                <FileText className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground">Preview not available</p>
              </div>
            )}
          </div>
          {previewBlobUrl && (
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" className="h-8" onClick={() => {
                if (previewBlobUrl) {
                  const a = document.createElement('a');
                  a.href = previewBlobUrl;
                  a.download = showPreview?.name || 'document';
                  a.click();
                }
              }}>
                <Download className="h-3.5 w-3.5 mr-1.5" /> Download
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => {
                if (previewBlobUrl) {
                  const w = window.open(previewBlobUrl, '_blank');
                  w?.print();
                }
              }}>
                <Printer className="h-3.5 w-3.5 mr-1.5" /> Print
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
