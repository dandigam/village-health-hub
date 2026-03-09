import { cn } from '@/lib/utils';
import type { PurchaseOrderStatus } from '@/types/procurement';

const statusConfig: Record<string, { label: string; dot: string; bg: string; text: string; border: string; pulse?: boolean }> = {
  draft:              { label: 'Draft',              dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  DRAFT:              { label: 'Draft',              dot: 'bg-slate-400',   bg: 'bg-slate-50',   text: 'text-slate-600',   border: 'border-slate-200' },
  sent:               { label: 'Sent',               dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200' },
  PENDING:            { label: 'Pending',            dot: 'bg-blue-500',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200', pulse: true },
  partially_received: { label: 'Partially Received', dot: 'bg-amber-500',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200', pulse: true },
  PARTIAL:            { label: 'Partially Received', dot: 'bg-amber-500',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200', pulse: true },
  received:           { label: 'Received',           dot: 'bg-emerald-500',bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  RECEIVED:           { label: 'Received',           dot: 'bg-emerald-500',bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  closed:             { label: 'Closed',             dot: 'bg-slate-500',  bg: 'bg-slate-100',  text: 'text-slate-700',   border: 'border-slate-300' },
};

interface StatusBadgeProps {
  status: PurchaseOrderStatus | string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusConfig[status] || statusConfig.draft;
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border",
      config.bg, config.text, config.border, className
    )}>
      <span className={cn("w-1.5 h-1.5 rounded-full", config.dot, config.pulse && "animate-pulse")} />
      {config.label}
    </span>
  );
}
