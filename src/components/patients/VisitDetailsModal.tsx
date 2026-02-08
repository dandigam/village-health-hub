import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Visit } from './VisitTimeline';

interface VisitDetailsModalProps {
  visit: Visit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VisitDetailsModal({ visit, open, onOpenChange }: VisitDetailsModalProps) {
  if (!visit) return null;

  const { fullDetails } = visit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>Visit Details</span>
            <Badge variant="outline" className="font-normal">
              Visit #{visit.visitNumber}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Visit & Camp Details */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Visit & Camp Details</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground w-40">Visit Date</TableCell>
                  <TableCell>
                    {new Date(fullDetails.visitDate).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Camp Name</TableCell>
                  <TableCell>{fullDetails.campName}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Location</TableCell>
                  <TableCell>{fullDetails.campLocation}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </section>

          <Separator />

          {/* Payment Breakdown */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Payment Breakdown</h3>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground w-40">Payment Type</TableCell>
                  <TableCell>
                    <Badge variant={fullDetails.paymentType === 'Free' ? 'secondary' : 'default'}>
                      {fullDetails.paymentType}
                    </Badge>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Total Amount</TableCell>
                  <TableCell>₹{fullDetails.totalAmount}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium text-muted-foreground">Paid Amount</TableCell>
                  <TableCell className="text-stat-green-text font-medium">₹{fullDetails.paidAmount}</TableCell>
                </TableRow>
                {fullDetails.pendingAmount > 0 && (
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Pending Amount</TableCell>
                    <TableCell className="text-destructive font-medium">₹{fullDetails.pendingAmount}</TableCell>
                  </TableRow>
                )}
                {fullDetails.discountAmount > 0 && (
                  <TableRow>
                    <TableCell className="font-medium text-muted-foreground">Discount Applied</TableCell>
                    <TableCell className="text-stat-blue-text">₹{fullDetails.discountAmount}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </section>

          <Separator />

          {/* Chief Complaints */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Chief Complaints</h3>
            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
              {fullDetails.chiefComplaint || 'No complaints recorded'}
            </p>
          </section>

          <Separator />

          {/* Vitals */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Vitals</h3>
            <div className="grid grid-cols-5 gap-3">
              {fullDetails.vitals.weight && (
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="text-sm font-semibold">{fullDetails.vitals.weight} kg</p>
                </div>
              )}
              {fullDetails.vitals.bp && (
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">BP</p>
                  <p className="text-sm font-semibold">{fullDetails.vitals.bp}</p>
                </div>
              )}
              {fullDetails.vitals.pulse && (
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Pulse</p>
                  <p className="text-sm font-semibold">{fullDetails.vitals.pulse} bpm</p>
                </div>
              )}
              {fullDetails.vitals.temp && (
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Temp</p>
                  <p className="text-sm font-semibold">{fullDetails.vitals.temp}°F</p>
                </div>
              )}
              {fullDetails.vitals.spo2 && (
                <div className="bg-muted/50 p-3 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">SpO2</p>
                  <p className="text-sm font-semibold">{fullDetails.vitals.spo2}%</p>
                </div>
              )}
            </div>
          </section>

          <Separator />

          {/* Labs */}
          {fullDetails.labs && fullDetails.labs.length > 0 && (
            <>
              <section>
                <h3 className="text-sm font-semibold text-accent mb-3">Labs</h3>
                <div className="flex flex-wrap gap-2">
                  {fullDetails.labs.map((lab, index) => (
                    <Badge key={index} variant="outline">
                      {lab}
                    </Badge>
                  ))}
                </div>
              </section>
              <Separator />
            </>
          )}

          {/* Assessment */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Assessment</h3>
            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
              {fullDetails.assessment || 'No assessment recorded'}
            </p>
          </section>

          <Separator />

          {/* Plan */}
          <section>
            <h3 className="text-sm font-semibold text-accent mb-3">Plan</h3>
            <p className="text-sm text-foreground bg-muted/50 p-3 rounded-lg">
              {fullDetails.plan || 'No plan recorded'}
            </p>
          </section>

          {/* SOAP Notes */}
          {fullDetails.soapNote && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold text-accent mb-3">SOAP Note</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Subjective</p>
                    <p className="text-sm">{fullDetails.soapNote.subjective}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Objective</p>
                    <p className="text-sm">{fullDetails.soapNote.objective}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Assessment</p>
                    <p className="text-sm">{fullDetails.soapNote.assessment}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Plan</p>
                    <p className="text-sm">{fullDetails.soapNote.plan}</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* Prescription */}
          {fullDetails.prescription && fullDetails.prescription.items.length > 0 && (
            <>
              <Separator />
              <section>
                <h3 className="text-sm font-semibold text-accent mb-3">Prescription</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine</TableHead>
                      <TableHead className="text-center">Dosage</TableHead>
                      <TableHead className="text-center">Days</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fullDetails.prescription.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.medicineName}</TableCell>
                        <TableCell className="text-center">{item.dosage}</TableCell>
                        <TableCell className="text-center">{item.days}</TableCell>
                        <TableCell className="text-center">{item.quantity}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
