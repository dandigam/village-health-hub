import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  X,
  Stethoscope,
  Save,
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

const mockDoctors = [
  'Dr. Ramesh Naidu',
  'Dr. Priya Sharma',
  'Dr. Venkat Rao',
];

const visitTypes = ['Consultation', 'Follow-up', 'Routine Check'];
const visitLocations = ['Clinic Room A', 'Clinic Room B', 'Field Camp', 'Mobile Unit'];

export function PatientQuickViewModal({ patient, open, onOpenChange, currentStatus }: PatientQuickViewModalProps) {
  const navigate = useNavigate();
  const [visitType, setVisitType] = useState('Consultation');
  const [assignedDoctor, setAssignedDoctor] = useState(mockDoctors[0]);
  const [visitLocation, setVisitLocation] = useState('Clinic Room A');
  const [chiefComplaint, setChiefComplaint] = useState('');

  // Vitals state
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');

  if (!patient) return null;

  const displayName = patient.firstName
    ? `${patient.firstName} ${patient.lastName || patient.surname || ''}`
    : `${patient.name} ${patient.surname || ''}`;

  const dob = patient.createdAt
    ? new Date(patient.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit' })
    : 'N/A';

  const handleSaveVisit = () => {
    onOpenChange(false);
    navigate('/encounters');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl border border-border shadow-2xl gap-0">
        {/* Compact Header */}
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold text-foreground">
              Create New Visit (Patient: {displayName.trim()})
            </DialogTitle>
          </div>
        </DialogHeader>

        {/* Patient Summary Bar */}
        <div className="px-5 py-3 bg-muted/50 border-b border-border flex items-center gap-3">
          <Avatar className="h-10 w-10 border-2 border-primary/20">
            <AvatarImage src={patient.photoUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
              {(patient.firstName || patient.name || '').charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground leading-tight">{displayName.trim()}</p>
            <p className="text-xs text-muted-foreground">
              MR#: {patient.patientId}, DOB: {dob} ({patient.gender?.charAt(0) || 'M'}).
            </p>
          </div>
        </div>

        {/* Body — Two Column Layout */}
        <div className="px-5 py-4 grid grid-cols-[1fr_auto_1fr] gap-0 max-h-[60vh] overflow-y-auto">
          {/* Left Column — Visit Details */}
          <div className="space-y-3.5 pr-5">
            <h3 className="text-sm font-semibold text-foreground">Visit Details</h3>

            {/* Visit Type & Assigned Provider — side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Visit Type</Label>
                <Select value={visitType} onValueChange={setVisitType}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {visitTypes.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Assigned Provider</Label>
                <Select value={assignedDoctor} onValueChange={setAssignedDoctor}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDoctors.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Date</Label>
              <Input
                type="date"
                defaultValue={new Date().toISOString().split('T')[0]}
                className="h-9 text-sm"
              />
            </div>

            {/* Chief Complaint */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Chief Complaint</Label>
              <Textarea
                placeholder="Patient presents with..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="min-h-[80px] text-sm resize-none"
              />
            </div>

            {/* Visit Location */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Visit Location</Label>
              <Select value={visitLocation} onValueChange={setVisitLocation}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {visitLocations.map(l => (
                    <SelectItem key={l} value={l}>{l}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vertical Divider */}
          <Separator orientation="vertical" className="mx-0" />

          {/* Right Column — Initial Assessment (Vitals) */}
          <div className="space-y-3.5 pl-5">
            <h3 className="text-sm font-semibold text-foreground">Initial Assessment (Vitals)</h3>

            {/* Weight */}
            <VitalRow
              label="Weight"
              value={weight}
              onChange={setWeight}
              unit={weightUnit}
              units={['kg', 'lbs'] as const}
              onUnitChange={(u) => setWeightUnit(u as 'kg' | 'lbs')}
            />

            {/* Height */}
            <VitalRow
              label="Height"
              value={height}
              onChange={setHeight}
              unit={heightUnit}
              units={['cm', 'in'] as const}
              onUnitChange={(u) => setHeightUnit(u as 'cm' | 'in')}
            />

            {/* Blood Pressure */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Blood Pressure</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">mmHg</span>
                <Button size="sm" className="h-9 px-3 text-xs font-semibold gap-1">
                  <Save className="h-3 w-3" /> Save
                </Button>
              </div>
            </div>

            {/* Temperature */}
            <VitalRow
              label="Temperature"
              value={temp}
              onChange={setTemp}
              unit={tempUnit}
              units={['C', 'F'] as const}
              onUnitChange={(u) => setTempUnit(u as 'C' | 'F')}
            />

            {/* Heart Rate */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Heart Rate</Label>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="72"
                  value={heartRate}
                  onChange={(e) => setHeartRate(e.target.value)}
                  className="h-9 text-sm flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">bpm</span>
                <Button size="sm" className="h-9 px-3 text-xs font-semibold gap-1">
                  <Save className="h-3 w-3" /> Save
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            className="h-9 px-5 text-sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="h-9 px-5 text-sm font-semibold gap-2 shadow-md shadow-primary/20"
            onClick={handleSaveVisit}
          >
            <Stethoscope className="h-4 w-4" /> Save Visit & Start Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface VitalRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  unit: string;
  units: readonly string[];
  onUnitChange: (u: string) => void;
}

function VitalRow({ label, value, onChange, unit, units, onUnitChange }: VitalRowProps) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        {units.length > 1 && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            {units.map((u, i) => (
              <button
                key={u}
                onClick={() => onUnitChange(u)}
                className={cn(
                  'px-1.5 py-0.5 rounded transition-colors',
                  unit === u
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'hover:bg-muted'
                )}
              >
                {u}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Input
          placeholder="—"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 text-sm flex-1"
        />
        <span className="text-xs text-muted-foreground w-8">{unit}</span>
        <Button size="sm" className="h-9 px-3 text-xs font-semibold gap-1">
          <Save className="h-3 w-3" /> Save
        </Button>
      </div>
    </div>
  );
}
