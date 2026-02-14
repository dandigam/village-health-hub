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
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">Visit #{visit.visitNumber}</h3>
          <p className="text-xs text-muted-foreground">
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
      <div className="grid grid-cols-3 gap-4 mb-5">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Visit Date</p>
          <p className="text-sm font-medium">
            {new Date(fullDetails.visitDate).toLocaleDateString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Camp</p>
          <p className="text-sm font-medium">{fullDetails.campName}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Location</p>
          <p className="text-sm font-medium">{fullDetails.campLocation}</p>
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Section 2 — Payment */}
      <div className="flex items-center gap-4 flex-wrap mb-5">
        <Badge variant={fullDetails.paymentType === 'Free' ? 'secondary' : 'default'} className="text-xs">
          {fullDetails.paymentType}
        </Badge>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-muted-foreground">Total: <span className="text-foreground font-medium">₹{fullDetails.totalAmount}</span></span>
          <span className="text-stat-green-text font-medium">Paid: ₹{fullDetails.paidAmount}</span>
          {fullDetails.pendingAmount > 0 && (
            <span className="text-destructive font-medium">Pending: ₹{fullDetails.pendingAmount}</span>
          )}
          {fullDetails.discountAmount > 0 && (
            <span className="text-stat-blue-text">Discount: ₹{fullDetails.discountAmount}</span>
          )}
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Section 3 — Clinical Summary */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-5">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Chief Complaint</p>
          <p className="text-sm text-foreground leading-relaxed">
            {fullDetails.chiefComplaint || 'Not recorded'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Vitals</p>
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
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Assessment</p>
          <p className="text-sm text-foreground leading-relaxed">
            {fullDetails.assessment || 'Not recorded'}
          </p>
        </div>
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Labs</p>
          {fullDetails.labs && fullDetails.labs.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {fullDetails.labs.map((lab, i) => (
                <Badge key={i} variant="outline" className="text-xs font-normal">{lab}</Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No labs ordered</p>
          )}
        </div>
      </div>

      <Separator className="mb-5" />

      {/* Section 4 — Plan */}
      <div className="mb-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Plan / Advice</p>
        <p className="text-sm text-foreground leading-relaxed">
          {fullDetails.plan || 'No plan recorded'}
        </p>
      </div>

      {/* SOAP Note */}
      {fullDetails.soapNote && (
        <>
          <Separator className="mb-5" />
          <div className="mb-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">SOAP Note</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/40 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Subjective</p>
                <p className="text-sm">{fullDetails.soapNote.subjective}</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Objective</p>
                <p className="text-sm">{fullDetails.soapNote.objective}</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Assessment</p>
                <p className="text-sm">{fullDetails.soapNote.assessment}</p>
              </div>
              <div className="bg-muted/40 p-3 rounded-md">
                <p className="text-xs text-muted-foreground mb-1">Plan</p>
                <p className="text-sm">{fullDetails.soapNote.plan}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Prescription */}
      {fullDetails.prescription && fullDetails.prescription.items.length > 0 && (
        <>
          <Separator className="mb-5" />
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Prescription</p>
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
