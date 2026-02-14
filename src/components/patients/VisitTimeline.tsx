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
                    ? "bg-accent text-accent-foreground border-accent shadow-md scale-110"
                    : "bg-card text-foreground border-border hover:border-accent/60 hover:scale-105"
                )}
              >
                {visit.visitNumber}
              </button>

              {/* Visit row */}
              <div className="ml-14">
                <button
                  onClick={() => onSelect(visit)}
                  className={cn(
                    "w-full text-left py-3 px-3 rounded-md transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "bg-accent/5"
                      : "hover:bg-muted/40"
                  )}
                >
                  {/* Header line */}
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm text-foreground">
                      {new Date(visit.date).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-muted-foreground text-sm">|</span>
                    <span className="text-sm font-medium text-foreground">
                      {visit.campName}
                    </span>
                  </div>

                  {/* Payment + complaint summary */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="text-stat-green-text font-medium">₹{visit.amount.paid}</span>
                    {visit.amount.pending > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-destructive font-medium">₹{visit.amount.pending} pending</span>
                      </>
                    )}
                    <span>•</span>
                    <span className="truncate max-w-[180px]">{visit.chiefComplaint}</span>
                  </div>

                  {/* Expanded clinical summary with animation */}
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isSelected
                        ? "grid-rows-[1fr] opacity-100 mt-3"
                        : "grid-rows-[0fr] opacity-0 mt-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Chief Complaint</p>
                          <p className="text-sm text-foreground leading-relaxed">{visit.chiefComplaint}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Vitals</p>
                          <p className="text-sm text-foreground leading-relaxed">{visit.vitals}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Assessment</p>
                          <p className="text-sm text-foreground leading-relaxed">{visit.assessment}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-0.5">Plan</p>
                          <p className="text-sm text-foreground leading-relaxed">{visit.plan}</p>
                        </div>
                      </div>
                    </div>
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
