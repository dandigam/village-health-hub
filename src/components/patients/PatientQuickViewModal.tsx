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
  Droplets,
  Thermometer,
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
  'Waiting': { label: 'Waiting', className: 'bg-white/20 text-white border-white/30' },
  'At Doctor': { label: 'At Doctor', className: 'bg-stat-orange text-stat-orange-text' },
  'At Pharmacy': { label: 'At Pharmacy', className: 'bg-stat-teal text-stat-teal-text' },
  'At Cashier': { label: 'At Cashier', className: 'bg-stat-blue text-stat-blue-text' },
  'Completed': { label: 'Completed', className: 'bg-stat-green text-stat-green-text' },
  'registered': { label: 'Registered', className: 'bg-white/20 text-white border-white/30' },
  'in_progress': { label: 'In Progress', className: 'bg-stat-orange text-stat-orange-text' },
  'completed': { label: 'Completed', className: 'bg-stat-green text-stat-green-text' },
};

export function PatientQuickViewModal({ patient, open, onOpenChange, currentStatus }: PatientQuickViewModalProps) {
  const navigate = useNavigate();

  if (!patient) return null;

  const displayName = patient.firstName
    ? `${patient.firstName} ${patient.lastName || patient.surname || ''}`
    : `${patient.name} ${patient.surname || ''}`;

  const fatherName = patient.fatherSpouseName || patient.fatherName || null;
  const phone = patient.phoneNumber || patient.phone || null;
  const village = typeof patient.address === 'object'
    ? patient.address?.cityVillage || ''
    : patient.village || '';
  const district = typeof patient.address === 'object'
    ? patient.address?.district || ''
    : patient.district || '';

  const status = currentStatus || patient.status || 'registered';
  const sc = statusConfig[status] || statusConfig['registered'];

  // Mock last vitals — in production, fetch from encounter data
  const lastVitals = patient.medicalHistory ? {
    bp: '120/80',
    pulse: '72',
    spo2: '98%',
  } : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Hero Header */}
        <div className="bg-gradient-to-br from-primary via-primary to-primary/80 px-6 pt-6 pb-5 text-primary-foreground relative overflow-hidden">
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-[0.04]" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '20px 20px'
          }} />
          
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-primary-foreground/80 text-sm font-medium tracking-wide uppercase">
              Patient Details
            </DialogTitle>
          </DialogHeader>

          <div className="flex items-center gap-4 mt-3 relative z-10">
            <Avatar className="h-[72px] w-[72px] border-[3px] border-white/25 shadow-xl ring-2 ring-white/10">
              <AvatarImage src={patient.photoUrl || undefined} alt={displayName} />
              <AvatarFallback className="bg-white/15 text-primary-foreground text-2xl font-bold backdrop-blur-sm">
                {(patient.firstName || patient.name || '').charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate leading-tight">{displayName.trim()}</h2>
              <p className="text-sm text-primary-foreground/70 mt-0.5 font-medium">
                MR#: {patient.patientId}
              </p>
              {/* Age & Gender — made prominent per feedback */}
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-base font-semibold text-primary-foreground">
                  {patient.age} Yrs
                </span>
                <span className="text-primary-foreground/40">•</span>
                <span className="text-base font-semibold text-primary-foreground">
                  {patient.gender}
                </span>
              </div>
            </div>
            <Badge className={cn(
              'text-xs font-semibold px-3.5 py-1.5 rounded-full border shadow-sm',
              sc.className
            )}>
              {sc.label}
            </Badge>
          </div>
        </div>

        {/* Body — Info Grid */}
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-4">
            {fatherName && <InfoItem icon={User} label="Father / Spouse" value={fatherName} />}
            {phone && <InfoItem icon={Phone} label="Phone" value={phone} />}
            {village && <InfoItem icon={MapPin} label="Village / City" value={village} />}
            {district && <InfoItem icon={MapPin} label="District" value={district} />}
            <InfoItem icon={Calendar} label="Registered" value={
              patient.createdAt
                ? new Date(patient.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                : 'Not Available'
            } />
            {patient.maritalStatus && patient.maritalStatus !== '-' && (
              <InfoItem icon={Heart} label="Marital Status" value={patient.maritalStatus} />
            )}
          </div>

          {/* Last Visit Vitals — new section per feedback */}
          {lastVitals && (
            <>
              <Separator />
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Last Visit Vitals
                </h4>
                <div className="flex items-center gap-3">
                  <VitalChip icon={Droplets} label="BP" value={lastVitals.bp} color="text-red-500 bg-red-50 dark:bg-red-950/30" />
                  <VitalChip icon={Heart} label="Pulse" value={lastVitals.pulse} color="text-blue-500 bg-blue-50 dark:bg-blue-950/30" />
                  <VitalChip icon={Thermometer} label="SpO2" value={lastVitals.spo2} color="text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30" />
                </div>
              </div>
            </>
          )}

          {/* Medical conditions */}
          {patient.medicalHistory?.conditions && patient.medicalHistory.conditions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <Activity className="h-3.5 w-3.5" /> Known Conditions
                </h4>
                <div className="flex flex-wrap gap-2">
                  {patient.medicalHistory.conditions.map((c, i) => (
                    <Badge key={i} variant="outline" className="text-xs font-medium">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Payment */}
          {patient.paymentType && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Payment</span>
                <Badge variant={patient.paymentType === 'Free' ? 'secondary' : 'default'} className="text-xs">
                  {patient.paymentType}
                  {patient.paymentPercentage && patient.paymentPercentage < 100 && ` (${patient.paymentPercentage}%)`}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* Footer — evenly spaced buttons per feedback */}
        <div className="px-6 py-4 bg-muted/30 border-t flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-sm font-medium gap-2"
            onClick={() => { onOpenChange(false); navigate(`/patients/${patient.id}/edit`); }}
          >
            <Edit2 className="h-4 w-4" /> Edit Patient
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-10 text-sm font-medium gap-2"
            onClick={() => { onOpenChange(false); navigate(`/patients/${patient.id}`); }}
          >
            <Eye className="h-4 w-4" /> View History
          </Button>
          <Button
            size="sm"
            className="flex-1 h-10 text-sm font-semibold gap-2 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
            onClick={() => { onOpenChange(false); navigate('/encounters'); }}
          >
            <Stethoscope className="h-4 w-4" /> Start Encounter
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 p-2 rounded-lg bg-primary/8 dark:bg-primary/15">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground font-medium leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-foreground truncate">{value}</p>
      </div>
    </div>
  );
}

function VitalChip({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium', color)}>
      <Icon className="h-3.5 w-3.5" />
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
