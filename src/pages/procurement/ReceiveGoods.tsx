import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, CheckCircle2, CalendarIcon, AlertCircle, X, FileText, Loader2, Download, Printer } from 'lucide-react';
import { format } from 'date-fns';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/procurement/StatusBadge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSupplierOrder } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/services/api';
import api from '@/services/api';

interface ReceiveRow {
  id?: number;
  medicineId: number;
  medicineName: string;
  medicineType?: string;
  strength?: string;
  unit?: string;
  currentQty: number;
  requestedQty: number;
  alreadyReceived: number;
  pendingQty: number;
  receiveQty: number;
  batchNumber: string;
  expiryDate: Date | undefined;
  error?: string;
}

interface UploadedDocument {
  documentId: string;
  name: string;
}

export default function ReceiveGoods() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: order, isLoading } = useSupplierOrder(id);

  const [rows, setRows] = useState<ReceiveRow[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceAmount, setInvoiceAmount] = useState('');
  const [invoiceDateObj, setInvoiceDateObj] = useState<Date | undefined>(undefined);
  const [submitting, setSubmitting] = useState(false);

  // Document upload state
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [uploading, setUploading] = useState(false);

  // Document preview state
  const [showDocumentPreview, setShowDocumentPreview] = useState<{ url: string; name: string } | null>(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | 'unknown'>('unknown');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Initialize rows from API data
  if (order && !initialized) {
    const items = order.items || [];
    const pending = items.filter((i: any) => (i.requestedQuantity || 0) - (i.receivedQuantity || 0) > 0);
    setRows(pending.map((i: any) => ({
      id: i.id,
      medicineId: i.medicineId,
      medicineName: i.medicineName,
      medicineType: i.medicineType,
      strength: i.strength,
      unit: i.unit,
      requestedQty: i.requestedQuantity || 0,
      alreadyReceived: i.receivedQuantity || 0,
      pendingQty: (i.requestedQuantity || 0) - (i.receivedQuantity || 0),
      receiveQty: 0,
      batchNumber: i.batchNo || '',
      expiryDate: i.expDate ? new Date(i.expDate) : undefined,
      hsnNo: i.hsnNo || '',
    })));
    setInitialized(true);
  }

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
    try {
      const items = rows
        .filter(r => r.receiveQty > 0)
        .map(r => ({
          id: r.id,
          receivedQuantity: r.receiveQty,
          batchNo: r.batchNumber,
          expDate: r.expiryDate ? format(r.expiryDate, 'yyyy-MM-dd') : '',
          hsnNo: r.hsnNo,
        }));

      // Check if all items are fully received
      const isFullyReceived = rows.every(r => (r.alreadyReceived + r.receiveQty) >= r.requestedQty);

      await api.put(`/supplier-orders/${order.id}`, {
        items,
        status: isFullyReceived ? 'RECEIVED' : 'PARTIAL',
        invoiceNumber: invoiceNumber || undefined,
        invoiceAmount: invoiceAmount ? parseFloat(invoiceAmount) || 0 : undefined,
        invoiceDate: invoiceDateObj ? format(invoiceDateObj, 'yyyy-MM-dd') : undefined,
        documents: uploadedDocuments,
      });

      toast.success('Goods received successfully');
      navigate(`/purchase-orders/${order.id}`, { state: { banner: { type: 'success', message: 'Goods receipt recorded successfully.' } } });
    } catch {
      toast.error('Failed to receive goods');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (files: FileList) => {
    if (!invoiceNumber.trim()) {
      toast.error('Enter invoice number before uploading documents');
      return;
    }
    setUploading(true);
    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('invoiceNo', invoiceNumber);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/documents/upload`, {
          method: 'POST',
          headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
          body: formData,
        });
        if (!res.ok) throw new Error('Upload failed');
        const doc = await res.json();
        if (doc?.documentId && doc?.documentName) {
          setUploadedDocuments(prev => {
            if (prev.some(d => d.documentId === doc.documentId)) return prev;
            return [...prev, { documentId: doc.documentId, name: doc.documentName }];
          });
        }
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  const handleDocumentPreview = async (doc: UploadedDocument) => {
    const url = `${API_BASE_URL}/documents/download/${doc.documentId}`;
    setShowDocumentPreview({ url, name: doc.name });
    setPreviewLoading(true);
    setPreviewBlobUrl(null);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(url, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const contentType = res.headers.get('content-type') || '';
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      const nameLower = (doc.name || '').toLowerCase();
      if (contentType.includes('pdf') || nameLower.endsWith('.pdf')) setPreviewType('pdf');
      else setPreviewType('image');
    } catch {
      setPreviewType('unknown');
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleDocumentDelete = async (doc: UploadedDocument) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${API_BASE_URL}/documents/${doc.documentId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      });
      setUploadedDocuments(prev => prev.filter(d => d.documentId !== doc.documentId));
    } catch {
      toast.error('Failed to delete document');
    }
  };

  const closePreview = () => {
    if (previewBlobUrl) URL.revokeObjectURL(previewBlobUrl);
    setShowDocumentPreview(null);
    setPreviewBlobUrl(null);
    setPreviewType('unknown');
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
              <span className="text-xs font-mono text-primary font-medium">{order.purchaseOrder || `#${order.id}`}</span>
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
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">All items have been fully received</p>
          </div>
        ) : (
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
                  <th className="px-3 py-2.5 text-left text-[10px] uppercase tracking-wider font-semibold text-muted-foreground w-28">HSN No.</th>
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
                    <td className="px-3 py-2.5">
                      <Input
                        className="h-8 text-sm w-24"
                        placeholder="HSN"
                        value={row.hsnNo}
                        onChange={e => updateRow(idx, 'hsnNo', e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Number</label>
            <Input className="h-9 text-sm" placeholder="INV-2026-XXXX" value={invoiceNumber} onChange={e => setInvoiceNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Amount (₹)</label>
            <Input className="h-9 text-sm" type="number" placeholder="0.00" value={invoiceAmount} onChange={e => setInvoiceAmount(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Invoice Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-9 w-full text-sm justify-start", !invoiceDateObj && "text-muted-foreground")}>
                  <CalendarIcon className="h-3.5 w-3.5 mr-2" />
                  {invoiceDateObj ? format(invoiceDateObj, 'dd/MM/yyyy') : 'Select date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={invoiceDateObj} onSelect={setInvoiceDateObj} className="p-3 pointer-events-auto" />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Upload Documents</label>
            <label className="block">
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                className="hidden"
                disabled={!invoiceNumber.trim() || uploading}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (!files) return;
                  await handleFileUpload(files);
                  e.target.value = '';
                }}
              />
              <Button
                variant="outline"
                className={cn("h-9 w-full text-sm justify-start gap-2", !invoiceNumber.trim() && "opacity-50 cursor-not-allowed")}
                asChild
              >
                <span>
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                  {uploading ? 'Uploading...' : 'Choose files...'}
                </span>
              </Button>
            </label>
            {!invoiceNumber.trim() && (
              <p className="text-[10px] text-muted-foreground">Enter invoice number first</p>
            )}
          </div>
        </div>

        {/* Uploaded document tags */}
        {uploadedDocuments.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {uploadedDocuments.map((doc) => (
              <div key={doc.documentId} className="flex items-center gap-1.5 border border-emerald-200 rounded-full bg-emerald-50 px-3 py-1.5 text-xs text-emerald-800">
                <Badge
                  variant="outline"
                  className="bg-emerald-100 border-emerald-200 text-emerald-700 cursor-pointer rounded-full px-2"
                  onClick={() => handleDocumentPreview(doc)}
                  title="View document"
                >
                  <FileText className="h-3 w-3 mr-1" />
                  {doc.name}
                </Badge>
                <button
                  className="text-muted-foreground hover:text-destructive focus:outline-none"
                  onClick={() => handleDocumentDelete(doc)}
                  aria-label="Remove document"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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

      {/* Document Preview Dialog */}
      <Dialog open={!!showDocumentPreview} onOpenChange={(open) => { if (!open) closePreview(); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4" />
              {showDocumentPreview?.name || 'Document Preview'}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-[300px] flex items-center justify-center">
            {previewLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-xs text-muted-foreground">Loading preview...</span>
              </div>
            ) : previewBlobUrl ? (
              previewType === 'pdf' ? (
                <iframe src={previewBlobUrl} className="w-full h-[65vh] rounded border" title="PDF Preview" />
              ) : previewType === 'image' ? (
                <img src={previewBlobUrl} alt={showDocumentPreview?.name} className="max-w-full max-h-[65vh] object-contain rounded" />
              ) : (
                <p className="text-sm text-muted-foreground">Unable to preview this file type.</p>
              )
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load preview.</p>
            )}
          </div>
          {previewBlobUrl && (
            <div className="flex items-center justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={previewBlobUrl} download={showDocumentPreview?.name}>
                  <Download className="h-3.5 w-3.5" /> Download
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => {
                  if (previewBlobUrl) {
                    const w = window.open(previewBlobUrl);
                    w?.print();
                  }
                }}
              >
                <Printer className="h-3.5 w-3.5" /> Print
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
