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

export function InventoryTab({ stockItems }: InventoryTabProps) {
  const [sortKey, setSortKey] = useState<SortKey>('medicineName');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [search, setSearch] = useState('');

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

    const statusOrder = { critical: 0, warning: 1, ok: 2 };
    items.sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'medicineName') cmp = a.medicineName.localeCompare(b.medicineName);
      else if (sortKey === 'quantity') cmp = a.quantity - b.quantity;
      else cmp = statusOrder[a.status] - statusOrder[b.status];
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return items;
  }, [stockItems, sortKey, sortDir, search]);

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

    // Title
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Medicine Inventory Report', 14, 18);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120);
    doc.text(`Generated: ${new Date().toLocaleDateString()} | Total: ${processed.length} items | Critical: ${criticalCount} | Warning: ${warningCount}`, 14, 25);

    // Table header
    const colX = [14, 110, 155, 195, 235];
    const colLabels = ['Medicine Name', 'Type', 'Current Qty', 'Min Qty', 'Status'];
    let y = 35;
    doc.setFillColor(241, 243, 248);
    doc.rect(10, y - 5, pageW - 20, 8, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(60);
    colLabels.forEach((label, i) => doc.text(label, colX[i], y));
    y += 10;

    // Rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    processed.forEach((item) => {
      if (y > doc.internal.pageSize.getHeight() - 15) {
        doc.addPage();
        y = 20;
      }
      const statusLabel = statusConfig[item.status].label;
      doc.setTextColor(30);
      doc.text(item.medicineName, colX[0], y);
      doc.text(item.medicineType || '-', colX[1], y);
      doc.text(String(item.quantity), colX[2], y);
      doc.text(String(item.minQty), colX[3], y);

      // Status colored
      if (item.status === 'critical') doc.setTextColor(220, 38, 38);
      else if (item.status === 'warning') doc.setTextColor(202, 138, 4);
      else doc.setTextColor(22, 163, 74);
      doc.text(statusLabel, colX[4], y);
      doc.setTextColor(30);
      y += 7;
    });

    doc.save(`inventory-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success('PDF exported successfully');
  }, [processed, criticalCount, warningCount]);

  return (
    <div className="space-y-4">
      {/* Summary chips + search + export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--stock-critical-bg))] text-[hsl(var(--stock-critical))] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--stock-critical))] animate-pulse" />
            {criticalCount} Critical
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--stock-warning-bg))] text-[hsl(var(--stock-warning))] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--stock-warning))]" />
            {warningCount} Warning
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[hsl(var(--stock-ok-bg))] text-[hsl(var(--stock-ok))] text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--stock-ok))]" />
            {processed.length - criticalCount - warningCount} OK
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search medicines..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={exportCSV}>
            <Download className="h-3.5 w-3.5" /> CSV
          </Button>
          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs" onClick={exportPDF}>
            <FileText className="h-3.5 w-3.5" /> PDF
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('medicineName')}>
                <div className="flex items-center gap-1.5">
                  Medicine Name <SortIcon col="medicineName" />
                </div>
              </th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('quantity')}>
                <div className="flex items-center gap-1.5">
                  Quantity / Stock Level <SortIcon col="quantity" />
                </div>
              </th>
              <th className="cursor-pointer select-none" onClick={() => toggleSort('status')}>
                <div className="flex items-center gap-1.5">
                  Status <SortIcon col="status" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {processed.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="w-8 h-8 opacity-40" />
                    <p className="text-sm">No medicines found</p>
                  </div>
                </td>
              </tr>
            ) : (
              processed.map((item) => {
                const cfg = statusConfig[item.status];
                const pct = getStockPct(item.quantity, item.minQty);
                return (
                  <tr key={item.id} className={cn(
                    item.status === 'critical' && 'bg-[hsl(var(--stock-critical-bg)/0.3)]',
                    item.status === 'warning' && 'bg-[hsl(var(--stock-warning-bg)/0.3)]',
                  )}>
                    <td>
                      <div>
                        <span className="font-medium">{item.medicineName}</span>
                        {item.medicineType && (
                          <span className="text-[10px] text-muted-foreground ml-2">{item.medicineType}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <span className={cn(
                          'font-semibold tabular-nums text-sm min-w-[40px]',
                          item.status === 'critical' && 'text-[hsl(var(--stock-critical))]',
                          item.status === 'warning' && 'text-[hsl(var(--stock-warning))]',
                          item.status === 'ok' && 'text-foreground',
                        )}>
                          {item.quantity}
                        </span>
                        <div className="flex-1 flex items-center gap-2">
                          <Progress
                            value={pct}
                            className={cn('h-2 flex-1', cfg.progressTrack, cfg.progressBar)}
                          />
                          <span className="text-[10px] text-muted-foreground tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                          min: {item.minQty}
                        </span>
                      </div>
                    </td>
                    <td>
                      <Badge className={cn('gap-1.5 border', cfg.className)}>
                        <span className={cn(
                          'w-1.5 h-1.5 rounded-full',
                          cfg.dot,
                          cfg.pulse && 'animate-pulse'
                        )} />
                        {cfg.label}
                      </Badge>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
