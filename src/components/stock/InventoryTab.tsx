import { useState, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Package } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface StockItemDetail {
  id: string;
  medicineId: string;
  medicineName: string;
  medicineType?: string;
  quantity: number;
  minimumQty?: number;
  isLowStock: boolean;
}

interface InventoryTabProps {
  stockItems: StockItemDetail[];
}

type SortKey = 'medicineName' | 'quantity' | 'status';
type SortDir = 'asc' | 'desc';

function getStockStatus(qty: number, minQty: number): 'critical' | 'warning' | 'ok' {
  const ratio = qty / minQty;
  if (ratio < 0.3) return 'critical';   // below 30% of min
  if (ratio < 0.7) return 'warning';    // 30-70% of min
  return 'ok';                           // above 70%
}

const statusConfig = {
  critical: {
    label: 'Low Stock',
    className: 'bg-[hsl(var(--stock-critical-bg))] text-[hsl(var(--stock-critical))] border-[hsl(var(--stock-critical)/0.2)]',
    dot: 'bg-[hsl(var(--stock-critical))]',
    pulse: true,
  },
  warning: {
    label: 'Warning',
    className: 'bg-[hsl(var(--stock-warning-bg))] text-[hsl(var(--stock-warning))] border-[hsl(var(--stock-warning)/0.2)]',
    dot: 'bg-[hsl(var(--stock-warning))]',
    pulse: true,
  },
  ok: {
    label: 'In Stock',
    className: 'bg-[hsl(var(--stock-ok-bg))] text-[hsl(var(--stock-ok))] border-[hsl(var(--stock-ok)/0.2)]',
    dot: 'bg-[hsl(var(--stock-ok))]',
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

  return (
    <div className="space-y-4">
      {/* Summary chips + search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search medicines..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
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
                  Current Qty <SortIcon col="quantity" />
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
                return (
                  <tr key={item.id} className={cn(
                    item.status === 'critical' && 'bg-[hsl(var(--stock-critical-bg)/0.3)]',
                    item.status === 'warning' && 'bg-[hsl(var(--stock-warning-bg)/0.3)]',
                  )}>
                    <td className="font-medium">{item.medicineName}</td>
                    <td>
                      <span className={cn(
                        'font-semibold tabular-nums',
                        item.status === 'critical' && 'text-[hsl(var(--stock-critical))]',
                        item.status === 'warning' && 'text-[hsl(var(--stock-warning))]',
                        item.status === 'ok' && 'text-foreground',
                      )}>
                        {item.quantity}
                      </span>
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
