import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Stethoscope, CalendarIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { Patient } from '@/types';

interface PatientQuickViewModalProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentStatus?: string;
}

const mockDoctors = ['Dr. Ramesh Naidu', 'Dr. Priya Sharma', 'Dr. Venkat Rao'];
const visitTypes = ['Consultation', 'Follow-up', 'Routine Check'];
const visitLocations = ['Clinic Room A', 'Clinic Room B', 'Field Camp', 'Mobile Unit'];

export function PatientQuickViewModal({ patient, open, onOpenChange }: PatientQuickViewModalProps) {
  const navigate = useNavigate();
  const [visitType, setVisitType] = useState('Consultation');
  const [assignedDoctor, setAssignedDoctor] = useState(mockDoctors[0]);
  const [visitLocation, setVisitLocation] = useState('Clinic Room A');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bp, setBp] = useState('');
  const [temp, setTemp] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [spo2, setSpo2] = useState('');
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
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-xl border border-border shadow-2xl gap-0">
        {/* Header */}
        <DialogHeader className="px-5 pt-4 pb-3 border-b border-border bg-card">
          <DialogTitle className="text-base font-semibold text-foreground">
            Create New Visit (Patient: {displayName.trim()})
          </DialogTitle>
        </DialogHeader>

        {/* Patient Bar */}
        <div className="px-5 py-2.5 bg-muted/50 border-b border-border flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-primary/20">
            <AvatarImage src={patient.photoUrl || undefined} alt={displayName} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
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

        {/* Body — 3 Equal Columns: Visit Details | Provider & Schedule | Initial Assessment */}
        <div className="grid grid-cols-3 divide-x divide-border">
          {/* Col 1: Visit Details */}
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Visit Details</h3>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Visit Type</Label>
              <Select value={visitType} onValueChange={setVisitType}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {visitTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Location</Label>
              <Select value={visitLocation} onValueChange={setVisitLocation}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {visitLocations.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Chief Complaint</Label>
              <Textarea
                placeholder="Patient presents with..."
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                className="min-h-[72px] text-xs resize-none"
              />
            </div>
          </div>

          {/* Col 2: Provider & Schedule */}
          <div className="p-4 space-y-3">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Provider & Schedule</h3>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Assigned Provider</Label>
              <Select value={assignedDoctor} onValueChange={setAssignedDoctor}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {mockDoctors.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Visit Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full h-8 justify-start text-left text-xs font-normal',
                      !selectedDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                    {selectedDate ? format(selectedDate, 'dd-MM-yyyy') : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Col 3: Initial Assessment (Vitals) — compact */}
          <div className="p-4 space-y-2">
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wide">Initial Assessment</h3>

            <VitalInput label="Weight" value={weight} onChange={setWeight} unit={weightUnit} units={['kg','lbs'] as const} onUnitChange={u => setWeightUnit(u as 'kg'|'lbs')} placeholder="72" />
            <VitalInput label="Height" value={height} onChange={setHeight} unit={heightUnit} units={['cm','in'] as const} onUnitChange={u => setHeightUnit(u as 'cm'|'in')} placeholder="170" />
            <VitalInput label="BP" value={bp} onChange={setBp} fixedUnit="mmHg" placeholder="120/80" />
            <VitalInput label="Temp" value={temp} onChange={setTemp} unit={tempUnit} units={['C','F'] as const} onUnitChange={u => setTempUnit(u as 'C'|'F')} placeholder="98.6" />
            <VitalInput label="Heart Rate" value={heartRate} onChange={setHeartRate} fixedUnit="bpm" placeholder="72" />
            <VitalInput label="SpO2" value={spo2} onChange={setSpo2} fixedUnit="%" placeholder="98" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
          <Button variant="outline" size="sm" className="h-9 px-5 text-sm" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button size="sm" className="h-9 px-6 text-sm font-semibold gap-2 shadow-md shadow-primary/20" onClick={handleSaveVisit}>
            <Stethoscope className="h-4 w-4" /> Save Visit & Start Note
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ── Compact Vital Input ── */
interface VitalInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  fixedUnit?: string;
  unit?: string;
  units?: readonly string[];
  onUnitChange?: (u: string) => void;
}

function VitalInput({ label, value, onChange, placeholder, fixedUnit, unit, units, onUnitChange }: VitalInputProps) {
  return (
    <div className="flex items-center gap-2">
      <Label className="text-[11px] text-muted-foreground w-16 shrink-0">{label}</Label>
      <Input
        placeholder={placeholder || '—'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 text-xs flex-1"
      />
      {units && units.length > 1 && onUnitChange ? (
        <div className="flex items-center gap-0.5 shrink-0">
          {units.map(u => (
            <button
              key={u}
              onClick={() => onUnitChange(u)}
              className={cn(
                'px-1.5 py-0.5 rounded text-[10px] transition-colors',
                unit === u ? 'bg-primary text-primary-foreground font-semibold' : 'text-muted-foreground hover:bg-muted'
              )}
            >
              {u}
            </button>
          ))}
        </div>
      ) : (
        <span className="text-[10px] text-muted-foreground w-8 text-right shrink-0">{fixedUnit}</span>
      )}
    </div>
  );
}
