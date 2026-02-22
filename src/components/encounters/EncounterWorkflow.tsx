import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EncounterPatient } from '@/pages/encounters/Encounters';
import { useMedicines, useStockItems } from '@/hooks/useApiData';
import {
  MessageSquare, Activity, Stethoscope, Pill, Check, ChevronRight,
  Save, RotateCcw, ClipboardList, Search, Trash2, Send, AlertTriangle,
  Thermometer, Heart, Scale, Wind, Droplets, FlaskConical, ImageIcon,
} from 'lucide-react';

interface EncounterWorkflowProps {
  encounter: EncounterPatient;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Subject', sub: 'Chief Complaints', icon: MessageSquare },
  { id: 2, label: 'Objective', sub: 'Vitals / Labs', icon: Activity },
  { id: 3, label: 'Assessment', sub: 'Diagnosis', icon: Stethoscope },
  { id: 4, label: 'Plan', sub: 'Inside RX / Outside RX', icon: Pill },
  { id: 5, label: 'Summary', sub: 'Description', icon: ClipboardList },
];

// ─── Data Types ─────────────────────────────────────────
interface SubjectData {
  conditions: string[];
  presentingComplaints: string[];
  reasonForVisit: string[];
  recentSymptoms: string[];
  isTakingMedicines: boolean;
  isSmoking: boolean;
  isDrinking: boolean;
  additionalNotes: string;
}

interface LabTest {
  name: string;
  date: string;
  withMedicine: boolean;
  result: string;
}

interface ObjectData {
  weight: string;
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  labs: LabTest[];
}

