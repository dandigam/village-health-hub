import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Package, Download, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import jsPDF from 'jspdf';

interface StockItemDetail {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineType?: string;
  quantity: number;
  minimumQty?: number;
  isLowStock: boolean;
}

interface WarehouseInfo {
  name: string;
  email: string;
  phoneNumber: string;
  authorizedPerson: string;
  licenceNumber: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  pinCode: string;
}

interface InventoryTabProps {
  stockItems: StockItemDetail[];
  warehouseInfo?: WarehouseInfo;
}

type SortKey = 'medicineName' | 'quantity' | 'status';
type SortDir = 'asc' | 'desc';

function getStockStatus(qty: number, minQty: number): 'critical' | 'warning' | 'ok' {
  const ratio = qty / minQty;
  if (ratio < 0.3) return 'critical';
  if (ratio < 0.7) return 'warning';
  return 'ok';
}

function getStockPct(qty: number, minQty: number): number {
  if (minQty <= 0) return 100;
  return Math.min(Math.round((qty / minQty) * 100), 100);
}

const statusConfig = {
  critical: {
    label: 'Low Stock',
    className: 'bg-[hsl(var(--stock-critical-bg))] text-[hsl(var(--stock-critical))] border-[hsl(var(--stock-critical)/0.2)]',
    dot: 'bg-[hsl(var(--stock-critical))]',
    progressBar: '[&>div]:bg-[hsl(var(--stock-critical))]',
    progressTrack: 'bg-[hsl(var(--stock-critical)/0.15)]',
    pulse: true,
  },
  warning: {
    label: 'Warning',
    className: 'bg-[hsl(var(--stock-warning-bg))] text-[hsl(var(--stock-warning))] border-[hsl(var(--stock-warning)/0.2)]',
    dot: 'bg-[hsl(var(--stock-warning))]',
    progressBar: '[&>div]:bg-[hsl(var(--stock-warning))]',
    progressTrack: 'bg-[hsl(var(--stock-warning)/0.15)]',
    pulse: true,
  },
  ok: {
    label: 'In Stock',
    className: 'bg-[hsl(var(--stock-ok-bg))] text-[hsl(var(--stock-ok))] border-[hsl(var(--stock-ok)/0.2)]',
    dot: 'bg-[hsl(var(--stock-ok))]',
    progressBar: '[&>div]:bg-[hsl(var(--stock-ok))]',
    progressTrack: 'bg-[hsl(var(--stock-ok)/0.15)]',
    pulse: false,
  },
};

const MIN_STOCK_DEFAULT = 50;

