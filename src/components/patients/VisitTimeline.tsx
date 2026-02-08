import { useState } from 'react';
import { MoreHorizontal, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { VisitDetailsModal } from './VisitDetailsModal';

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
}

export function VisitTimeline({ visits }: VisitTimelineProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalVisit, setModalVisit] = useState<Visit | null>(null);

  const handleToggle = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (visits.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No visits recorded for this patient.</p>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        {/* Vertical timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

        <div className="space-y-0">
          {visits.map((visit) => (
            <div key={visit.id} className="relative">
              <Collapsible
                open={expandedId === visit.id}
                onOpenChange={() => handleToggle(visit.id)}
              >
                {/* Timeline circle with visit number */}
                <CollapsibleTrigger asChild>
                  <button
                    className={cn(
                      "absolute left-0 z-10 w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all cursor-pointer border-2",
                      expandedId === visit.id
                        ? "bg-accent text-accent-foreground border-accent shadow-md scale-110"
                        : "bg-background text-foreground border-border hover:border-accent hover:scale-105"
                    )}
                  >
                    {visit.visitNumber}
                  </button>
                </CollapsibleTrigger>

                {/* Visit date row (collapsed state) */}
                <div className="ml-14 pb-6">
                  <CollapsibleTrigger asChild>
                    <div
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors",
                        expandedId === visit.id
                          ? "bg-accent/5 border border-accent/20"
                          : "hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {new Date(visit.date).toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">{visit.campName}</p>
                      </div>
                      <ChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          expandedId === visit.id && "rotate-180"
                        )}
                      />
                    </div>
                  </CollapsibleTrigger>

                  {/* Expanded content - horizontal row */}
                  <CollapsibleContent>
                    <div className="mt-2 bg-white rounded-lg border border-border shadow-sm overflow-hidden">
                      <div className="flex items-stretch divide-x divide-border">
                        {/* Visit Date */}
                        <div className="flex-shrink-0 w-24 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Visit Date</p>
                          <p className="text-sm font-medium truncate">
                            {new Date(visit.date).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </p>
                        </div>

                        {/* Camp Name */}
                        <div className="flex-shrink-0 w-28 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Camp</p>
                          <p className="text-sm font-medium truncate" title={visit.campName}>
                            {visit.campName}
                          </p>
                        </div>

                        {/* Amount */}
                        <div className="flex-shrink-0 w-28 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Amount</p>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-medium text-stat-green-text">₹{visit.amount.paid}</span>
                            {visit.amount.pending > 0 && (
                              <Badge variant="outline" className="text-xs px-1 py-0 text-destructive border-destructive/30">
                                +₹{visit.amount.pending}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Chief Complaint */}
                        <div className="flex-1 min-w-0 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Chief Complaint</p>
                          <p className="text-sm truncate" title={visit.chiefComplaint}>
                            {visit.chiefComplaint}
                          </p>
                        </div>

                        {/* Labs / Vitals */}
                        <div className="flex-shrink-0 w-32 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Vitals</p>
                          <p className="text-sm truncate" title={visit.vitals}>
                            {visit.vitals}
                          </p>
                        </div>

                        {/* Assessment */}
                        <div className="flex-1 min-w-0 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Assessment</p>
                          <p className="text-sm truncate" title={visit.assessment}>
                            {visit.assessment}
                          </p>
                        </div>

                        {/* Plan */}
                        <div className="flex-1 min-w-0 p-3">
                          <p className="text-xs text-muted-foreground mb-1">Plan</p>
                          <p className="text-sm truncate" title={visit.plan}>
                            {visit.plan}
                          </p>
                        </div>

                        {/* More icon */}
                        <div className="flex-shrink-0 w-12 p-3 flex items-center justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalVisit(visit);
                            }}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            </div>
          ))}
        </div>
      </div>

      {/* Visit Details Modal */}
      <VisitDetailsModal
        visit={modalVisit}
        open={!!modalVisit}
        onOpenChange={(open) => !open && setModalVisit(null)}
      />
    </>
  );
}