interface AssessmentData {
  diagnoses: string[];
  followUpRequired: boolean;
  referralNeeded: boolean;
  chronicCondition: boolean;
  acuteCondition: boolean;
  needsLabWork: boolean;
  doctorNotes: string;
  comments: string;
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

interface PlanData {
  insideRx: PrescriptionMed[];
  outsideRx: string;
  imaging: string;
}

export function EncounterWorkflow({ encounter, onStepChange, onComplete }: EncounterWorkflowProps) {
  const [activeStep, setActiveStep] = useState(encounter.currentStep || 1);

  const [subject, setSubject] = useState<SubjectData>({
    conditions: [],
    presentingComplaints: [],
    reasonForVisit: [],
    recentSymptoms: [],
    isTakingMedicines: false,
    isSmoking: false,
    isDrinking: false,
    additionalNotes: '',
  });
  const [object, setObject] = useState<ObjectData>({
    weight: '', bp: '', pulse: '', temp: '', spo2: '',
    labs: [
      { name: 'BP', date: '', withMedicine: true, result: '' },
      { name: 'FBS', date: '', withMedicine: true, result: '' },
      { name: 'PPBS', date: '', withMedicine: false, result: '' },
      { name: 'HBA1C', date: '', withMedicine: true, result: '' },
      { name: 'RBS', date: '', withMedicine: false, result: '' },
      { name: 'CHL', date: '', withMedicine: false, result: '' },
      { name: 'LDL', date: '', withMedicine: false, result: '' },
      { name: 'HDL', date: '', withMedicine: false, result: '' },
    ],
  });
  const [assessment, setAssessment] = useState<AssessmentData>({
    diagnoses: [],
    followUpRequired: false, referralNeeded: false,
    chronicCondition: false, acuteCondition: false, needsLabWork: false,
    doctorNotes: '', comments: '',
  });
  const [plan, setPlan] = useState<PlanData>({
    insideRx: [
      { id: 'rx-1', name: 'PARACETAMOL 500 MG', m: 1, a: 1, n: 1, days: 5, qty: 15, stockAvailable: 1000 },
      { id: 'rx-2', name: 'OMEPRAZOLE 20 MG', m: 1, a: 0, n: 0, days: 10, qty: 10, stockAvailable: 350 },
    ],
    outsideRx: '',
    imaging: '',
  });

  const handleStep = (step: number) => {
    setActiveStep(step);
    onStepChange(step);
  };

  const isCompleted = encounter.status === 'completed';

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      {/* Patient Header */}
      <div className="px-3 sm:px-4 py-2 border-b flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {encounter.patient.photoUrl ? (
            <img src={encounter.patient.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover border shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground shrink-0">
              {(encounter.patient.name || encounter.patient.firstName || '').charAt(0)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                {encounter.patient.patientId} | {encounter.patient.name || encounter.patient.firstName || ''} {encounter.patient.surname || encounter.patient.lastName || ''} | {encounter.patient.gender} | {encounter.patient.age}
              </p>
              {encounter.isReturning && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.08)] shrink-0">
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" />Returning
                </Badge>
              )}
            </div>
            <p className="text-[10px] text-muted-foreground truncate">
              {encounter.patient.fatherSpouseName && `S/o ${encounter.patient.fatherSpouseName}`}
              {encounter.patient.village && `, ${encounter.patient.village}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2">
            <Save className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Save</span>
          </Button>
        </div>
      </div>

      {/* Stepper - matching reference layout */}
      <div className="border-b bg-muted/20">
        <div className="flex">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id || isCompleted;
            return (
              <button
                key={step.id}
                onClick={() => handleStep(step.id)}
                className={cn(
                  'flex-1 py-2 px-2 text-center border-b-2 transition-all',
                  isActive
                    ? 'border-primary bg-primary/5'
                    : isDone
                      ? 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.03)]'
                      : 'border-transparent hover:bg-muted/30'
                )}
              >
                <p className={cn('text-[11px] font-semibold', isActive ? 'text-primary' : isDone ? 'text-[hsl(var(--success))]' : 'text-muted-foreground')}>
                  {step.label}
                </p>
                <p className="text-[9px] text-muted-foreground">{step.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 sm:p-4">
          {activeStep === 1 && <SubjectStep data={subject} onChange={setSubject} />}
          {activeStep === 2 && <ObjectStep data={object} onChange={setObject} />}
          {activeStep === 3 && <AssessmentStep data={assessment} onChange={setAssessment} />}
          {activeStep === 4 && <PlanStep plan={plan} setPlan={setPlan} />}
          {activeStep === 5 && <ReviewStep subject={subject} object={object} assessment={assessment} plan={plan} />}
        </div>
      </ScrollArea>

      {/* Bottom Bar */}
      <div className="px-3 py-2 border-t bg-muted/20 flex items-center justify-between">
        <Button variant="outline" size="sm" className="h-7 text-[10px]" disabled={activeStep <= 1} onClick={() => handleStep(activeStep - 1)}>
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {activeStep < 5 ? (
            <Button size="sm" className="h-7 text-[10px]" onClick={() => handleStep(activeStep + 1)}>
              Next <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-7 text-[10px] bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white" onClick={onComplete}>
              <Send className="h-3 w-3 mr-1" /> Send to Pharmacy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 1: Subject (Chief Complaints)
// ═══════════════════════════════════════════════════════════
function SubjectStep({ data, onChange }: { data: SubjectData; onChange: (d: SubjectData) => void }) {
  const CONDITIONS = ['Diabetes', 'HTN', 'Seizures', 'Stroke', 'Asthma'];
  const COMPLAINTS = ['Wounds', 'Fatigue', 'Vision Changes', 'Polydipsia', 'Polyuria', 'Polyphagia'];
  const SYMPTOMS = ['Headache', 'Blurred vision', 'Chest pain', 'Shortness of breath', 'Tingling or Numbness'];
  const VISIT_REASONS = ['Routine check-up', 'High BP readings', 'Headache', 'Dizziness', 'Other'];

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  return (
    <div className="space-y-4">
      {/* Conditions checkboxes */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Conditions</Label>
        <div className="flex flex-wrap gap-3">
          {CONDITIONS.map(c => (
            <label key={c} className="flex items-center gap-1.5 cursor-pointer text-xs">
              <Checkbox checked={data.conditions.includes(c)} onCheckedChange={() => onChange({ ...data, conditions: toggleArray(data.conditions, c) })} />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Presenting Complaints */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Presenting Complaints
        </Label>
        <div className="flex flex-wrap gap-3 ml-1">
          {COMPLAINTS.map(c => (
            <label key={c} className="flex items-center gap-1.5 cursor-pointer text-xs">
              <Checkbox checked={data.presentingComplaints.includes(c)} onCheckedChange={() => onChange({ ...data, presentingComplaints: toggleArray(data.presentingComplaints, c) })} />
              {c}
            </label>
          ))}
        </div>
      </div>

      {/* Reason for visit */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          What is the reason for today's visit?
        </Label>
        <div className="flex flex-wrap gap-3 ml-1">
          {VISIT_REASONS.map(r => (
            <label key={r} className="flex items-center gap-1.5 cursor-pointer text-xs">
              <Checkbox checked={data.reasonForVisit.includes(r)} onCheckedChange={() => onChange({ ...data, reasonForVisit: toggleArray(data.reasonForVisit, r) })} />
              {r}
            </label>
          ))}
        </div>
      </div>

      {/* Recent symptoms */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
          Have you experienced any of the following recently?
        </Label>
        <div className="flex flex-wrap gap-3 ml-1">
          {SYMPTOMS.map(s => (
            <label key={s} className="flex items-center gap-1.5 cursor-pointer text-xs">
              <Checkbox checked={data.recentSymptoms.includes(s)} onCheckedChange={() => onChange({ ...data, recentSymptoms: toggleArray(data.recentSymptoms, s) })} />
              {s}
            </label>
          ))}
        </div>
      </div>

      {/* Yes/No questions */}
      <div className="space-y-2">
        {([
          { key: 'isTakingMedicines' as const, label: 'Are you taking medicines?' },
          { key: 'isSmoking' as const, label: 'Smoking' },
          { key: 'isDrinking' as const, label: 'Drinking' },
        ]).map(q => (
          <div key={q.key} className="flex items-center justify-between p-2 rounded border bg-background">
            <span className="text-xs">{q.label}</span>
            <div className="flex gap-1.5">
              <button type="button" className={cn('px-3 py-0.5 rounded text-[10px] font-medium border', data[q.key] ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted/50')} onClick={() => onChange({ ...data, [q.key]: true })}>Yes</button>
              <button type="button" className={cn('px-3 py-0.5 rounded text-[10px] font-medium border', !data[q.key] ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted/50')} onClick={() => onChange({ ...data, [q.key]: false })}>No</button>
            </div>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <Label className="text-[11px] text-muted-foreground">Additional Notes</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Any other observations..." value={data.additionalNotes} onChange={(e) => onChange({ ...data, additionalNotes: e.target.value })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 2: Objective (Vitals / Labs)
// ═══════════════════════════════════════════════════════════
function ObjectStep({ data, onChange }: { data: ObjectData; onChange: (d: ObjectData) => void }) {
  const updateVital = (field: keyof ObjectData, value: string) => onChange({ ...data, [field]: value });

  const updateLab = (index: number, field: keyof LabTest, value: any) => {
    const updated = [...data.labs];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, labs: updated });
  };

  const vitals = [
    { field: 'weight' as const, icon: Scale, label: 'Weight', unit: "Kg's", placeholder: '' },
    { field: 'bp' as const, icon: Droplets, label: 'BP', unit: 'mmHg', placeholder: '' },
    { field: 'pulse' as const, icon: Heart, label: 'Pulse', unit: '/min', placeholder: '' },
    { field: 'temp' as const, icon: Thermometer, label: 'Temp', unit: '°F', placeholder: '' },
    { field: 'spo2' as const, icon: Wind, label: 'SpO2', unit: '%', placeholder: '' },
  ];

  return (
    <div className="space-y-4">
      {/* Vitals row with icons */}
      <div className="flex flex-wrap gap-2">
        {vitals.map(v => (
          <div key={v.field} className="flex items-center gap-1.5 border rounded-lg px-2.5 py-2 bg-background min-w-[120px]">
            <v.icon className="h-4 w-4 text-accent shrink-0" />
            <div className="flex-1">
              <Input
                className="h-6 text-sm border-0 p-0 focus-visible:ring-0 bg-transparent"
                placeholder={v.label}
                value={data[v.field] as string}
                onChange={(e) => updateVital(v.field, e.target.value)}
              />
            </div>
            <span className="text-[10px] text-muted-foreground shrink-0">{v.unit}</span>
          </div>
        ))}
      </div>

      {/* Lab Tests Table */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <FlaskConical className="h-3.5 w-3.5 text-accent" />
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Tests</Label>
        </div>
        <div className="border rounded-lg overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[80px_100px_120px_1fr] gap-0 bg-muted/50 px-3 py-1.5 text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>Name</span>
            <span>Date</span>
            <span>Test With Medicine</span>
            <span>Clinical Results</span>
          </div>
          {/* Rows */}
          {data.labs.map((lab, i) => (
            <div key={lab.name} className="grid grid-cols-[80px_100px_120px_1fr] gap-0 px-3 py-1.5 border-t items-center">
              <span className="text-xs font-medium">{lab.name}</span>
              <Input
                type="date"
                className="h-6 text-[10px] w-[90px] px-1"
                value={lab.date}
                onChange={(e) => updateLab(i, 'date', e.target.value)}
              />
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                  <input type="radio" name={`med-${i}`} checked={lab.withMedicine} onChange={() => updateLab(i, 'withMedicine', true)} className="w-3 h-3" />
                  Yes
                </label>
                <label className="flex items-center gap-1 text-[10px] cursor-pointer">
                  <input type="radio" name={`med-${i}`} checked={!lab.withMedicine} onChange={() => updateLab(i, 'withMedicine', false)} className="w-3 h-3" />
                  No
                </label>
              </div>
              <Input
                className="h-6 text-xs"
                placeholder="Enter result"
                value={lab.result}
                onChange={(e) => updateLab(i, 'result', e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 3: Assessment (Diagnosis)
// ═══════════════════════════════════════════════════════════
function AssessmentStep({ data, onChange }: { data: AssessmentData; onChange: (d: AssessmentData) => void }) {
  const DIAGNOSES = ['Diabetes', 'HTN', 'Stroke', 'APD', 'Asthma', 'Seizures', 'COPD', 'Thyroid'];

  const toggleDiag = (d: string) => {
    const updated = data.diagnoses.includes(d) ? data.diagnoses.filter(x => x !== d) : [...data.diagnoses, d];
    onChange({ ...data, diagnoses: updated });
  };

  const checkboxes = [
    { key: 'followUpRequired' as const, label: 'Follow-up Required' },
    { key: 'referralNeeded' as const, label: 'Referral Needed' },
    { key: 'chronicCondition' as const, label: 'Chronic Condition' },
    { key: 'acuteCondition' as const, label: 'Acute Condition' },
    { key: 'needsLabWork' as const, label: 'Needs Additional Lab Work' },
  ];

  return (
    <div className="space-y-4">
      {/* Diagnosis selection */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Diagnosis</Label>
        <div className="flex flex-wrap gap-2">
          {DIAGNOSES.map(d => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDiag(d)}
              className={cn(
                'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                data.diagnoses.includes(d)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background text-muted-foreground border-border hover:border-primary/50'
              )}
            >
              {d}
            </button>
          ))}
        </div>
        {data.diagnoses.length > 0 && (
          <div className="flex gap-1.5 mt-2">
            {data.diagnoses.map(d => (
              <Badge key={d} className="text-[10px] bg-primary/10 text-primary border-primary/30">{d}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Clinical checkboxes */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Clinical Assessment</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {checkboxes.map(c => (
            <label key={c.key} className="flex items-center gap-2 p-2 rounded border bg-background hover:bg-muted/30 cursor-pointer text-xs">
              <Checkbox checked={data[c.key] as boolean} onCheckedChange={(v) => onChange({ ...data, [c.key]: !!v })} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      {/* Doctor Notes */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Notes</Label>
        <Textarea className="mt-1 min-h-[70px] text-sm" placeholder="Clinical findings, diagnosis details..." value={data.doctorNotes} onChange={(e) => onChange({ ...data, doctorNotes: e.target.value })} />
      </div>

      {/* Comments */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Comments</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Additional comments or recommendations..." value={data.comments} onChange={(e) => onChange({ ...data, comments: e.target.value })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 4: Plan (Inside RX / Outside RX)
// ═══════════════════════════════════════════════════════════
function PlanStep({ plan, setPlan }: { plan: PlanData; setPlan: (p: PlanData) => void }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  const meds = plan.insideRx;

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

  const setMeds = (newMeds: PrescriptionMed[]) => setPlan({ ...plan, insideRx: newMeds });

  const addMedicine = (medicine: typeof availableMedicines[0]) => {
    if (meds.some(item => item.name === medicine.name)) { setSearchOpen(false); setSearchQuery(''); return; }
    const newMed: PrescriptionMed = {
      id: `rx-${Date.now()}`, name: medicine.name,
      m: 1, a: 0, n: 1, days: 7, qty: 14, stockAvailable: medicine.qtyAvailable,
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

  const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));

  return (
    <div className="space-y-5">
      {/* Inside Rx Table */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Inside RX (In-House Pharmacy)</Label>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-muted-foreground h-8 text-sm mb-2">
              <Search className="mr-2 h-3.5 w-3.5" /> Search medicine by name...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search medicine..." value={searchQuery} onValueChange={setSearchQuery} className="h-9 text-sm" />
              <CommandList className="max-h-[250px]">
                <CommandEmpty className="py-3 text-center text-xs text-muted-foreground">No medicine found.</CommandEmpty>
                <CommandGroup>
                  {filteredMedicines.map((medicine) => {
                    const isAdded = meds.some(item => item.name === medicine.name);
                    return (
                      <CommandItem key={medicine.id} value={medicine.name} onSelect={() => addMedicine(medicine)} disabled={isAdded}
                        className={cn("flex justify-between py-1.5", isAdded && "opacity-40")}>
                        <div className="flex items-center gap-2">
                          <Pill className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs">{medicine.name}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">Stock: {medicine.qtyAvailable}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {meds.length > 0 && (
          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-[minmax(100px,1fr)_60px_repeat(3,36px)_45px_45px_28px] gap-0 bg-muted/50 px-2 py-1.5 text-[8px] font-semibold text-muted-foreground uppercase tracking-wider">
              <span>Medicine Name</span>
              <span className="text-center">Qty Avail</span>
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
                <div key={med.id} className={cn("grid grid-cols-[minmax(100px,1fr)_60px_repeat(3,36px)_45px_45px_28px] gap-0 px-2 py-1 border-t items-center", exceedsStock && "bg-destructive/5")}>
                  <div className="min-w-0">
                    <span className="text-[10px] font-medium truncate block">{med.name}</span>
                    {exceedsStock && <span className="text-[9px] text-destructive flex items-center gap-0.5"><AlertTriangle className="h-2.5 w-2.5" />Low stock</span>}
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">{med.stockAvailable}</span>
                  <Input type="number" min={0} max={9} value={med.m} onChange={(e) => updateMed(i, 'm', Number(e.target.value))} className="h-6 w-8 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={0} max={9} value={med.a} onChange={(e) => updateMed(i, 'a', Number(e.target.value))} className="h-6 w-8 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={0} max={9} value={med.n} onChange={(e) => updateMed(i, 'n', Number(e.target.value))} className="h-6 w-8 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={1} value={med.days} onChange={(e) => updateMed(i, 'days', Number(e.target.value))} className="h-6 w-10 text-center text-[10px] mx-auto p-0" />
                  <span className={cn("text-center text-[10px] font-bold", exceedsStock ? "text-destructive" : "text-primary")}>{med.qty}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMed(i)}>
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Outside Rx */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Outside RX (External Pharmacy)</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Medicines to be purchased outside..." value={plan.outsideRx} onChange={(e) => setPlan({ ...plan, outsideRx: e.target.value })} />
      </div>

      {/* Imaging */}
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <ImageIcon className="h-3.5 w-3.5 text-accent" />
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Imaging</Label>
        </div>
        <Textarea className="min-h-[50px] text-sm" placeholder="X-Ray, MRI, CT Scan orders..." value={plan.imaging} onChange={(e) => setPlan({ ...plan, imaging: e.target.value })} />
      </div>

      <Button size="sm" className="h-8 text-xs bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white">
        <Send className="h-3.5 w-3.5 mr-1.5" /> Send to Pharmacy
      </Button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 5: Summary
// ═══════════════════════════════════════════════════════════
function ReviewStep({ subject, object, assessment, plan }: {
  subject: SubjectData; object: ObjectData; assessment: AssessmentData; plan: PlanData;
}) {
  const vitals = [
    { label: 'Weight', value: object.weight, unit: 'kg' },
    { label: 'BP', value: object.bp, unit: 'mmHg' },
    { label: 'Pulse', value: object.pulse, unit: '/min' },
    { label: 'Temp', value: object.temp, unit: '°F' },
    { label: 'SpO2', value: object.spo2, unit: '%' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit Summary</h3>

      {/* Vitals compact */}
      <div className="border rounded-lg p-3">
        <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-2">Vitals</p>
        <div className="flex flex-wrap gap-3">
          {vitals.map(v => (
            <span key={v.label} className="text-xs">
              <span className="text-muted-foreground">{v.label}:</span>{' '}
              <strong>{v.value || '—'}</strong> {v.unit}
            </span>
          ))}
        </div>
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Conditions */}
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Conditions</p>
          <div className="flex flex-wrap gap-1">
            {subject.conditions.length > 0 ? subject.conditions.map(c => (
              <Badge key={c} variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">{c}</Badge>
            )) : <span className="text-xs text-muted-foreground italic">None selected</span>}
          </div>
        </div>

        {/* Diagnosis */}
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Diagnosis</p>
          <div className="flex flex-wrap gap-1">
            {assessment.diagnoses.length > 0 ? assessment.diagnoses.map(d => (
              <Badge key={d} variant="outline" className="text-[10px] bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]">{d}</Badge>
            )) : <span className="text-xs text-muted-foreground italic">None selected</span>}
          </div>
        </div>

        {/* Complaints */}
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Complaints</p>
          <p className="text-xs">{subject.presentingComplaints.join(', ') || <span className="text-muted-foreground italic">None</span>}</p>
        </div>

        {/* Doctor Notes */}
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Doctor Notes</p>
          <p className="text-xs">{assessment.doctorNotes || <span className="text-muted-foreground italic">No notes</span>}</p>
        </div>
      </div>

      {/* Prescription */}
      {plan.insideRx.length > 0 && (
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Medication (Inside RX)</p>
          <div className="space-y-1">
            {plan.insideRx.map(m => (
              <p key={m.id} className="text-xs">
                <strong>{m.name}</strong>
                <span className="text-muted-foreground ml-1">({m.m}-{m.a}-{m.n}) × {m.days}d = {m.qty}</span>
              </p>
            ))}
          </div>
        </div>
      )}

      {plan.outsideRx && (
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Outside RX</p>
          <p className="text-xs">{plan.outsideRx}</p>
        </div>
      )}

      {plan.imaging && (
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Imaging</p>
          <p className="text-xs">{plan.imaging}</p>
        </div>
      )}
    </div>
  );
}
