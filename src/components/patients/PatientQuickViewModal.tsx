import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  Phone,
  MapPin,
  Calendar,
  Stethoscope,
  Edit2,
  Eye,
  Heart,
  Activity,
  UserPlus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { Patient } from '@/types';

interface PatientQuickViewModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  'Waiting': { label: 'Waiting', className: 'bg-muted text-muted-foreground' },
  'At Doctor': { label: 'At Doctor', className: 'bg-stat-orange text-stat-orange-text' },
  'At Pharmacy': { label: 'At Pharmacy', className: 'bg-stat-teal text-stat-teal-text' },
  'At Cashier': { label: 'At Cashier', className: 'bg-stat-blue text-stat-blue-text' },
  'Completed': { label: 'Completed', className: 'bg-stat-green text-stat-green-text' },
  'registered': { label: 'Registered', className: 'bg-stat-blue text-stat-blue-text' },
  'in_progress': { label: 'In Progress', className: 'bg-stat-orange text-stat-orange-text' },
  'completed': { label: 'Completed', className: 'bg-stat-green text-stat-green-text' },
};

export function PatientQuickViewModal({ patient, open, onOpenChange, currentStatus }: PatientQuickViewModalProps) {
  const navigate = useNavigate();

  if (!patient) return null;

  const displayName = patient.firstName
    ? `${patient.firstName} ${patient.lastName || patient.surname || ''}`
    : `${patient.name} ${patient.surname || ''}`;

  const fatherName = patient.fatherSpouseName || patient.fatherName || '-';
  const phone = patient.phoneNumber || patient.phone || '-';
  const village = typeof patient.address === 'object'
    ? patient.address?.cityVillage || ''
    : patient.village || '';
  const district = typeof patient.address === 'object'
    ? patient.address?.district || ''
    : patient.district || '';

  const status = currentStatus || patient.status || 'Waiting';
  const sc = statusConfig[status] || statusConfig['Waiting'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-xl">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-primary/90 to-primary px-6 py-5 text-primary-foreground">
          <DialogHeader>
            <DialogTitle className="text-primary-foreground text-lg">Patient Details</DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-4 mt-4">
            <Avatar className="h-16 w-16 border-2 border-primary-foreground/30 shadow-lg">
              <AvatarImage src={patient.photoUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground text-xl font-bold">
                {(patient.firstName || patient.name || '').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{displayName.trim()}</h2>
              <div className="flex items-center gap-3 mt-1 text-sm text-primary-foreground/80">
                <span>MR#: {patient.patientId}</span>
                <span>•</span>
                <span>{patient.age} Yrs, {patient.gender}</span>
              </div>
            </div>
            <Badge className={cn('text-xs font-semibold px-3 py-1 rounded-full', sc.className)}>
              {sc.label}
            </Badge>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={User} label="Father / Spouse" value={fatherName} />
            <InfoItem icon={Phone} label="Phone" value={phone} />
            <InfoItem icon={MapPin} label="Village / City" value={village || '-'} />
            <InfoItem icon={MapPin} label="District" value={district || '-'} />
            <InfoItem icon={Calendar} label="Registered" value={
              patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : '-'
            } />
            <InfoItem icon={Heart} label="Marital Status" value={patient.maritalStatus || '-'} />
          </div>

          <Separator />

          {/* Medical Summary */}
          {patient.medicalHistory && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Activity className="h-3.5 w-3.5" /> Medical History
              </h4>
              <div className="flex flex-wrap gap-2">
                {patient.medicalHistory.conditions && patient.medicalHistory.conditions.length > 0
                  ? patient.medicalHistory.conditions.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {c}
                      </Badge>
                    ))
                  : <span className="text-sm text-muted-foreground">No known conditions</span>
                }
              </div>
            </div>
          )}

          {/* Payment Info */}
          {patient.paymentType && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Payment</span>
                <Badge variant={patient.paymentType === 'Free' ? 'secondary' : 'default'} className="text-xs">
                  {patient.paymentType}
                  {patient.paymentPercentage && patient.paymentPercentage < 100 && ` (${patient.paymentPercentage}%)`}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-muted/30 border-t flex items-center justify-between gap-3">
          <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); navigate(`/patients/${patient.id}/edit`); }}>
            <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit Patient
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { onOpenChange(false); navigate(`/patients/${patient.id}`); }}>
              <Eye className="h-3.5 w-3.5 mr-1.5" /> View History
            </Button>
            <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => { onOpenChange(false); navigate('/encounters'); }}>
              <Stethoscope className="h-3.5 w-3.5 mr-1.5" /> Start Encounter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 p-1.5 rounded-md bg-primary/5">
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium">{label}</p>
        <p className="text-sm font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
