import { FileText, Pill, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Visit } from './VisitTimeline';
import { cn } from '@/lib/utils';

interface VisitDetailPanelProps {
  visit: Visit | null;
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  if (!visit) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground py-20">
        <p className="text-sm">Select a visit from the timeline to view details</p>
      </div>
    );
  }

  const { fullDetails } = visit;

  return (
    <div className="animate-in fade-in-0 slide-in-from-right-2 duration-300">
      {/* Header with actions */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Visit #{visit.visitNumber}</h3>
          <p className="text-[11px] text-muted-foreground">
            {new Date(fullDetails.visitDate).toLocaleDateString('en-IN', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </p>
        </div>
        <div className="flex gap-1.5">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <FileText className="h-3.5 w-3.5 mr-1" />
            SOAP
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Pill className="h-3.5 w-3.5 mr-1" />
            Rx
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => window.print()}>
            <Printer className="h-3.5 w-3.5 mr-1" />
            Print
          </Button>
        </div>
      </div>

      {/* Section 1 — Camp Info */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Visit Date</p>
          <p className="text-xs font-medium">
            {new Date(fullDetails.visitDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Camp</p>
          <p className="text-xs font-medium">{fullDetails.campName}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70">Location</p>
          <p className="text-xs font-medium">{fullDetails.campLocation}</p>
        </div>
      </div>

      <Separator className="mb-3" />

      {/* Section 2 — Payment (single clean line) */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Badge variant={fullDetails.paymentType === 'Free' ? 'secondary' : 'default'} className="text-xs">
          {fullDetails.paymentType}
        </Badge>
        <span className="text-xs text-stat-green-text font-medium">Paid ₹{fullDetails.paidAmount}</span>
        <span className="text-muted-foreground/40">•</span>
        {fullDetails.pendingAmount > 0 && (
          <>
            <span className="text-xs text-destructive font-medium">Pending ₹{fullDetails.pendingAmount}</span>
            <span className="text-muted-foreground/40">•</span>
          </>
        )}
        <span className="text-xs text-muted-foreground">Total ₹{fullDetails.totalAmount}</span>
        {fullDetails.discountAmount > 0 && (
          <>
            <span className="text-muted-foreground/40">•</span>
            <span className="text-xs text-stat-blue-text">Disc ₹{fullDetails.discountAmount}</span>
          </>
        )}
      </div>

      <Separator className="mb-3" />

      {/* Section 3 — Clinical Summary */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Chief Complaint</p>
          <p className="text-xs text-foreground leading-snug">
            {fullDetails.chiefComplaint || 'Not recorded'}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Vitals</p>
          <div className="flex flex-wrap gap-2">
            {fullDetails.vitals.weight && (
              <span className="text-xs bg-muted/60 px-2 py-1 rounded">Wt: {fullDetails.vitals.weight}kg</span>
            )}
            {fullDetails.vitals.bp && (
              <span className="text-xs bg-muted/60 px-2 py-1 rounded">BP: {fullDetails.vitals.bp}</span>
            )}
            {fullDetails.vitals.pulse && (
              <span className="text-xs bg-muted/60 px-2 py-1 rounded">Pulse: {fullDetails.vitals.pulse}</span>
            )}
            {fullDetails.vitals.temp && (
              <span className="text-xs bg-muted/60 px-2 py-1 rounded">Temp: {fullDetails.vitals.temp}°F</span>
            )}
            {fullDetails.vitals.spo2 && (
              <span className="text-xs bg-muted/60 px-2 py-1 rounded">SpO2: {fullDetails.vitals.spo2}%</span>
            )}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Assessment</p>
          <p className="text-xs text-foreground leading-snug">
            {fullDetails.assessment || 'Not recorded'}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Labs</p>
          {fullDetails.labs && fullDetails.labs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {fullDetails.labs.map((lab, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal">{lab}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No labs ordered</p>
          )}
        </div>
      </div>

      <Separator className="mb-3" />

      {/* Section 4 — Plan */}
      <div className="mb-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-0.5">Plan / Advice</p>
        <p className="text-xs text-foreground leading-snug">
          {fullDetails.plan || 'No plan recorded'}
        </p>
      </div>

      {/* SOAP Note */}
      {fullDetails.soapNote && (
        <>
          <Separator className="mb-3" />
          <div className="mb-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">SOAP Note</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/30 p-2 rounded">
                <p className="text-[10px] text-muted-foreground/70 mb-0.5">Subjective</p>
                <p className="text-xs">{fullDetails.soapNote.subjective}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <p className="text-[10px] text-muted-foreground/70 mb-0.5">Objective</p>
                <p className="text-xs">{fullDetails.soapNote.objective}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <p className="text-[10px] text-muted-foreground/70 mb-0.5">Assessment</p>
                <p className="text-xs">{fullDetails.soapNote.assessment}</p>
              </div>
              <div className="bg-muted/30 p-2 rounded">
                <p className="text-[10px] text-muted-foreground/70 mb-0.5">Plan</p>
                <p className="text-xs">{fullDetails.soapNote.plan}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prescription */}
      {fullDetails.prescription && fullDetails.prescription.items.length > 0 && (
        <>
          <Separator className="mb-3" />
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground/70 mb-2">Prescription</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Medicine</TableHead>
                  <TableHead className="text-xs text-center">Dosage</TableHead>
                  <TableHead className="text-xs text-center">Days</TableHead>
                  <TableHead className="text-xs text-center">Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fullDetails.prescription.items.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{item.medicineName}</TableCell>
                    <TableCell className="text-sm text-center">{item.dosage}</TableCell>
                    <TableCell className="text-sm text-center">{item.days}</TableCell>
                    <TableCell className="text-sm text-center">{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
