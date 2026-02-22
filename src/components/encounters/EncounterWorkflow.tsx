import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { EncounterPatient } from '@/pages/encounters/Encounters';
import { useMedicines, useStockItems } from '@/hooks/useApiData';

import {
  MessageSquare,
  Activity,
  Stethoscope,
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
  Thermometer,
  Heart,
  Scale,
  Ruler,
  Wind,
  Droplets,
  FlaskConical,
  ImageIcon,
} from 'lucide-react';

interface EncounterWorkflowProps {
  encounter: EncounterPatient;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Subject', icon: MessageSquare },
  { id: 2, label: 'Object', icon: Activity },
  { id: 3, label: 'Assessment', icon: Stethoscope },
  { id: 4, label: 'Plan', icon: Pill },
  { id: 5, label: 'Review', icon: ClipboardList },
];

// ─── Form Data Types ─────────────────────────────────────────
interface SubjectData {
  chiefComplaint: string;
  historyOfPresentIllness: string;
  painLevel: string;
  symptomDuration: string;
  // Checkbox questions
  hasFever: boolean;
  hasCough: boolean;
  hasBreathingDifficulty: boolean;
  hasChestPain: boolean;
  hasNausea: boolean;
  hasHeadache: boolean;
  // Yes/No
  isSmoker: boolean;
  isAlcoholConsumer: boolean;
  hasAllergies: boolean;
  allergyDetails: string;
  // Free text
  additionalNotes: string;
}

interface ObjectData {
  bp: string;
  temp: string;
  pulse: string;
  weight: string;
  height: string;
  spo2: string;
  respiratoryRate: string;
  bmi: string;
  labNotes: string;
}

