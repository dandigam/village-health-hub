import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, Download, Loader2, ClipboardList, Eye, FileText, Paperclip, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { StatusBadge } from '@/components/procurement/StatusBadge';
import { useSupplierOrder, useGoodsReceiptsByPO, useWarehouseDetail } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import { API_BASE_URL } from '@/services/api';
import { downloadPurchaseOrderPDF } from '@/utils/pdfGenerator';

export default function PurchaseOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useSupplierOrder(id);
  const { data: poReceipts = [] } = useGoodsReceiptsByPO(id);

  // Document preview state
  const [showPreview, setShowPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'unknown'>('unknown');
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = async (docId: string | number, name: string) => {
    const url = `${API_BASE_URL}/documents/download/${docId}`;
    setShowPreview({ url, name });
    setPreviewLoading(true);
    setPreviewBlobUrl(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const contentType = res.headers.get('content-type') || '';
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      if (contentType.includes('pdf') || name.toLowerCase().endsWith('.pdf')) setPreviewType('pdf');
      else setPreviewType('image');
    } catch {
      setPreviewType('unknown');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDownload = async (docId: string | number, name: string) => {
    const url = `${API_BASE_URL}/documents/download/${docId}`;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { /* silent */ }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setShowPreview(null);
    setPreviewBlobUrl(null);
    setPreviewType('unknown');
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="ml-2 text-sm text-muted-foreground">Loading order...</span>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-sm text-muted-foreground">Purchase order not found.</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/purchase-orders')}>Back to Orders</Button>
        </div>
      </DashboardLayout>
    );
  }

  const canReceive = order.status === 'PENDING' || order.status === 'PARTIAL' || order.status === 'PARTIALLY_RECEIVED';
  const showReceipts = order.status === 'RECEIVED' || order.status === 'PARTIAL' || order.status === 'PARTIALLY_RECEIVED';
  const items = order.items || [];
  const totalRequested = items.reduce((s: number, i: any) => s + (i.requestedQuantity || 0), 0);
  const totalReceived = items.reduce((s: number, i: any) => s + (i.receivedQuantity || 0), 0);
  const totalPending = totalRequested - totalReceived;

  // Collect all documents from receipts
  const allDocs: { documentId: string | number; documentName: string; receiptNumber?: string }[] = [];
  poReceipts.forEach((r: any) => {
    const docs = r.documents || r.documentList || [];
    const docIds = r.documentIds || [];
    if (docs.length > 0) {
      docs.forEach((d: any) => allDocs.push({ documentId: d.documentId, documentName: d.documentName || d.name || 'Document', receiptNumber: r.receiptNumber }));
    } else if (docIds.length > 0) {
      docIds.forEach((dId: any, idx: number) => allDocs.push({ documentId: dId, documentName: `Document ${idx + 1}`, receiptNumber: r.receiptNumber }));
    }
  });

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 mt-0.5" onClick={() => navigate('/purchase-orders')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold text-foreground">{order.purchaseOrder || `Order #${order.id}`}</h1>
              <StatusBadge status={order.status} />
              {order.isPriority && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-destructive/10 text-destructive border border-destructive/20">URGENT</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Created {format(new Date(order.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canReceive && (
            <Button size="sm" onClick={() => navigate(`/purchase-orders/${order.id}/receive`)} className="h-8">
              <Package className="h-3.5 w-3.5 mr-1.5" /> Receive Goods
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={() => navigate(`/goods-receipts?po=${order.id}`)} className="h-8">
            <ClipboardList className="h-3.5 w-3.5 mr-1.5" /> Receipt History
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Supplier</p>
          <p className="text-sm font-semibold text-foreground">{order.supplierName}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Requested</p>
          <p className="text-xl font-bold text-foreground">{totalRequested}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Received</p>
          <p className="text-xl font-bold text-[hsl(var(--success))]">{totalReceived}</p>
        </div>
        <div className="border rounded-lg bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Pending</p>
          <p className={cn("text-xl font-bold", totalPending > 0 ? "text-[hsl(var(--warning))]" : "text-muted-foreground")}>{totalPending}</p>
        </div>
      </div>

      {/* Medicine Table */}
      {items.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b bg-muted/20">
            <h2 className="text-sm font-semibold text-foreground">Order Items</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Medicine Name</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Type</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Requested Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Received Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Pending Qty</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Progress</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any, idx: number) => {
                const pending = (item.requestedQuantity || 0) - (item.receivedQuantity || 0);
                const pct = item.requestedQuantity > 0 ? Math.round((item.receivedQuantity / item.requestedQuantity) * 100) : 0;
                return (
                  <tr key={item.id || idx} className="border-b last:border-b-0 hover:bg-muted/10">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-foreground">{item.medicineName}</span>
                      {item.strength && <span className="ml-1.5 text-xs text-muted-foreground">{item.strength}</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{item.medicineType || '—'}</td>
                    <td className="px-4 py-3 text-center font-medium">{item.requestedQuantity}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-semibold text-[hsl(var(--success))]">{item.receivedQuantity}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("font-semibold", pending > 0 ? "text-[hsl(var(--warning))]" : "text-muted-foreground")}>{pending}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-[hsl(var(--success))]" : pct > 0 ? "bg-[hsl(var(--warning))]" : "bg-muted")}
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground w-8">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Recent Receipts */}
      {showReceipts && poReceipts.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm mt-6">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Recent Receipts</h2>
            <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={() => navigate(`/goods-receipts?po=${order.id}`)}>
              View All →
            </Button>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted/30 border-b">
              <tr>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Receipt #</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Date</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Items</th>
                <th className="px-4 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Received By</th>
                <th className="px-4 py-2.5 text-center text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Docs</th>
                <th className="px-4 py-2.5 text-right text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {poReceipts.map((receipt: any) => {
                const rDocs = receipt.documents || receipt.documentList || [];
                const rDocIds = receipt.documentIds || [];
                const docCount = rDocs.length || rDocIds.length;
                return (
                  <tr
                    key={receipt.id}
                    className="border-b last:border-b-0 hover:bg-muted/10 cursor-pointer transition-colors"
                    onClick={() => navigate(`/goods-receipts/${receipt.id}`, { state: { receipt } })}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-semibold text-primary">{receipt.receiptNumber}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {format(new Date(receipt.receivedDate), 'dd MMM yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex items-center justify-center h-6 w-8 rounded-md bg-muted/50 text-xs font-medium">
                        {receipt.items.length}
                      </span>
                    </td>
                    <td className="px-4 py-3">{receipt.receivedBy}</td>
                    <td className="px-4 py-3 text-center">
                      {docCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                          <Paperclip className="h-3 w-3" /> {docCount}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground font-mono">
                      {receipt.invoiceNumber || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Attached Documents across all receipts */}
      {allDocs.length > 0 && (
        <div className="border rounded-lg bg-card overflow-hidden shadow-sm mt-6">
          <div className="px-4 py-3 border-b bg-muted/20 flex items-center gap-2">
            <Paperclip className="h-3.5 w-3.5 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-foreground">Attached Documents</h2>
            <span className="text-[10px] text-muted-foreground ml-1">({allDocs.length})</span>
          </div>
          <div className="p-4 flex flex-wrap gap-3">
            {allDocs.map((doc, idx) => {
              const ext = doc.documentName.split('.').pop()?.toLowerCase();
              const isPdf = ext === 'pdf';
              return (
                <div
                  key={`${doc.documentId}-${idx}`}
                  className="flex items-center gap-2.5 border rounded-lg bg-muted/20 px-3 py-2 text-xs hover:bg-muted/40 transition-colors"
                >
                  <div className={`h-7 w-7 rounded flex items-center justify-center shrink-0 ${isPdf ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-foreground max-w-[140px] truncate">{doc.documentName}</span>
                    {doc.receiptNumber && (
                      <span className="text-[10px] text-muted-foreground truncate">{doc.receiptNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 ml-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="View" onClick={(e) => { e.stopPropagation(); handlePreview(doc.documentId, doc.documentName); }}>
                      <Eye className="h-3 w-3 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" title="Download" onClick={(e) => { e.stopPropagation(); handleDownload(doc.documentId, doc.documentName); }}>
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
