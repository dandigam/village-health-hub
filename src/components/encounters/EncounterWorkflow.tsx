import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { EncounterPatient } from '@/pages/encounters/Encounters';
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
  AlertCircle,
} from 'lucide-react';

interface EncounterWorkflowProps {
  encounter: EncounterPatient;
  onStepChange: (step: number) => void;
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Vitals & Reason', icon: Activity },
  { id: 2, label: 'SOAP Notes', icon: FileText },
  { id: 3, label: 'Consultation', icon: Stethoscope },
  { id: 4, label: 'Prescription', icon: Pill },
];

export function EncounterWorkflow({ encounter, onStepChange, onComplete }: EncounterWorkflowProps) {
  const [activeStep, setActiveStep] = useState(encounter.currentStep || 1);

  const handleStep = (step: number) => {
    setActiveStep(step);
    onStepChange(step);
  };

  const isCompleted = encounter.status === 'completed';

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      {/* Patient Header */}
      <div className="px-4 py-2.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          {encounter.patient.photoUrl ? (
            <img
              src={encounter.patient.photoUrl}
              alt=""
              className="h-9 w-9 rounded-full object-cover border"
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
              {encounter.patient.name.charAt(0)}
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-foreground">{encounter.patient.name} {encounter.patient.surname}</p>
              {encounter.isReturning && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 text-[hsl(var(--warning))] border-[hsl(var(--warning)/0.3)] bg-[hsl(var(--warning)/0.08)]">
                  <RotateCcw className="h-2.5 w-2.5 mr-0.5" />
                  Returning
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              {encounter.patient.age}Y • {encounter.patient.gender} • {encounter.patient.patientId} • {encounter.patient.village}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save
          </Button>
          {!isCompleted && activeStep === 4 && (
            <Button size="sm" className="h-7 text-xs bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white" onClick={onComplete}>
              <Check className="h-3 w-3 mr-1" />
              Complete Visit
            </Button>
          )}
        </div>
      </div>

      {/* Stepper */}
      <div className="px-4 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const isActive = activeStep === step.id;
            const isDone = activeStep > step.id || isCompleted;
            return (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => handleStep(step.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : isDone
                        ? 'text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.08)]'
                        : 'text-muted-foreground hover:bg-muted/50'
                  )}
                >
                  {isDone && !isActive ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <step.icon className="h-3.5 w-3.5" />
                  )}
                  {step.label}
                </button>
                {i < steps.length - 1 && (
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {activeStep === 1 && <VitalsStep />}
          {activeStep === 2 && <SOAPStep />}
          {activeStep === 3 && <ConsultationStep />}
          {activeStep === 4 && <PrescriptionStep />}
        </div>
      </ScrollArea>

      {/* Bottom Action Bar */}
      <div className="px-4 py-2.5 border-t bg-muted/20 flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          disabled={activeStep <= 1}
          onClick={() => handleStep(activeStep - 1)}
        >
          Previous
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save Visit
          </Button>
          {activeStep < 4 ? (
            <Button size="sm" className="h-8 text-xs" onClick={() => handleStep(activeStep + 1)}>
              Next Step
              <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="h-8 text-xs bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-white"
              onClick={onComplete}
            >
              <Check className="h-3 w-3 mr-1" />
              Complete Visit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Step 1: Vitals ──────────────────────────────────────────
function VitalsStep() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Vitals</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'BP (mmHg)', placeholder: '120/80' },
            { label: 'Temp (°F)', placeholder: '98.6' },
            { label: 'Pulse (bpm)', placeholder: '72' },
            { label: 'Weight (kg)', placeholder: '65' },
            { label: 'Height (cm)', placeholder: '170' },
            { label: 'SpO2 (%)', placeholder: '98' },
          ].map(v => (
            <div key={v.label}>
              <Label className="text-[11px] text-muted-foreground">{v.label}</Label>
              <Input className="h-8 text-sm mt-1" placeholder={v.placeholder} />
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground">Chief Complaint / Reason for Visit</Label>
        <Textarea className="mt-1 min-h-[60px] text-sm" placeholder="Describe the patient's primary complaint..." />
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground">Nurse Notes (Optional)</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Additional observations..." />
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
function SOAPStep() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AlertCircle className="h-3.5 w-3.5 text-[hsl(var(--info))]" />
        Auto-saves every 5 seconds
      </div>
      {[
        { label: 'Subjective', placeholder: 'Patient reports...' },
        { label: 'Objective', placeholder: 'On examination...' },
        { label: 'Assessment', placeholder: 'Clinical impression...' },
        { label: 'Plan', placeholder: 'Treatment plan...' },
      ].map(s => (
        <div key={s.label}>
          <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</Label>
          <Textarea className="mt-1 min-h-[70px] text-sm" placeholder={s.placeholder} />
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

// ─── Step 3: Doctor Consultation ─────────────────────────────
function ConsultationStep() {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Doctor Observations</Label>
        <Textarea className="mt-1 min-h-[70px] text-sm" placeholder="Clinical findings and observations..." />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Diagnosis</Label>
        <Input className="h-8 text-sm mt-1" placeholder="Add diagnosis..." />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Recommendations</Label>
        <Textarea className="mt-1 min-h-[50px] text-sm" placeholder="Instructions and recommendations..." />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Tests Ordered</Label>
        <Input className="h-8 text-sm mt-1" placeholder="e.g., CBC, Lipid Profile, ECG..." />
      </div>
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Follow-up</Label>
        <Input className="h-8 text-sm mt-1" placeholder="e.g., 2 weeks" />
      </div>
    </div>
  );
}

// ─── Step 4: Prescription ────────────────────────────────────
function PrescriptionStep() {
  const [meds] = useState([
    { name: 'PARACETAMOL 500 MG', m: 1, a: 1, n: 1, days: 5, qty: 15 },
    { name: 'OMEPRAZOLE 20 MG', m: 1, a: 0, n: 0, days: 10, qty: 10 },
  ]);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Add Medicine</Label>
        <Input className="h-8 text-sm" placeholder="Search medicine by name or code..." />
      </div>

      {meds.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_40px_40px_40px_50px_50px] gap-0 bg-muted/50 px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            <span>Medicine</span>
            <span className="text-center">M</span>
            <span className="text-center">A</span>
            <span className="text-center">N</span>
            <span className="text-center">Days</span>
            <span className="text-center">Qty</span>
          </div>
          {meds.map((med, i) => (
            <div key={i} className="grid grid-cols-[1fr_40px_40px_40px_50px_50px] gap-0 px-3 py-2 border-t text-sm items-center">
              <span className="truncate text-xs font-medium">{med.name}</span>
              <span className="text-center text-xs">{med.m}</span>
              <span className="text-center text-xs">{med.a}</span>
              <span className="text-center text-xs">{med.n}</span>
              <span className="text-center text-xs">{med.days}</span>
              <span className="text-center text-xs font-medium">{med.qty}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" size="sm" className="h-7 text-xs">
          <Pill className="h-3 w-3 mr-1" />
          Send to Pharmacy
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-xs">
          Print Rx
        </Button>
      </div>
    </div>
  );
}
