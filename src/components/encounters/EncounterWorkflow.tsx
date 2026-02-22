import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { EncounterPatient } from '@/pages/encounters/Encounters';
import { useMedicines, useStockItems } from '@/hooks/useApiData';
import { PatientHistoryPanel } from './PatientHistoryPanel';
import {
  Activity,
  Stethoscope,
  FileText,
  Pill,
  Check,
  ChevronRight,
  Upload,
  Save,
  RotateCcw,
  ClipboardList,
  Search,
  Trash2,
  Send,
  AlertTriangle,
} from 'lucide-react';

interface EncounterWorkflowProps {
  encounter: EncounterPatient;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Vitals & Reason', icon: Activity },
  { id: 2, label: 'SOAP Notes', icon: FileText },
  { id: 3, label: 'At Doctor', icon: Stethoscope },
  { id: 4, label: 'Prescription', icon: Pill },
  { id: 5, label: 'Review', icon: ClipboardList },
];

// ─── Form Data Types ─────────────────────────────────────────
interface VitalsData {
  bp: string;
  temp: string;
  pulse: string;
  weight: string;
  height: string;
  spo2: string;
  chiefComplaint: string;
  nurseNotes: string;
}

interface SOAPData {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

interface ConsultationData {
  observations: string;
  diagnosis: string;
  recommendations: string;
  labTests: string;
  followUp: string;
}

interface PrescriptionMed {
  id: string;
  name: string;
  m: number;
  a: number;
  n: number;
  days: number;
  qty: number;
  stockAvailable: number;
}

export function EncounterWorkflow({ encounter, onStepChange, onComplete }: EncounterWorkflowProps) {
  const [activeStep, setActiveStep] = useState(encounter.currentStep || 1);

  // Shared form state
  const [vitals, setVitals] = useState<VitalsData>({
    bp: '', temp: '', pulse: '', weight: '', height: '', spo2: '',
    chiefComplaint: '', nurseNotes: '',
  });
  const [soap, setSOAP] = useState<SOAPData>({
    subjective: '', objective: '', assessment: '', plan: '',
  });
  const [consultation, setConsultation] = useState<ConsultationData>({
    observations: '', diagnosis: '', recommendations: '', labTests: '', followUp: '',
  });
  const [meds, setMeds] = useState<PrescriptionMed[]>([
    { id: 'rx-1', name: 'PARACETAMOL 500 MG', m: 1, a: 1, n: 1, days: 5, qty: 15, stockAvailable: 1000 },
    { id: 'rx-2', name: 'OMEPRAZOLE 20 MG', m: 1, a: 0, n: 0, days: 10, qty: 10, stockAvailable: 350 },
  ]);

  const handleStep = (step: number) => {
    setActiveStep(step);
    onStepChange(step);
  };

  const isCompleted = encounter.status === 'completed';

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      {/* Patient Header */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {encounter.patient.photoUrl ? (
            <img src={encounter.patient.photoUrl} alt="" className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border shrink-0" />
          ) : (
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
              {(encounter.patient.name || encounter.patient.firstName || '').charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">{encounter.patient.name || encounter.patient.firstName || ''} {encounter.patient.surname || encounter.patient.lastName || ''}</p>
              {encounter.isReturning && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.08)] shrink-0">
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                  Returning
                </Badge>
              )}
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground truncate">
              {encounter.patient.age}Y • {encounter.patient.gender} • {encounter.patient.patientId}
              <span className="hidden sm:inline"> • {encounter.patient.village}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <Button variant="outline" size="sm" className="h-7 text-[10px] sm:text-xs px-2 sm:px-3">
            <Save className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Save</span>
          </Button>
          {!isCompleted && activeStep === 4 && (
            <Button size="sm" className="h-7 text-[10px] sm:text-xs bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white px-2 sm:px-3" onClick={onComplete}>
              <Send className="h-3 w-3 sm:mr-1" />
              <span className="hidden sm:inline">Send to Pharmacy</span>
              <span className="sm:hidden">Send</span>
            </Button>
          )}
        </div>
      </div>

      {/* Patient Medical History (collapsible) */}
      <PatientHistoryPanel patientId={encounter.patient.id} />

      {/* Stepper */}
      <div className="px-2 sm:px-4 py-2 border-b bg-muted/30 overflow-x-auto">
        <div className="flex items-center gap-0.5 sm:gap-1 min-w-max">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id || isCompleted;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStep(step.id)}
                  className={cn(
                    'flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium transition-all whitespace-nowrap',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isDone
                        ? 'text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.08)]'
                        : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {isDone && !isActive ? (
                    <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  ) : (
                    <step.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  <span className="sm:hidden">{step.label.split(' ')[0]}</span>
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-muted-foreground/40 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeStep === 1 && <VitalsStep data={vitals} onChange={setVitals} />}
          {activeStep === 2 && <SOAPStep data={soap} onChange={setSOAP} />}
          {activeStep === 3 && <ConsultationStep data={consultation} onChange={setConsultation} />}
          {activeStep === 4 && <PrescriptionStep meds={meds} setMeds={setMeds} />}
          {activeStep === 5 && <ReviewStep vitals={vitals} soap={soap} consultation={consultation} meds={meds} />}
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div className="px-3 sm:px-4 py-2 sm:py-2.5 border-t bg-muted/20 flex items-center justify-between gap-2">
        <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs" disabled={activeStep <= 1} onClick={() => handleStep(activeStep - 1)}>
          Previous
        </Button>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs hidden sm:flex">
            <Save className="h-3 w-3 mr-1" />
            Save Visit
          </Button>
          {activeStep < 5 ? (
            <Button size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs" onClick={() => handleStep(activeStep + 1)}>
              Next
              <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-7 sm:h-8 text-[10px] sm:text-xs bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white" onClick={onComplete}>
              <Send className="h-3 w-3 mr-1" />
              Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Vitals ──────────────────────────────────────────
function VitalsStep({ data, onChange }: { data: VitalsData; onChange: (d: VitalsData) => void }) {
  const update = (field: keyof VitalsData, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Vitals</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          {([
            { label: 'BP (mmHg)', field: 'bp' as const, placeholder: '120/80' },
            { label: 'Temp (°F)', field: 'temp' as const, placeholder: '98.6' },
            { label: 'Pulse (bpm)', field: 'pulse' as const, placeholder: '72' },
            { label: 'Weight (kg)', field: 'weight' as const, placeholder: '65' },
            { label: 'Height (cm)', field: 'height' as const, placeholder: '170' },
            { label: 'SpO2 (%)', field: 'spo2' as const, placeholder: '98' },
          ]).map(v => (
            <div key={v.label}>
              <Label className="text-[11px] text-muted-foreground">{v.label}</Label>
              <Input className="h-8 text-sm mt-1" placeholder={v.placeholder} value={data[v.field]} onChange={(e) => update(v.field, e.target.value)} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Chief Complaint / Reason for Visit</Label>
        <Textarea className="mt-1 min-h-[60px] text-sm" placeholder="Describe the patient's primary complaint..." value={data.chiefComplaint} onChange={(e) => update('chiefComplaint', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Nurse Notes (Optional)</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Additional observations..." value={data.nurseNotes} onChange={(e) => update('nurseNotes', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] text-muted-foreground">Upload Lab Reports / Images</Label>
        <div className="mt-1 border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/30 transition-colors cursor-pointer">
          <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-1.5">Drop files or click to upload</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: SOAP Notes ──────────────────────────────────────
function SOAPStep({ data, onChange }: { data: SOAPData; onChange: (d: SOAPData) => void }) {
  const update = (field: keyof SOAPData, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      {([
        { label: 'Subjective', field: 'subjective' as const, placeholder: 'Patient reports...' },
        { label: 'Objective', field: 'objective' as const, placeholder: 'On examination...' },
        { label: 'Assessment', field: 'assessment' as const, placeholder: 'Clinical impression...' },
        { label: 'Plan', field: 'plan' as const, placeholder: 'Treatment plan...' },
      ]).map(s => (
        <div key={s.label}>
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</Label>
          <Textarea className="mt-1 min-h-[70px] text-sm" placeholder={s.placeholder} value={data[s.field]} onChange={(e) => update(s.field, e.target.value)} />
        </div>
      ))}
      <div>
        <Label className="text-[11px] text-muted-foreground">Attach Documents</Label>
        <div className="mt-1 border-2 border-dashed rounded-lg p-3 text-center hover:bg-muted/30 transition-colors cursor-pointer">
          <Upload className="h-4 w-4 mx-auto text-muted-foreground" />
          <p className="text-[10px] text-muted-foreground mt-1">Images, lab results, documents</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: At Doctor ───────────────────────────────────────
function ConsultationStep({ data, onChange }: { data: ConsultationData; onChange: (d: ConsultationData) => void }) {
  const update = (field: keyof ConsultationData, value: string) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Observations</Label>
        <Textarea className="mt-1 min-h-[70px] text-sm" placeholder="Clinical findings and observations..." value={data.observations} onChange={(e) => update('observations', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Diagnosis</Label>
        <Input className="h-8 text-sm mt-1" placeholder="Add diagnosis..." value={data.diagnosis} onChange={(e) => update('diagnosis', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Instructions and recommendations..." value={data.recommendations} onChange={(e) => update('recommendations', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Tests Ordered</Label>
        <Input className="h-8 text-sm mt-1" placeholder="e.g., CBC, Lipid Profile, ECG..." value={data.labTests} onChange={(e) => update('labTests', e.target.value)} />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Follow-up</Label>
        <Input className="h-8 text-sm mt-1" placeholder="e.g., 2 weeks" value={data.followUp} onChange={(e) => update('followUp', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 4: Prescription ────────────────────────────────────
function PrescriptionStep({ meds, setMeds }: { meds: PrescriptionMed[]; setMeds: (m: PrescriptionMed[]) => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();

  const availableMedicines = useMemo(() => {
    return medicines.map(medicine => {
      const stockItem = stockItems.find(s => s.medicineId === medicine.id);
      return { id: medicine.id, name: medicine.name, category: medicine.category, qtyAvailable: stockItem?.quantity || 0 };
    });
  }, [medicines, stockItems]);

  const filteredMedicines = useMemo(() => {
    if (!searchQuery) return availableMedicines;
    return availableMedicines.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [availableMedicines, searchQuery]);

  const addMedicine = (medicine: typeof availableMedicines[0]) => {
    if (meds.some(item => item.name === medicine.name)) {
      setSearchOpen(false);
      setSearchQuery('');
      return;
    }
    const newMed: PrescriptionMed = {
      id: `rx-${Date.now()}`,
      name: medicine.name,
      m: 1, a: 0, n: 1, days: 7,
      qty: 14,
      stockAvailable: medicine.qtyAvailable,
    };
    setMeds([...meds, newMed]);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const updateMed = (index: number, field: 'm' | 'a' | 'n' | 'days', value: number) => {
    const updated = [...meds];
    updated[index] = { ...updated[index], [field]: value };
    updated[index].qty = (updated[index].m + updated[index].a + updated[index].n) * updated[index].days;
    setMeds(updated);
  };

  const removeMed = (index: number) => {
    setMeds(meds.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Add Medicine</Label>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-muted-foreground h-8 text-sm">
              <Search className="mr-2 h-3.5 w-3.5" />
              Search medicine by name or code...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-0 bg-popover border shadow-lg" align="start">
            <Command className="bg-transparent">
              <CommandInput placeholder="Search medicine..." value={searchQuery} onValueChange={setSearchQuery} className="h-9 text-sm" />
              <CommandList className="max-h-[280px]">
                <CommandEmpty className="py-4 text-center text-xs text-muted-foreground">No medicine found.</CommandEmpty>
                <CommandGroup heading="Available Medicines" className="[&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:font-semibold">
                  {filteredMedicines.map((medicine) => {
                    const isAdded = meds.some(item => item.name === medicine.name);
                    return (
                      <CommandItem
                        key={medicine.id}
                        value={medicine.name}
                        onSelect={() => addMedicine(medicine)}
                        disabled={isAdded}
                        className={cn(
                          "flex items-center justify-between py-2 px-3 rounded-md cursor-pointer",
                          isAdded && "opacity-40 cursor-not-allowed"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{medicine.name}</p>
                            <p className="text-[10px] text-muted-foreground">{medicine.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-medium px-2 py-0.5 rounded-full",
                            medicine.qtyAvailable > 50
                              ? "bg-muted text-foreground"
                              : medicine.qtyAvailable > 0
                                ? "bg-muted text-muted-foreground"
                                : "bg-destructive/10 text-destructive"
                          )}>
                            Stock: {medicine.qtyAvailable}
                          </span>
                          {isAdded && <span className="text-[10px] text-muted-foreground italic">Added</span>}
                        </div>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {meds.length > 0 && (
        <div className="border rounded-lg overflow-x-auto">
          <div className="grid grid-cols-[minmax(120px,1fr)_40px_40px_40px_50px_50px_32px] sm:grid-cols-[1fr_44px_44px_44px_56px_56px_32px] gap-0 bg-muted/50 px-2 sm:px-3 py-1.5 text-[9px] sm:text-[10px] font-medium text-muted-foreground uppercase tracking-wider min-w-[420px]">
            <span>Medicine</span>
            <span className="text-center">M</span>
            <span className="text-center">A</span>
            <span className="text-center">N</span>
            <span className="text-center">Days</span>
            <span className="text-center">Qty</span>
            <span></span>
          </div>
          {meds.map((med, i) => {
            const exceedsStock = med.qty > med.stockAvailable;
            return (
              <div key={med.id} className={cn(
                "grid grid-cols-[minmax(120px,1fr)_40px_40px_40px_50px_50px_32px] sm:grid-cols-[1fr_44px_44px_44px_56px_56px_32px] gap-0 px-2 sm:px-3 py-1.5 border-t text-sm items-center group min-w-[420px]",
                exceedsStock && "bg-destructive/5"
              )}>
                <div className="min-w-0">
                  <span className="truncate text-[10px] sm:text-xs font-medium block">{med.name}</span>
                  {exceedsStock && (
                    <span className="flex items-center gap-1 text-[9px] sm:text-[10px] text-destructive mt-0.5">
                      <AlertTriangle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Short by {med.qty - med.stockAvailable}
                    </span>
                  )}
                </div>
                <Input type="number" min={0} max={9} value={med.m} onChange={(e) => updateMed(i, 'm', Number(e.target.value))} className="h-6 sm:h-7 w-9 sm:w-10 text-center text-[10px] sm:text-xs mx-auto p-0" />
                <Input type="number" min={0} max={9} value={med.a} onChange={(e) => updateMed(i, 'a', Number(e.target.value))} className="h-6 sm:h-7 w-9 sm:w-10 text-center text-[10px] sm:text-xs mx-auto p-0" />
                <Input type="number" min={0} max={9} value={med.n} onChange={(e) => updateMed(i, 'n', Number(e.target.value))} className="h-6 sm:h-7 w-9 sm:w-10 text-center text-[10px] sm:text-xs mx-auto p-0" />
                <Input type="number" min={1} max={365} value={med.days} onChange={(e) => updateMed(i, 'days', Number(e.target.value))} className="h-6 sm:h-7 w-10 sm:w-12 text-center text-[10px] sm:text-xs mx-auto p-0" />
                <span className={cn("text-center text-[10px] sm:text-xs font-semibold", exceedsStock && "text-destructive")}>{med.qty}</span>
                <Button variant="ghost" size="icon" className="h-5 w-5 sm:h-6 sm:w-6 opacity-60 sm:opacity-0 sm:group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMed(i)}>
                  <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Send className="h-3 w-3 mr-1" />
          Send to Pharmacy
        </Button>
      </div>
    </div>
  );
}

// ─── Step 5: Review (Dynamic) ────────────────────────────────
function ReviewStep({ vitals, soap, consultation, meds }: {
  vitals: VitalsData;
  soap: SOAPData;
  consultation: ConsultationData;
  meds: PrescriptionMed[];
}) {
  const vitalsText = [
    vitals.bp && `BP: ${vitals.bp}`,
    vitals.temp && `Temp: ${vitals.temp}°F`,
    vitals.pulse && `Pulse: ${vitals.pulse}`,
    vitals.weight && `Weight: ${vitals.weight}kg`,
    vitals.height && `Height: ${vitals.height}cm`,
    vitals.spo2 && `SpO2: ${vitals.spo2}%`,
  ].filter(Boolean).join(', ');

  const prescriptionText = meds.map(m =>
    `${m.name} (${m.m}-${m.a}-${m.n} x ${m.days}d = ${m.qty})`
  ).join(', ');

  const sections = [
    { label: 'Vitals', value: vitalsText, icon: Activity },
    { label: 'Chief Complaint', value: vitals.chiefComplaint, icon: FileText },
    { label: 'SOAP - Subjective', value: soap.subjective, icon: FileText },
    { label: 'SOAP - Assessment', value: soap.assessment, icon: FileText },
    { label: 'Diagnosis', value: consultation.diagnosis, icon: Stethoscope },
    { label: 'Recommendations', value: consultation.recommendations, icon: ClipboardList },
    { label: 'Lab Tests', value: consultation.labTests, icon: Activity },
    { label: 'Prescription', value: prescriptionText, icon: Pill },
    { label: 'Follow-up', value: consultation.followUp, icon: Stethoscope },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Visit Summary</h3>
      <div className="space-y-3">
        {sections.map(item => {
          const hasValue = !!item.value;
          return (
            <div key={item.label} className="border rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <item.icon className="h-3 w-3 text-muted-foreground" />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              </div>
              <p className={cn("text-xs", hasValue ? "text-foreground" : "text-muted-foreground/50 italic")}>
                {hasValue ? item.value : 'Not recorded'}
              </p>
            </div>
          );
        })}
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground">Doctor's Final Notes</Label>
        <Textarea className="mt-1 min-h-[60px] text-sm" placeholder="Any additional notes before completing the visit..." />
      </div>
    </div>
  );
}
