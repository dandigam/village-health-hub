import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { EncounterPatient } from '@/pages/encounters/Encounters';
import { useMedicines, useStockItems, useSymptoms, useConditionsLookup, useEncounterSubject } from '@/hooks/useApiData';
import {
  MessageSquare, Activity, Stethoscope, Pill, ChevronRight,
  Save, RotateCcw, ClipboardList, Search, Trash2, Send, AlertTriangle,
  Thermometer, Heart, Scale, Wind, Droplets, FlaskConical, ImageIcon,
  Cigarette, Wine,
} from 'lucide-react';

interface EncounterWorkflowProps {
  encounter: EncounterPatient;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  diagnoses?: string[];
  vitals?: { weight: string; bp: string; pulse: string; temp: string; spo2: string };
  onDiagnosesChange?: (d: string[]) => void;
  onVitalsChange?: (v: { weight: string; bp: string; pulse: string; temp: string; spo2: string }) => void;
}

const steps = [
  { id: 1, label: 'Subject', sub: 'Chief Complaints', icon: MessageSquare },
  { id: 2, label: 'Objective', sub: 'Vitals / Labs', icon: Activity },
  { id: 3, label: 'Assessment', sub: 'Diagnosis', icon: Stethoscope },
  { id: 4, label: 'Plan', sub: 'Prescription', icon: Pill },
  { id: 5, label: 'Summary', sub: 'Review & Send', icon: ClipboardList },
];

// ─── Data Types ─────────────────────────────────────────
interface SubjectData {
  chiefComplaint: string;
  symptoms: string[];
  conditions: string[];
  isSmoking: boolean;
  isDrinking: boolean;
  isTakingMedicines: boolean;
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
  searchDiagnosis: string;
  severity: string;
  followUpRequired: boolean;
  referralNeeded: boolean;
  doctorNotes: string;
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
  instructions: string;
}

interface PlanData {
  insideRx: PrescriptionMed[];
  outsideRx: string;
  imaging: string;
}

