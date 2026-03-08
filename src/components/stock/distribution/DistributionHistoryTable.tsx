import { useState, useMemo } from 'react';
import { Eye, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useDistributions, useWarehouses, useMedicines } from '@/hooks/useApiData';
import type { StockDistribution } from '@/types';

const statusCfg: Record<string, { label: string; bg: string; text: string }> = {
  sent:      { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  partial:   { label: 'Partial',   bg: 'bg-orange-50',  text: 'text-orange-700' },
  confirmed: { label: 'Confirmed', bg: 'bg-blue-50',    text: 'text-blue-700' },
  pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-700' },
};

export function DistributionHistoryTable() {
  const { data: distributions = [] } = useDistributions();
  const { data: warehouses = [] } = useWarehouses();
  const { data: medicines = [] } = useMedicines();
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<StockDistribution | null>(null);

  const filtered = useMemo(() => {
    if (!search) return distributions;
    const s = search.toLowerCase();
    return distributions.filter(d => d.clientName.toLowerCase().includes(s) || d.id.includes(s));
  }, [distributions, search]);

  return (
    <>
      <div className="flex items-center gap-2 mb-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} className="h-8 pl-8 text-xs" />
        </div>
      </div>

      <div className="border rounded-xl overflow-hidden bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Client / Camp</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Warehouse</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Items</th>
              <th className="px-4 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
              <th className="px-4 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-sm text-muted-foreground">No distribution history</td></tr>
            ) : (
              filtered.map(d => {
                const wh = warehouses.find(w => w.id === d.warehouseId);
                const cfg = statusCfg[d.status] || statusCfg.pending;
                return (
                  <tr key={d.id} className="hover:bg-primary/[0.03] transition-colors">
                    <td className="px-4 py-2.5 text-muted-foreground">{new Date(d.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                    <td className="px-4 py-2.5 font-medium">{d.clientName}</td>
                    <td className="px-4 py-2.5 text-muted-foreground">{wh?.name || '-'}</td>
                    <td className="px-4 py-2.5 text-center font-semibold">{d.items.length}</td>
                    <td className="px-4 py-2.5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDetail(d)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(open) => { if (!open) setDetail(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Distribution Detail — {detail?.clientName}</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Date: <strong className="text-foreground">{new Date(detail.createdAt).toLocaleDateString()}</strong></span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${(statusCfg[detail.status] || statusCfg.pending).bg} ${(statusCfg[detail.status] || statusCfg.pending).text}`}>
                  {(statusCfg[detail.status] || statusCfg.pending).label}
                </span>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead><tr className="border-b bg-muted/30">
                    <th className="px-3 py-2 text-left text-[11px] font-semibold text-muted-foreground">Medicine</th>
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground">Requested</th>
                    <th className="px-3 py-2 text-center text-[11px] font-semibold text-muted-foreground">Sent</th>
                  </tr></thead>
                  <tbody className="divide-y">
                    {detail.items.map(item => {
                      const med = medicines.find(m => m.id === item.medicineId);
                      return (
                        <tr key={item.medicineId}>
                          <td className="px-3 py-2 font-medium">{med?.name || '-'}</td>
                          <td className="px-3 py-2 text-center">{item.requestedQty}</td>
                          <td className="px-3 py-2 text-center font-semibold">{item.sentQty}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {detail.notes && <p className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-lg">{detail.notes}</p>}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