interface AssessmentData {
  primaryDiagnosis: boolean;
  secondaryDiagnosis: boolean;
  chronicCondition: boolean;
  acuteCondition: boolean;
  followUpRequired: boolean;
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
    chiefComplaint: '', historyOfPresentIllness: '', painLevel: '', symptomDuration: '',
    hasFever: false, hasCough: false, hasBreathingDifficulty: false, hasChestPain: false, hasNausea: false, hasHeadache: false,
    isSmoker: false, isAlcoholConsumer: false, hasAllergies: false, allergyDetails: '',
    additionalNotes: '',
  });
  const [object, setObject] = useState<ObjectData>({
    bp: '', temp: '', pulse: '', weight: '', height: '', spo2: '', respiratoryRate: '', bmi: '', labNotes: '',
  });
  const [assessment, setAssessment] = useState<AssessmentData>({
    primaryDiagnosis: false, secondaryDiagnosis: false, chronicCondition: false, acuteCondition: false, followUpRequired: false,
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
          {activeStep === 1 && <SubjectStep data={subject} onChange={setSubject} />}
          {activeStep === 2 && <ObjectStep data={object} onChange={setObject} />}
          {activeStep === 3 && <AssessmentStep data={assessment} onChange={setAssessment} />}
          {activeStep === 4 && <PlanStep plan={plan} setPlan={setPlan} />}
          {activeStep === 5 && <ReviewStep subject={subject} object={object} assessment={assessment} plan={plan} />}
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
              Send to Pharmacy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Subject ──────────────────────────────────────────
function SubjectStep({ data, onChange }: { data: SubjectData; onChange: (d: SubjectData) => void }) {
  const update = <K extends keyof SubjectData>(field: K, value: SubjectData[K]) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Chief Complaint</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="What brings you in today?" value={data.chiefComplaint} onChange={(e) => update('chiefComplaint', e.target.value)} />
      </div>

      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">History of Present Illness</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Describe onset, duration, severity..." value={data.historyOfPresentIllness} onChange={(e) => update('historyOfPresentIllness', e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-[11px] text-muted-foreground">Pain Level (0-10)</Label>
          <Input className="h-8 text-sm mt-1" type="number" min="0" max="10" placeholder="0" value={data.painLevel} onChange={(e) => update('painLevel', e.target.value)} />
        </div>
        <div>
          <Label className="text-[11px] text-muted-foreground">Symptom Duration</Label>
          <Input className="h-8 text-sm mt-1" placeholder="e.g., 3 days" value={data.symptomDuration} onChange={(e) => update('symptomDuration', e.target.value)} />
        </div>
      </div>

      {/* Checkbox symptom questions */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Symptoms Present</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {([
            { key: 'hasFever' as const, label: 'Fever' },
            { key: 'hasCough' as const, label: 'Cough' },
            { key: 'hasBreathingDifficulty' as const, label: 'Breathing Difficulty' },
            { key: 'hasChestPain' as const, label: 'Chest Pain' },
            { key: 'hasNausea' as const, label: 'Nausea / Vomiting' },
            { key: 'hasHeadache' as const, label: 'Headache' },
          ]).map(s => (
            <label key={s.key} className="flex items-center gap-2 p-2 rounded-md border bg-background hover:bg-muted/30 cursor-pointer text-xs">
              <Checkbox checked={data[s.key]} onCheckedChange={(v) => update(s.key, !!v)} />
              {s.label}
            </label>
          ))}
        </div>
      </div>

      {/* Yes/No questions */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Social / Allergy History</Label>
        <div className="space-y-2">
          {([
            { key: 'isSmoker' as const, label: 'Does the patient smoke?' },
            { key: 'isAlcoholConsumer' as const, label: 'Does the patient consume alcohol?' },
            { key: 'hasAllergies' as const, label: 'Does the patient have any known allergies?' },
          ]).map(q => (
            <div key={q.key} className="flex items-center justify-between p-2 rounded-md border bg-background">
              <span className="text-xs">{q.label}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={cn('px-3 py-1 rounded text-[10px] font-medium border transition-colors', data[q.key] ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:bg-muted/50')}
                  onClick={() => update(q.key, true)}
                >Yes</button>
                <button
                  type="button"
                  className={cn('px-3 py-1 rounded text-[10px] font-medium border transition-colors', !data[q.key] ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground border-border hover:bg-muted/50')}
                  onClick={() => update(q.key, false)}
                >No</button>
              </div>
            </div>
          ))}
          {data.hasAllergies && (
            <Input className="h-8 text-sm" placeholder="List allergies..." value={data.allergyDetails} onChange={(e) => update('allergyDetails', e.target.value)} />
          )}
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground">Additional Notes</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Any other observations..." value={data.additionalNotes} onChange={(e) => update('additionalNotes', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 2: Object (Vitals & Labs) ──────────────────────────
function ObjectStep({ data, onChange }: { data: ObjectData; onChange: (d: ObjectData) => void }) {
  const update = (field: keyof ObjectData, value: string) => {
    const newData = { ...data, [field]: value };
    // Auto-calculate BMI
    if ((field === 'weight' || field === 'height') && newData.weight && newData.height) {
      const w = parseFloat(newData.weight);
      const h = parseFloat(newData.height) / 100;
      if (w > 0 && h > 0) {
        newData.bmi = (w / (h * h)).toFixed(1);
      }
    }
    onChange(newData);
  };

  const vitals = [
    { label: 'BP', field: 'bp' as const, placeholder: '120/80', unit: 'mmHg', icon: Droplets },
    { label: 'Temp', field: 'temp' as const, placeholder: '98.6', unit: '°F', icon: Thermometer },
    { label: 'Pulse', field: 'pulse' as const, placeholder: '72', unit: 'bpm', icon: Heart },
    { label: 'Weight', field: 'weight' as const, placeholder: '65', unit: 'kg', icon: Scale },
    { label: 'Height', field: 'height' as const, placeholder: '170', unit: 'cm', icon: Ruler },
    { label: 'SpO2', field: 'spo2' as const, placeholder: '98', unit: '%', icon: Wind },
    { label: 'RR', field: 'respiratoryRate' as const, placeholder: '18', unit: '/min', icon: Wind },
    { label: 'BMI', field: 'bmi' as const, placeholder: 'Auto', unit: '', icon: Activity },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Vitals</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {vitals.map(v => (
          <div key={v.field} className="border rounded-lg p-2.5 bg-background">
            <div className="flex items-center gap-1.5 mb-1.5">
              <v.icon className="h-3.5 w-3.5 text-accent" />
              <span className="text-[10px] text-muted-foreground font-medium">{v.label}</span>
              {v.unit && <span className="text-[9px] text-muted-foreground/60">({v.unit})</span>}
            </div>
            <Input
              className="h-7 text-sm"
              placeholder={v.placeholder}
              value={data[v.field]}
              onChange={(e) => update(v.field, e.target.value)}
              readOnly={v.field === 'bmi'}
            />
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <FlaskConical className="h-3.5 w-3.5 text-accent" />
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Notes / Orders</Label>
        </div>
        <Textarea className="min-h-[60px] text-sm" placeholder="Lab tests ordered, pending results..." value={data.labNotes} onChange={(e) => update('labNotes', e.target.value)} />
      </div>

      <div>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Upload className="h-3.5 w-3.5 text-accent" />
          <Label className="text-[11px] text-muted-foreground">Upload Lab Reports / Images</Label>
        </div>
        <div className="border-2 border-dashed rounded-lg p-4 text-center hover:bg-muted/30 transition-colors cursor-pointer">
          <Upload className="h-5 w-5 mx-auto text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-1.5">Drop files or click to upload</p>
        </div>
      </div>
    </div>
  );
}

// ─── Step 3: Assessment ──────────────────────────────────────
function AssessmentStep({ data, onChange }: { data: AssessmentData; onChange: (d: AssessmentData) => void }) {
  const updateBool = (field: keyof AssessmentData, value: boolean) => onChange({ ...data, [field]: value });
  const updateStr = (field: keyof AssessmentData, value: string) => onChange({ ...data, [field]: value });

  const checkboxes = [
    { key: 'primaryDiagnosis' as const, label: 'Primary Diagnosis Confirmed' },
    { key: 'secondaryDiagnosis' as const, label: 'Secondary Diagnosis Present' },
    { key: 'chronicCondition' as const, label: 'Chronic Condition' },
    { key: 'acuteCondition' as const, label: 'Acute Condition' },
    { key: 'followUpRequired' as const, label: 'Follow-up Required' },
  ];

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Clinical Assessment</Label>
        <div className="space-y-2">
          {checkboxes.map(c => (
            <label key={c.key} className="flex items-center gap-2.5 p-2.5 rounded-md border bg-background hover:bg-muted/30 cursor-pointer text-sm">
              <Checkbox checked={data[c.key] as boolean} onCheckedChange={(v) => updateBool(c.key, !!v)} />
              {c.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Notes</Label>
        <Textarea className="mt-1 min-h-[80px] text-sm" placeholder="Clinical findings, diagnosis details..." value={data.doctorNotes} onChange={(e) => updateStr('doctorNotes', e.target.value)} />
      </div>

      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Comments</Label>
        <Textarea className="mt-1 min-h-[60px] text-sm" placeholder="Additional comments or recommendations..." value={data.comments} onChange={(e) => updateStr('comments', e.target.value)} />
      </div>
    </div>
  );
}

// ─── Step 4: Plan ────────────────────────────────────────────
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
    <div className="space-y-5">
      {/* Inside Rx */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Inside Rx (In-House Pharmacy)</Label>
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
                <CommandGroup heading="Available Medicines">
                  {filteredMedicines.map((medicine) => {
                    const isAdded = meds.some(item => item.name === medicine.name);
                    return (
                      <CommandItem
                        key={medicine.id}
                        value={medicine.name}
                        onSelect={() => addMedicine(medicine)}
                        disabled={isAdded}
                        className={cn("flex items-center justify-between py-2 px-3 rounded-md cursor-pointer", isAdded && "opacity-40 cursor-not-allowed")}
                      >
                        <div className="flex items-center gap-2.5">
                          <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-xs font-medium text-foreground">{medicine.name}</p>
                            <p className="text-[10px] text-muted-foreground">{medicine.category}</p>
                          </div>
                        </div>
                        <span className={cn("text-[10px] font-medium px-2 py-0.5 rounded-full", medicine.qtyAvailable > 50 ? "bg-muted text-foreground" : medicine.qtyAvailable > 0 ? "bg-muted text-muted-foreground" : "bg-destructive/10 text-destructive")}>
                          Stock: {medicine.qtyAvailable}
                        </span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {meds.length > 0 && (
          <div className="border rounded-lg overflow-x-auto mt-2">
            <div className="grid grid-cols-[minmax(120px,1fr)_40px_40px_40px_50px_50px_32px] gap-0 bg-muted/50 px-2 py-1.5 text-[9px] font-medium text-muted-foreground uppercase tracking-wider min-w-[420px]">
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
                <div key={med.id} className={cn("grid grid-cols-[minmax(120px,1fr)_40px_40px_40px_50px_50px_32px] gap-0 px-2 py-1.5 border-t text-sm items-center group min-w-[420px]", exceedsStock && "bg-destructive/5")}>
                  <div className="min-w-0">
                    <span className="truncate text-[10px] font-medium block">{med.name}</span>
                    {exceedsStock && (
                      <span className="flex items-center gap-1 text-[9px] text-destructive mt-0.5">
                        <AlertTriangle className="h-2.5 w-2.5" />Short by {med.qty - med.stockAvailable}
                      </span>
                    )}
                  </div>
                  <Input type="number" min={0} max={9} value={med.m} onChange={(e) => updateMed(i, 'm', Number(e.target.value))} className="h-6 w-9 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={0} max={9} value={med.a} onChange={(e) => updateMed(i, 'a', Number(e.target.value))} className="h-6 w-9 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={0} max={9} value={med.n} onChange={(e) => updateMed(i, 'n', Number(e.target.value))} className="h-6 w-9 text-center text-[10px] mx-auto p-0" />
                  <Input type="number" min={1} max={365} value={med.days} onChange={(e) => updateMed(i, 'days', Number(e.target.value))} className="h-6 w-10 text-center text-[10px] mx-auto p-0" />
                  <span className={cn("text-center text-[10px] font-semibold", exceedsStock && "text-destructive")}>{med.qty}</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 opacity-60 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMed(i)}>
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
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Outside Rx (External Pharmacy)</Label>
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
        <Send className="h-3.5 w-3.5 mr-1.5" />
        Send to Pharmacy
      </Button>
    </div>
  );
}

// ─── Step 5: Review ──────────────────────────────────────────
function ReviewStep({ subject, object, assessment, plan }: {
  subject: SubjectData;
  object: ObjectData;
  assessment: AssessmentData;
  plan: PlanData;
}) {
  const vitalsText = [
    object.bp && `BP: ${object.bp}`,
    object.temp && `Temp: ${object.temp}°F`,
    object.pulse && `Pulse: ${object.pulse}`,
    object.weight && `Wt: ${object.weight}kg`,
    object.height && `Ht: ${object.height}cm`,
    object.spo2 && `SpO2: ${object.spo2}%`,
    object.bmi && `BMI: ${object.bmi}`,
  ].filter(Boolean).join(' • ');

  const symptomsText = [
    subject.hasFever && 'Fever',
    subject.hasCough && 'Cough',
    subject.hasBreathingDifficulty && 'Breathing Difficulty',
    subject.hasChestPain && 'Chest Pain',
    subject.hasNausea && 'Nausea',
    subject.hasHeadache && 'Headache',
  ].filter(Boolean).join(', ');

  const prescriptionText = plan.insideRx.map(m =>
    `${m.name} (${m.m}-${m.a}-${m.n} x ${m.days}d = ${m.qty})`
  ).join(', ');

  const sections = [
    { label: 'Vitals', value: vitalsText, icon: Activity },
    { label: 'Chief Complaint', value: subject.chiefComplaint, icon: MessageSquare },
    { label: 'Symptoms', value: symptomsText, icon: MessageSquare },
    { label: 'Assessment', value: assessment.doctorNotes, icon: Stethoscope },
    { label: 'Inside Rx', value: prescriptionText, icon: Pill },
    { label: 'Outside Rx', value: plan.outsideRx, icon: Pill },
    { label: 'Imaging', value: plan.imaging, icon: ImageIcon },
    { label: 'Comments', value: assessment.comments, icon: ClipboardList },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Visit Summary</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sections.map(item => {
          const hasValue = !!item.value;
          return (
            <div key={item.label} className="border rounded-lg p-2.5">
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
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Any additional notes before completing the visit..." />
      </div>
    </div>
  );
}
