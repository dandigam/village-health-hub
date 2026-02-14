import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-5 top-0 bottom-0 w-px bg-border" />

      <div className="space-y-1">
        {visits.map((visit) => {
          const isSelected = selectedId === visit.id;

          return (
            <div key={visit.id} className="relative">
              {/* Timeline circle */}
              <button
                onClick={() => onSelect(visit)}
                className={cn(
                  "absolute left-0 z-10 w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200 cursor-pointer border-2",
                  isSelected
                    ? "bg-accent text-accent-foreground border-accent shadow-sm scale-105"
                    : "bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-foreground"
                )}
              >
                {visit.visitNumber}
              </button>

              {/* Visit row */}
              <div className="ml-14">
                <button
                  onClick={() => onSelect(visit)}
                  className={cn(
                    "w-full text-left py-2 px-3 rounded-md transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "bg-muted/50"
                      : "hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5 font-bold bg-accent/10 text-accent border-accent/20">
                      Visit #{visit.visitNumber}
                    </Badge>
                    <span className="font-medium text-xs text-foreground">
                      {new Date(visit.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-muted-foreground text-sm">|</span>
                    <span className="text-xs font-medium text-foreground">
                      {visit.campName}
                    </span>
                  </div>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
