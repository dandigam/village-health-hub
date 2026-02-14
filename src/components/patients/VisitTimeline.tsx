import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Calendar } from 'lucide-react';

export interface Visit {
  id: string;
  visitNumber: number;
  date: string;
  campName: string;
  amount: {
    paid: number;
    pending: number;
  };
  chiefComplaint: string;
  vitals: string;
  assessment: string;
  plan: string;
  fullDetails: {
    campId: string;
    campName: string;
    campLocation: string;
    visitDate: string;
    paymentType: string;
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    discountAmount: number;
    chiefComplaint: string;
    vitals: {
      weight?: number;
      bp?: string;
      pulse?: number;
      temp?: number;
      spo2?: number;
    };
    labs: string[];
    assessment: string;
    plan: string;
    soapNote?: {
      subjective: string;
      objective: string;
      assessment: string;
      plan: string;
    };
    prescription?: {
      items: Array<{
        medicineName: string;
        dosage: string;
        quantity: number;
        days: number;
      }>;
    };
  };
}

interface VisitTimelineProps {
  visits: Visit[];
  selectedId: string | null;
  onSelect: (visit: Visit) => void;
}

export function VisitTimeline({ visits, selectedId, onSelect }: VisitTimelineProps) {
  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No visits recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Visits count header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
        <Calendar className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-foreground">{visits.length} Visits</span>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-[18px] top-5 bottom-5 w-[2px] bg-border/60" />

        <div className="space-y-4">
          {visits.map((visit) => {
            const isSelected = selectedId === visit.id;
            const dateObj = new Date(visit.date);

            return (
              <button
                key={visit.id}
                onClick={() => onSelect(visit)}
                className={cn(
                  "relative w-full text-left flex items-start gap-4 group transition-all duration-200 cursor-pointer rounded-lg px-2 py-3",
                  isSelected
                    ? "bg-accent/5"
                    : "hover:bg-muted/40"
                )}
              >
                {/* Timeline node */}
                <div className="relative z-10 flex-shrink-0 mt-0.5">
                  <div
                    className={cn(
                      "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-200",
                      isSelected
                        ? "bg-accent text-accent-foreground shadow-md shadow-accent/25 scale-110"
                        : "bg-muted text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"
                    )}
                  >
                    {visit.visitNumber}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-[10px] px-2 py-0.5 h-5 font-semibold whitespace-nowrap rounded-full",
                      isSelected
                        ? "bg-accent/15 text-accent border border-accent/25"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    Visit #{visit.visitNumber}
                  </Badge>

                  <span className={cn(
                    "text-xs font-medium tabular-nums",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {dateObj.toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>

                  <span className="text-border">|</span>

                  <span className={cn(
                    "text-xs font-medium truncate",
                    isSelected ? "text-foreground" : "text-muted-foreground"
                  )}>
                    {visit.campName}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