export function InventoryTab({ stockItems, warehouseInfo }: InventoryTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('medicineName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'critical' | 'warning' | 'ok'>('all');

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground/50" />;
    return sortDir === 'asc'
      ? <ArrowUp className="w-3.5 h-3.5 text-primary" />
      : <ArrowDown className="w-3.5 h-3.5 text-primary" />;
  };

  const processed = useMemo(() => {
    let items = stockItems.map(item => ({
      ...item,
      minQty: item.minimumQty || MIN_STOCK_DEFAULT,
      status: getStockStatus(item.quantity, item.minimumQty || MIN_STOCK_DEFAULT),
    }));

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(i => i.medicineName.toLowerCase().includes(q));
    }

    // Filter by status
    if (statusFilter !== 'all') {
      items = items.filter(i => i.status === statusFilter);
    }

    const statusOrder = { critical: 0, warning: 1, ok: 2 };
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'medicineName') cmp = a.medicineName.localeCompare(b.medicineName);
      else if (sortKey === 'quantity') cmp = a.quantity - b.quantity;
      else cmp = statusOrder[a.status] - statusOrder[b.status];
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [stockItems, sortKey, sortDir, search, statusFilter]);

  const criticalCount = processed.filter(i => i.status === 'critical').length;
  const warningCount = processed.filter(i => i.status === 'warning').length;

  // ── Export CSV ─────────────────────────────────────────────
  const exportCSV = useCallback(() => {
    const headers = ['Medicine Name', 'Type', 'Current Qty', 'Min Qty', 'Stock %', 'Status'];
    const rows = processed.map(item => [
      item.medicineName,
      item.medicineType || '-',
      item.quantity,
      item.minQty,
      `${getStockPct(item.quantity, item.minQty)}%`,
      statusConfig[item.status].label,
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  }, [processed]);

  // ── Export PDF ─────────────────────────────────────────────
  const exportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const margin = 14;

    // ─── HEADER ───────────────────────────────────────────
    // Gradient-like header with two-tone
    doc.setFillColor(15, 32, 75); // Deep navy
    doc.rect(0, 0, pageW, 40, 'F');
    // Accent strip
    doc.setFillColor(37, 99, 235); // Vivid blue
    doc.rect(0, 40, pageW, 3, 'F');

    // Warehouse name
    const wName = warehouseInfo?.name || 'Medicine Inventory';
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(wName, pageW / 2, 16, { align: 'center' });

    // Address
    if (warehouseInfo) {
      const addressParts = [warehouseInfo.village, warehouseInfo.mandal, warehouseInfo.district, warehouseInfo.state, warehouseInfo.pinCode].filter(Boolean);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(180, 200, 240);
      doc.text(addressParts.join(', '), pageW / 2, 23, { align: 'center' });

      const contactParts: string[] = [];
      if (warehouseInfo.phoneNumber) contactParts.push(`Ph: ${warehouseInfo.phoneNumber}`);
      if (warehouseInfo.email) contactParts.push(`Email: ${warehouseInfo.email}`);
      if (warehouseInfo.licenceNumber) contactParts.push(`Licence: ${warehouseInfo.licenceNumber}`);
      if (contactParts.length) {
        doc.setFontSize(8);
        doc.setTextColor(160, 185, 230);
        doc.text(contactParts.join('   |   '), pageW / 2, 30, { align: 'center' });
      }

      if (warehouseInfo.authorizedPerson) {
        doc.setFontSize(8);
        doc.setTextColor(140, 170, 220);
        doc.text(`Authorized Person: ${warehouseInfo.authorizedPerson}`, pageW / 2, 36, { align: 'center' });
      }
    }

    // ─── REPORT TITLE & SUMMARY ──────────────────────────
    let y = 54;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 32, 75);
    doc.text('Medicine Inventory Report', margin, y);

    // Summary badges
    const okCount = processed.length - criticalCount - warningCount;
    const summaryY = y - 2;
    const badgeH = 7;
    
    // Total badge
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(pageW - margin - 160, summaryY - 4, 38, badgeH, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(`Total: ${processed.length}`, pageW - margin - 141, summaryY + 1, { align: 'center' });

    // Critical badge
    doc.setFillColor(220, 38, 38);
    doc.roundedRect(pageW - margin - 118, summaryY - 4, 38, badgeH, 2, 2, 'F');
    doc.text(`Critical: ${criticalCount}`, pageW - margin - 99, summaryY + 1, { align: 'center' });

    // Warning badge
    doc.setFillColor(217, 119, 6);
    doc.roundedRect(pageW - margin - 76, summaryY - 4, 38, badgeH, 2, 2, 'F');
    doc.text(`Warning: ${warningCount}`, pageW - margin - 57, summaryY + 1, { align: 'center' });

    // OK badge
    doc.setFillColor(22, 163, 74);
    doc.roundedRect(pageW - margin - 34, summaryY - 4, 38, badgeH, 2, 2, 'F');
    doc.text(`OK: ${okCount}`, pageW - margin - 15, summaryY + 1, { align: 'center' });

    // Generated line
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated: ${formatPrintDate()}`, margin, y + 7);

    // Divider
    y += 14;
    doc.setDrawColor(37, 99, 235);
    doc.setLineWidth(0.6);
    doc.line(margin, y, pageW - margin, y);

    // ─── TABLE ────────────────────────────────────────────
    y += 10;
    const colX = [margin, 130, 175, 215, 250];
    const colLabels = ['Medicine Name', 'Type', 'Current Qty', 'Min Qty', 'Status'];

    // Table header
    doc.setFillColor(37, 99, 235);
    doc.roundedRect(margin - 2, y - 5.5, pageW - (margin * 2) + 4, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    colLabels.forEach((label, i) => doc.text(label, colX[i], y + 1));
    y += 12;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let pageCount = 1;
    processed.forEach((item, idx) => {
      if (y > pageH - 38) {
        doc.addPage();
        pageCount++;
        y = 20;
      }

      // Alternate rows with subtle coloring
      if (idx % 2 === 0) {
        doc.setFillColor(245, 247, 255);
        doc.rect(margin - 2, y - 4.5, pageW - (margin * 2) + 4, 8, 'F');
      }

      // Critical/warning row tinting
      if (item.status === 'critical') {
        doc.setFillColor(254, 242, 242);
        doc.rect(margin - 2, y - 4.5, pageW - (margin * 2) + 4, 8, 'F');
      } else if (item.status === 'warning') {
        doc.setFillColor(255, 251, 235);
        doc.rect(margin - 2, y - 4.5, pageW - (margin * 2) + 4, 8, 'F');
      }

      doc.setTextColor(30, 35, 50);
      doc.setFont('helvetica', 'normal');
      doc.text(item.medicineName, colX[0], y);
      doc.text(item.medicineType || '-', colX[1], y);
      
      // Quantity - bold with status color
      doc.setFont('helvetica', 'bold');
      if (item.status === 'critical') doc.setTextColor(220, 38, 38);
      else if (item.status === 'warning') doc.setTextColor(180, 120, 0);
      else doc.setTextColor(22, 163, 74);
      doc.text(String(item.quantity), colX[2], y);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(String(item.minQty), colX[3], y);

      // Status pill
      const statusLabel = statusConfig[item.status].label;
      const pillW = doc.getTextWidth(statusLabel) + 8;
      if (item.status === 'critical') doc.setFillColor(254, 226, 226);
      else if (item.status === 'warning') doc.setFillColor(254, 243, 199);
      else doc.setFillColor(220, 252, 231);
      doc.roundedRect(colX[4] - 2, y - 4, pillW, 6, 1.5, 1.5, 'F');

      if (item.status === 'critical') doc.setTextColor(185, 28, 28);
      else if (item.status === 'warning') doc.setTextColor(146, 64, 14);
      else doc.setTextColor(21, 128, 61);
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.text(statusLabel, colX[4] + 2, y);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      y += 8;
    });

    // ─── ADD FOOTERS TO ALL PAGES ─────────────────────────
    const totalPages = pageCount;
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      addFooter(doc, pageW, pageH, margin, warehouseInfo, p, totalPages);
    }

    doc.save(`inventory-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exported successfully');
  }, [processed, criticalCount, warningCount, warehouseInfo]);

  function formatPrintDate(): string {
    const now = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const day = String(now.getDate()).padStart(2, '0');
    const mon = months[now.getMonth()];
    const year = now.getFullYear();
    const h = now.getHours();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    const min = String(now.getMinutes()).padStart(2, '0');
    const sec = String(now.getSeconds()).padStart(2, '0');
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return `${day}-${mon}-${year} | ${String(h12).padStart(2,'0')}:${min}:${sec} ${ampm} ${tz}`;
  }

  function addFooter(doc: jsPDF, pageW: number, pageH: number, margin: number, wInfo?: WarehouseInfo, pageNum?: number, totalPages?: number) {
    const footerH = 28;
    const footerTop = pageH - footerH;

    // Footer background — subtle off-white surface
    doc.setFillColor(243, 244, 246); // #F3F4F6
    doc.rect(0, footerTop, pageW, footerH, 'F');

    // Top border — slate blue, 2pt
    doc.setDrawColor(100, 116, 139); // #64748B
    doc.setLineWidth(0.8);
    doc.line(margin, footerTop, pageW - margin, footerTop);

    const row1Y = footerTop + 7;
    const row2Y = footerTop + 12;
    const row3Y = footerTop + 17;

    // ── Left column ──────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81); // Charcoal #374151
    doc.text('Medical Camp Management System (v2.4)', margin, row1Y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99); // #4B5563
    doc.text('Support: support@medicalcamp.com  |  Help Center', margin, row2Y);

    // Links row
    doc.setTextColor(100, 116, 139); // #64748B
    doc.setFontSize(6.5);
    doc.text('Privacy Policy  |  Terms of Service  |  System Status', margin, row3Y);

    // ── Right column ─────────────────────────────────
    // Warehouse name + CONFIDENTIAL badge
    const wName = wInfo?.name || 'Inventory Report';
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    doc.text(wName, pageW - margin, row1Y, { align: 'right' });

    // CONFIDENTIAL in deep red
    const confText = 'CONFIDENTIAL';
    const confWidth = doc.getTextWidth(confText) + 4;
    doc.setFillColor(153, 27, 27); // #991B1B
    doc.roundedRect(pageW - margin - confWidth - 1, row1Y - 3.5, confWidth + 2, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.5);
    doc.setTextColor(255, 255, 255);
    doc.text(confText, pageW - margin - confWidth / 2, row1Y + 0.2, { align: 'center' });

    // Printed timestamp — precise format
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(75, 85, 99);
    doc.text(`Printed: ${formatPrintDate()}`, pageW - margin, row2Y, { align: 'right' });

    // Page number
    if (pageNum && totalPages) {
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(`Page ${pageNum} of ${totalPages}`, pageW / 2, row3Y, { align: 'center' });
    }
  }

  return (
    <div className="space-y-4">
      {/* Summary chips + search + export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter(statusFilter === 'critical' ? 'all' : 'critical')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
              statusFilter === 'critical' 
                ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/25' 
                : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'critical' ? 'bg-white animate-pulse' : 'bg-red-500 animate-pulse')} />
            {criticalCount} Critical
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'warning' ? 'all' : 'warning')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
              statusFilter === 'warning' 
                ? 'bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-500/25' 
                : 'bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'warning' ? 'bg-white' : 'bg-amber-500')} />
            {warningCount} Warning
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'ok' ? 'all' : 'ok')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border',
              statusFilter === 'ok' 
                ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100'
            )}
          >
            <span className={cn('w-2 h-2 rounded-full', statusFilter === 'ok' ? 'bg-white' : 'bg-emerald-500')} />
            {stockItems.filter(i => getStockStatus(i.quantity, i.minimumQty || MIN_STOCK_DEFAULT) === 'ok').length} OK
          </button>
          {statusFilter !== 'all' && (
            <button
              onClick={() => setStatusFilter('all')}
              className="text-xs text-muted-foreground hover:text-foreground underline ml-1"
            >
              Clear filter
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-10 text-sm rounded-xl bg-background border-border focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-medium rounded-xl" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-10 px-4 gap-1.5 text-xs font-medium rounded-xl" onClick={exportPDF}>
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Card-based inventory grid */}
      {processed.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-muted/30 border border-border">
          <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Package className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No medicines found</p>
          <p className="text-xs text-muted-foreground mt-1">{statusFilter !== 'all' ? 'Try clearing the filter' : 'Add medicines to your inventory'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {processed.map((item) => {
            const cfg = statusConfig[item.status];
            const pct = getStockPct(item.quantity, item.minQty);
            const typeColors: Record<string, string> = {
              'Tablet': 'bg-blue-50 text-blue-600 border-blue-100',
              'Capsule': 'bg-amber-50 text-amber-600 border-amber-100',
              'Syrup': 'bg-emerald-50 text-emerald-600 border-emerald-100',
              'Injection': 'bg-purple-50 text-purple-600 border-purple-100',
              'Cream': 'bg-pink-50 text-pink-600 border-pink-100',
              'Drops': 'bg-cyan-50 text-cyan-600 border-cyan-100',
              'Powder': 'bg-orange-50 text-orange-600 border-orange-100',
              'Inhaler': 'bg-indigo-50 text-indigo-600 border-indigo-100',
              'Ointment': 'bg-teal-50 text-teal-600 border-teal-100',
            };
            const typeClass = item.medicineType ? (typeColors[item.medicineType] || 'bg-muted text-muted-foreground border-border') : '';
            
            return (
              <div
                key={item.id}
                className={cn(
                  'relative rounded-2xl border p-4 transition-all hover:shadow-md',
                  item.status === 'critical' 
                    ? 'bg-red-50/50 border-red-200 hover:border-red-300' 
                    : item.status === 'warning' 
                      ? 'bg-amber-50/30 border-amber-200 hover:border-amber-300'
                      : 'bg-card border-border hover:border-primary/30'
                )}
              >
                {/* Top row: Name + Type */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-2">
                    {item.medicineName}
                  </h3>
                  {item.medicineType && (
                    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-md border whitespace-nowrap', typeClass)}>
                      {item.medicineType}
                    </span>
                  )}
                </div>

                {/* Quantity display */}
                <div className="flex items-end justify-between mb-2.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">In Stock</p>
                    <p className={cn(
                      'text-2xl font-bold tabular-nums leading-none',
                      item.status === 'critical' && 'text-red-600',
                      item.status === 'warning' && 'text-amber-600',
                      item.status === 'ok' && 'text-foreground',
                    )}>
                      {item.quantity.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-0.5">Min Qty</p>
                    <p className="text-sm font-medium text-muted-foreground tabular-nums">{item.minQty}</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex items-center gap-2">
                  <Progress
                    value={pct}
                    className={cn('h-2 flex-1 rounded-full', cfg.progressTrack, cfg.progressBar)}
                  />
                  <span className="text-[11px] font-semibold tabular-nums text-muted-foreground w-9 text-right">{pct}%</span>
                </div>

                {/* Status badge */}
                <div className="mt-3 flex items-center justify-between">
                  <Badge className={cn('gap-1.5 border text-[11px]', cfg.className)}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', cfg.dot, cfg.pulse && 'animate-pulse')} />
                    {cfg.label}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