export function EncounterWorkflow({ encounter, onStepChange, onComplete, onDiagnosesChange, onVitalsChange }: EncounterWorkflowProps) {
  const [activeStep, setActiveStep] = useState(encounter.currentStep || 1);

  const [subject, setSubject] = useState<SubjectData>({
    chiefComplaint: '', symptoms: [], conditions: [],
    isSmoking: false, isDrinking: false, isTakingMedicines: false, additionalNotes: '',
  });
  const [object, setObject] = useState<ObjectData>({
    weight: '', bp: '', pulse: '', temp: '', spo2: '',
    labs: [
      { name: 'BP', date: '', withMedicine: false, result: '' },
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
    diagnoses: [], searchDiagnosis: '', severity: '',
    followUpRequired: false, referralNeeded: false, doctorNotes: '',
  });
  const [plan, setPlan] = useState<PlanData>({
    insideRx: [], outsideRx: '', imaging: '',
  });

  const handleObjectChange = (d: ObjectData) => {
    setObject(d);
    onVitalsChange?.({ weight: d.weight, bp: d.bp, pulse: d.pulse, temp: d.temp, spo2: d.spo2 });
  };

  const handleAssessmentChange = (d: AssessmentData) => {
    setAssessment(d);
    onDiagnosesChange?.(d.diagnoses);
  };

  const handleStep = (step: number) => {
    setActiveStep(step);
    onStepChange(step);
  };

  const isCompleted = encounter.status === 'COMPLETED' || encounter.status === 'PHARMACY';

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border/50" style={{ boxShadow: '0 1px 4px hsl(var(--shadow-color, 222 40% 8%) / 0.04)' }}>
      {/* Patient Header */}
      <div className="px-3 sm:px-4 py-2.5 border-b border-border/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {encounter.patient.photoUrl ? (
              <img src={encounter.patient.photoUrl} alt="" className="h-9 w-9 rounded-full object-cover border border-border/40 shrink-0" />
            ) : (
              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary shrink-0">
                {(encounter.patient.name || encounter.patient.firstName || '').charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs sm:text-sm font-semibold text-foreground truncate">
                  #{encounter.token} · {encounter.patient.patientId} · {encounter.patient.name || encounter.patient.firstName || ''} {encounter.patient.surname || encounter.patient.lastName || ''} · {encounter.patient.gender} · {encounter.patient.age}Y
                </p>
                {encounter.isReturning && (
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.08)] shrink-0">
                    <RotateCcw className="h-2.5 w-2.5 mr-0.5" />Returning
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-muted-foreground truncate">
                {encounter.patient.fatherSpouseName && `S/o ${encounter.patient.fatherSpouseName}`}
                {encounter.patient.village && ` · ${encounter.patient.village}`}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-7 text-[10px] px-2.5 border-border/50">
            <Save className="h-3 w-3 sm:mr-1" /><span className="hidden sm:inline">Save</span>
          </Button>
        </div>

        {/* Vitals + Diagnosis summary bar */}
        {(object.weight || object.bp || object.pulse || assessment.diagnoses.length > 0) && (
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {object.weight && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-[hsl(var(--stat-blue))] text-[hsl(var(--stat-blue-text))] rounded-md px-2 py-0.5 font-medium">
                <Scale className="h-2.5 w-2.5" />{object.weight} kg
              </span>
            )}
            {object.bp && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-[hsl(var(--stat-pink))] text-[hsl(var(--stat-pink-text))] rounded-md px-2 py-0.5 font-medium">
                <Droplets className="h-2.5 w-2.5" />{object.bp}
              </span>
            )}
            {object.pulse && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-[hsl(var(--stat-orange))] text-[hsl(var(--stat-orange-text))] rounded-md px-2 py-0.5 font-medium">
                <Heart className="h-2.5 w-2.5" />{object.pulse}
              </span>
            )}
            {object.temp && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-[hsl(var(--stat-teal))] text-[hsl(var(--stat-teal-text))] rounded-md px-2 py-0.5 font-medium">
                <Thermometer className="h-2.5 w-2.5" />{object.temp}°F
              </span>
            )}
            {object.spo2 && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-[hsl(var(--stat-purple))] text-[hsl(var(--stat-purple-text))] rounded-md px-2 py-0.5 font-medium">
                <Wind className="h-2.5 w-2.5" />{object.spo2}%
              </span>
            )}
            {assessment.diagnoses.map(d => (
              <Badge key={d} variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30 font-semibold">{d}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* Stepper tabs */}
      <div className="border-b border-border/40 bg-muted/15">
        <div className="flex">
          {steps.map((step) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id || isCompleted;
            return (
              <button
                key={step.id}
                onClick={() => handleStep(step.id)}
                className={cn(
                  'flex-1 py-2.5 px-2 text-center border-b-2 transition-all duration-200',
                  isActive ? 'border-primary bg-primary/[0.04]' : isDone ? 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.02)]' : 'border-transparent hover:bg-muted/20'
                )}
              >
                <p className={cn('text-[11px] font-semibold', isActive ? 'text-primary' : isDone ? 'text-[hsl(var(--success))]' : 'text-muted-foreground')}>
                  {step.label}
                </p>
                <p className="text-[9px] text-muted-foreground/70">{step.sub}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 sm:p-5">
          {activeStep === 1 && <SubjectStep data={subject} onChange={setSubject} encounterId={encounter.encounterId} />}
          {activeStep === 2 && <ObjectStep data={object} onChange={handleObjectChange} />}
          {activeStep === 3 && <AssessmentStep data={assessment} onChange={handleAssessmentChange} />}
          {activeStep === 4 && <PlanStep plan={plan} setPlan={setPlan} />}
          {activeStep === 5 && <ReviewStep subject={subject} object={object} assessment={assessment} plan={plan} />}
        </div>
      </ScrollArea>

      {/* Sticky Bottom Bar */}
      <div className="px-4 py-2.5 border-t border-border/40 bg-muted/10 flex items-center justify-between">
        <Button variant="outline" size="sm" className="h-8 text-xs border-border/50" disabled={activeStep <= 1} onClick={() => handleStep(activeStep - 1)}>
          Previous
        </Button>
        <div className="flex items-center gap-2">
          {activeStep < 5 ? (
            <Button size="sm" className="h-8 text-xs px-4" onClick={() => handleStep(activeStep + 1)}>
              Next <ChevronRight className="h-3 w-3 ml-0.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-8 text-xs px-4 bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white" onClick={onComplete}>
              <Send className="h-3 w-3 mr-1" /> Send to Pharmacy
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 1: Subject — Chief Complaint + Symptom Chips + Lifestyle
// ═══════════════════════════════════════════════════════════

const CHIP_COLORS = [
  { bg: 'bg-[hsl(200,80%,94%)]', border: 'border-[hsl(200,70%,70%)]', text: 'text-[hsl(200,70%,30%)]', activeBg: 'bg-[hsl(200,70%,50%)]', activeText: 'text-white', activeBorder: 'border-[hsl(200,70%,50%)]' },
  { bg: 'bg-[hsl(150,60%,93%)]', border: 'border-[hsl(150,50%,65%)]', text: 'text-[hsl(150,50%,28%)]', activeBg: 'bg-[hsl(150,50%,42%)]', activeText: 'text-white', activeBorder: 'border-[hsl(150,50%,42%)]' },
  { bg: 'bg-[hsl(30,80%,93%)]', border: 'border-[hsl(30,70%,65%)]', text: 'text-[hsl(30,60%,30%)]', activeBg: 'bg-[hsl(30,70%,50%)]', activeText: 'text-white', activeBorder: 'border-[hsl(30,70%,50%)]' },
  { bg: 'bg-[hsl(280,60%,94%)]', border: 'border-[hsl(280,50%,68%)]', text: 'text-[hsl(280,50%,30%)]', activeBg: 'bg-[hsl(280,50%,50%)]', activeText: 'text-white', activeBorder: 'border-[hsl(280,50%,50%)]' },
  { bg: 'bg-[hsl(350,70%,94%)]', border: 'border-[hsl(350,60%,70%)]', text: 'text-[hsl(350,60%,32%)]', activeBg: 'bg-[hsl(350,60%,50%)]', activeText: 'text-white', activeBorder: 'border-[hsl(350,60%,50%)]' },
  { bg: 'bg-[hsl(60,60%,92%)]', border: 'border-[hsl(60,50%,60%)]', text: 'text-[hsl(60,40%,28%)]', activeBg: 'bg-[hsl(60,50%,42%)]', activeText: 'text-white', activeBorder: 'border-[hsl(60,50%,42%)]' },
];

function getChipColor(index: number) {
  return CHIP_COLORS[index % CHIP_COLORS.length];
}

function SubjectStep({ data, onChange, encounterId }: { data: SubjectData; onChange: (d: SubjectData) => void; encounterId: number }) {
  const { data: symptomsLookup = [], isLoading: symptomsLoading } = useSymptoms();
  const { data: conditionsLookup = [], isLoading: conditionsLoading } = useConditionsLookup();
  const { data: existingSubject } = useEncounterSubject(encounterId || null);
  const [initialized, setInitialized] = useState(false);

  // Pre-populate from existing subject data
  useEffect(() => {
    if (existingSubject && !initialized) {
      onChange({
        ...data,
        chiefComplaint: existingSubject.chiefComplaintText || data.chiefComplaint,
        symptoms: existingSubject.symptoms || data.symptoms,
        conditions: existingSubject.conditions || data.conditions,
        additionalNotes: existingSubject.additionalNotes || data.additionalNotes,
      });
      setInitialized(true);
    }
  }, [existingSubject, initialized]);

  const toggleArray = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];

  return (
    <div className="space-y-5">
      {/* Known Conditions */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Known Conditions</Label>
        <div className="flex flex-wrap gap-3">
          {conditionsLoading ? (
            <span className="text-xs text-muted-foreground">Loading conditions...</span>
          ) : (
            conditionsLookup.map(c => (
              <label key={c.id} className="flex items-center gap-1.5 cursor-pointer text-xs hover:text-foreground transition-colors">
                <Checkbox checked={data.conditions.includes(c.name)} onCheckedChange={() => onChange({ ...data, conditions: toggleArray(data.conditions, c.name) })} />
                {c.name}
              </label>
            ))
          )}
        </div>
      </div>

      {/* Quick Symptom Chips */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Quick Symptoms</Label>
        <div className="flex flex-wrap gap-2">
          {symptomsLoading ? (
            <span className="text-xs text-muted-foreground">Loading symptoms...</span>
          ) : (
            symptomsLookup.map((s, idx) => {
              const active = data.symptoms.includes(s.name);
              const color = getChipColor(idx);
              return (
                <button
                  key={s.id} type="button"
                  onClick={() => onChange({ ...data, symptoms: toggleArray(data.symptoms, s.name) })}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                    active
                      ? `${color.activeBg} ${color.activeText} ${color.activeBorder} shadow-sm`
                      : 'bg-muted/40 text-muted-foreground border-border/50 hover:bg-muted/60'
                  )}
                >
                  {s.name}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Lifestyle */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Lifestyle</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {([
            { key: 'isSmoking' as const, label: 'Smoking', icon: Cigarette },
            { key: 'isDrinking' as const, label: 'Alcohol', icon: Wine },
            { key: 'isTakingMedicines' as const, label: 'Current Medicines', icon: Pill },
          ]).map(q => (
            <div key={q.key} className="flex items-center justify-between p-2.5 rounded-lg border border-border/50 bg-card hover:bg-muted/20 transition-colors">
              <span className="text-xs font-medium flex items-center gap-1.5">
                <q.icon className="h-3.5 w-3.5 text-muted-foreground" />
                {q.label}
              </span>
              <div className="flex gap-1">
                <button type="button" className={cn('px-3 py-1 rounded-md text-[10px] font-semibold border transition-all', data[q.key] ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border/60 text-muted-foreground hover:bg-muted/50')} onClick={() => onChange({ ...data, [q.key]: true })}>Yes</button>
                <button type="button" className={cn('px-3 py-1 rounded-md text-[10px] font-semibold border transition-all', !data[q.key] ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'border-border/60 text-muted-foreground hover:bg-muted/50')} onClick={() => onChange({ ...data, [q.key]: false })}>No</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chief Complaint */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Chief Complaint</Label>
        <Textarea
          className="min-h-[70px] text-sm border-border/50 focus:border-primary/40"
          placeholder="Describe the patient's main complaint..."
          value={data.chiefComplaint}
          onChange={(e) => onChange({ ...data, chiefComplaint: e.target.value })}
        />
      </div>

      {/* Additional Notes */}
      <div>
        <Label className="text-[11px] text-muted-foreground font-medium">Additional Notes</Label>
        <Textarea className="mt-1.5 min-h-[50px] text-sm border-border/50 focus:border-primary/40" placeholder="Any other observations..." value={data.additionalNotes} onChange={(e) => onChange({ ...data, additionalNotes: e.target.value })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 2: Objective — Vitals + Lab Tests
// ═══════════════════════════════════════════════════════════
function ObjectStep({ data, onChange }: { data: ObjectData; onChange: (d: ObjectData) => void }) {
  const updateVital = (field: keyof ObjectData, value: string) => onChange({ ...data, [field]: value });

  const updateLab = (index: number, field: keyof LabTest, value: any) => {
    const updated = [...data.labs];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...data, labs: updated });
  };

  const vitals = [
    { field: 'weight' as const, icon: Scale, label: 'Weight', unit: "Kg's" },
    { field: 'bp' as const, icon: Droplets, label: 'BP', unit: 'mmHg' },
    { field: 'pulse' as const, icon: Heart, label: 'Pulse', unit: '/min' },
    { field: 'temp' as const, icon: Thermometer, label: 'Temp', unit: '°F' },
    { field: 'spo2' as const, icon: Wind, label: 'SpO2', unit: '%' },
  ];

  return (
    <div className="space-y-6">
      {/* Vitals */}
      <div className="flex flex-wrap gap-3">
        {vitals.map(v => (
          <div key={v.field} className="flex items-center gap-2.5 border border-border/50 rounded-xl px-3.5 py-3 bg-card min-w-[150px] flex-1 hover:border-primary/30 transition-colors" style={{ boxShadow: '0 1px 3px hsl(var(--shadow-color, 222 40% 8%) / 0.03)' }}>
            <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <v.icon className="h-3.5 w-3.5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] text-muted-foreground font-medium block">{v.label}</span>
              <Input
                className="h-6 text-sm font-semibold border-0 p-0 focus-visible:ring-0 bg-transparent"
                placeholder="—"
                value={data[v.field] as string}
                onChange={(e) => updateVital(v.field, e.target.value)}
              />
            </div>
            <span className="text-[10px] text-muted-foreground/60 shrink-0">{v.unit}</span>
          </div>
        ))}
      </div>

      {/* Lab Tests */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="h-6 w-6 rounded-md bg-primary/10 flex items-center justify-center">
            <FlaskConical className="h-3.5 w-3.5 text-primary" />
          </div>
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Tests</Label>
        </div>
        <div className="border border-border/50 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px hsl(var(--shadow-color, 222 40% 8%) / 0.03)' }}>
          <div className="grid grid-cols-[70px_120px_140px_1fr] gap-0 bg-muted/40 px-3 py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
            <span>Name</span>
            <span>Date</span>
            <span>Test With Medicine</span>
            <span>Clinical Results</span>
          </div>
          {data.labs.map((lab, i) => (
            <div key={lab.name} className="grid grid-cols-[70px_120px_140px_1fr] gap-0 px-3 py-2 border-t border-border/30 items-center hover:bg-muted/10 transition-colors">
              <span className="text-xs font-semibold text-foreground">{lab.name}</span>
              <Input type="text" placeholder="dd-mm-yyyy" className="h-7 text-xs w-[110px] px-2 border-border/50" value={lab.date} onChange={(e) => updateLab(i, 'date', e.target.value)} />
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="radio" name={`med-${i}`} checked={lab.withMedicine} onChange={() => updateLab(i, 'withMedicine', true)} className="w-3.5 h-3.5 accent-[hsl(var(--primary))]" />
                  Yes
                </label>
                <label className="flex items-center gap-1 text-xs cursor-pointer">
                  <input type="radio" name={`med-${i}`} checked={!lab.withMedicine} onChange={() => updateLab(i, 'withMedicine', false)} className="w-3.5 h-3.5 accent-[hsl(var(--primary))]" />
                  No
                </label>
              </div>
              <Input className="h-7 text-xs border-border/50" placeholder="Enter result" value={lab.result} onChange={(e) => updateLab(i, 'result', e.target.value)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 3: Assessment — Diagnosis Chips + Search + Severity
// ═══════════════════════════════════════════════════════════
function AssessmentStep({ data, onChange }: { data: AssessmentData; onChange: (d: AssessmentData) => void }) {
  const DIAGNOSES = ['Diabetes', 'HTN', 'Stroke', 'APD', 'Asthma', 'Seizures', 'COPD', 'Thyroid', 'Migraine', 'Anemia', 'Arthritis', 'Depression'];
  const SEVERITY_OPTIONS = ['Mild', 'Moderate', 'Severe', 'Critical'];

  const toggleDiag = (d: string) => {
    const updated = data.diagnoses.includes(d) ? data.diagnoses.filter(x => x !== d) : [...data.diagnoses, d];
    onChange({ ...data, diagnoses: updated });
  };

  const addCustomDiagnosis = () => {
    if (data.searchDiagnosis.trim() && !data.diagnoses.includes(data.searchDiagnosis.trim())) {
      onChange({ ...data, diagnoses: [...data.diagnoses, data.searchDiagnosis.trim()], searchDiagnosis: '' });
    }
  };

  return (
    <div className="space-y-5">
      {/* Diagnosis Chips */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Diagnosis</Label>
        <div className="flex flex-wrap gap-2">
          {DIAGNOSES.map(d => (
            <button
              key={d} type="button" onClick={() => toggleDiag(d)}
              className={cn(
                'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200',
                data.diagnoses.includes(d) ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border/60 hover:border-primary/50 hover:text-foreground'
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Search / Custom Diagnosis */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Search or Add Diagnosis</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              className="pl-9 h-9 text-sm"
              placeholder="Type diagnosis name..."
              value={data.searchDiagnosis}
              onChange={e => onChange({ ...data, searchDiagnosis: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && addCustomDiagnosis()}
            />
          </div>
          <Button size="sm" variant="outline" onClick={addCustomDiagnosis} disabled={!data.searchDiagnosis.trim()}>
            Add
          </Button>
        </div>
        {data.diagnoses.length > 0 && (
          <div className="flex gap-1.5 mt-2.5 flex-wrap">
            {data.diagnoses.map(d => (
              <Badge key={d} className="text-[10px] bg-primary/10 text-primary border-primary/30 font-semibold gap-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-colors" onClick={() => toggleDiag(d)}>
                {d} ×
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Severity */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Severity</Label>
        <div className="flex gap-2">
          {SEVERITY_OPTIONS.map(s => (
            <button
              key={s} type="button" onClick={() => onChange({ ...data, severity: s })}
              className={cn(
                'px-4 py-2 rounded-lg text-xs font-medium border transition-all',
                data.severity === s ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border/60 hover:border-primary/50'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Assessment Options */}
      <div className="grid grid-cols-2 gap-2">
        {([
          { key: 'followUpRequired' as const, label: 'Follow-up Required' },
          { key: 'referralNeeded' as const, label: 'Referral Needed' },
        ]).map(c => (
          <label key={c.key} className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border/50 bg-card hover:bg-muted/20 cursor-pointer text-xs font-medium transition-colors">
            <Checkbox checked={data[c.key] as boolean} onCheckedChange={(v) => onChange({ ...data, [c.key]: !!v })} />
            {c.label}
          </label>
        ))}
      </div>

      {/* Doctor Notes */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Notes</Label>
        <Textarea className="mt-1.5 min-h-[70px] text-sm border-border/50 focus:border-primary/40" placeholder="Clinical findings, assessment details..." value={data.doctorNotes} onChange={(e) => onChange({ ...data, doctorNotes: e.target.value })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 4: Plan — Medicine Search + Dosage + Send to Pharmacy
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
      instructions: '',
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

  const updateInstructions = (index: number, value: string) => {
    const updated = [...meds];
    updated[index] = { ...updated[index], instructions: value };
    setMeds(updated);
  };

  const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));

  return (
    <div className="space-y-6">
      {/* Medicine Search */}
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2.5 block">Prescription (Inside RX)</Label>
        <Popover open={searchOpen} onOpenChange={setSearchOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full justify-start text-muted-foreground h-9 text-sm mb-2">
              <Search className="mr-2 h-3.5 w-3.5" /> Search medicine by name...
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0 bg-popover" align="start">
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

        {/* Prescription Table */}
        {meds.length > 0 && (
          <div className="border border-border/50 rounded-xl overflow-hidden" style={{ boxShadow: '0 1px 3px hsl(var(--shadow-color, 222 40% 8%) / 0.03)' }}>
            <div className="grid grid-cols-[minmax(100px,1fr)_60px_repeat(3,36px)_45px_45px_28px] gap-0 bg-muted/40 px-2 py-2 text-[8px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border/40">
              <span>Medicine</span>
              <span className="text-center">Stock</span>
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
                <div key={med.id} className={cn("grid grid-cols-[minmax(100px,1fr)_60px_repeat(3,36px)_45px_45px_28px] gap-0 px-2 py-1.5 border-t items-center", exceedsStock && "bg-destructive/5")}>
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
          <ImageIcon className="h-3.5 w-3.5 text-primary" />
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Imaging</Label>
        </div>
        <Textarea className="min-h-[50px] text-sm" placeholder="X-Ray, MRI, CT Scan orders..." value={plan.imaging} onChange={(e) => setPlan({ ...plan, imaging: e.target.value })} />
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// Step 5: Summary — Review & Send to Pharmacy
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

      {/* Chief Complaint */}
      {subject.chiefComplaint && (
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Chief Complaint</p>
          <p className="text-sm">{subject.chiefComplaint}</p>
        </div>
      )}

      {/* Vitals */}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Symptoms</p>
          <div className="flex flex-wrap gap-1">
            {subject.symptoms.length > 0 ? subject.symptoms.map(s => (
              <Badge key={s} variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">{s}</Badge>
            )) : <span className="text-xs text-muted-foreground italic">None selected</span>}
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Diagnosis</p>
          <div className="flex flex-wrap gap-1">
            {assessment.diagnoses.length > 0 ? assessment.diagnoses.map(d => (
              <Badge key={d} variant="outline" className="text-[10px] bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]">{d}</Badge>
            )) : <span className="text-xs text-muted-foreground italic">None selected</span>}
          </div>
          {assessment.severity && <p className="text-xs mt-1">Severity: <strong>{assessment.severity}</strong></p>}
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Lifestyle</p>
          <div className="flex gap-3 text-xs">
            <span>Smoking: <strong>{subject.isSmoking ? 'Yes' : 'No'}</strong></span>
            <span>Alcohol: <strong>{subject.isDrinking ? 'Yes' : 'No'}</strong></span>
          </div>
        </div>
        <div className="border rounded-lg p-3">
          <p className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Doctor Notes</p>
          <p className="text-xs">{assessment.doctorNotes || <span className="text-muted-foreground italic">No notes</span>}</p>
        </div>
      </div>

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
