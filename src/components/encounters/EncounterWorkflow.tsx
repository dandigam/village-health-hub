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
import { mockMedicines, mockStockItems } from '@/data/mockData';
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
  { id: 3, label: 'Consultation', icon: Stethoscope },
  { id: 4, label: 'Prescription', icon: Pill },
  { id: 5, label: 'Review', icon: ClipboardList },
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
              <Send className="h-3 w-3 mr-1" />
              Send to Pharmacy
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
          {activeStep === 5 && <ReviewStep />}
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
          {activeStep < 5 ? (
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
              <Send className="h-3 w-3 mr-1" />
              Send to Pharmacy
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
        <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--info))]" />
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

// ─── Step 4: Prescription (Searchable + Editable Table) ──────
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

function PrescriptionStep() {
  const [meds, setMeds] = useState<PrescriptionMed[]>([
    { id: 'rx-1', name: 'PARACETAMOL 500 MG', m: 1, a: 1, n: 1, days: 5, qty: 15, stockAvailable: 1000 },
    { id: 'rx-2', name: 'OMEPRAZOLE 20 MG', m: 1, a: 0, n: 0, days: 10, qty: 10, stockAvailable: 350 },
  ]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const availableMedicines = useMemo(() => {
    return mockMedicines.map(medicine => {
      const stockItem = mockStockItems.find(s => s.medicineId === medicine.id);
      return { id: medicine.id, name: medicine.name, category: medicine.category, qtyAvailable: stockItem?.quantity || 0 };
    });
  }, []);

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
        <div className="border rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_44px_44px_44px_56px_56px_32px] gap-0 bg-muted/50 px-3 py-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
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
                "grid grid-cols-[1fr_44px_44px_44px_56px_56px_32px] gap-0 px-3 py-1.5 border-t text-sm items-center group",
                exceedsStock && "bg-destructive/5"
              )}>
                <div className="min-w-0">
                  <span className="truncate text-xs font-medium block">{med.name}</span>
                  {exceedsStock && (
                    <span className="flex items-center gap-1 text-[10px] text-destructive mt-0.5">
                      <AlertTriangle className="h-3 w-3" />
                      Stock: {med.stockAvailable} (short by {med.qty - med.stockAvailable})
                    </span>
                  )}
                </div>
                <Input type="number" min={0} max={9} value={med.m} onChange={(e) => updateMed(i, 'm', Number(e.target.value))} className="h-7 w-10 text-center text-xs mx-auto p-0" />
                <Input type="number" min={0} max={9} value={med.a} onChange={(e) => updateMed(i, 'a', Number(e.target.value))} className="h-7 w-10 text-center text-xs mx-auto p-0" />
                <Input type="number" min={0} max={9} value={med.n} onChange={(e) => updateMed(i, 'n', Number(e.target.value))} className="h-7 w-10 text-center text-xs mx-auto p-0" />
                <Input type="number" min={1} max={365} value={med.days} onChange={(e) => updateMed(i, 'days', Number(e.target.value))} className="h-7 w-12 text-center text-xs mx-auto p-0" />
                <span className={cn("text-center text-xs font-semibold", exceedsStock && "text-destructive")}>{med.qty}</span>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => removeMed(i)}>
                  <Trash2 className="h-3 w-3" />
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

// ─── Step 5: Review ──────────────────────────────────────────
function ReviewStep() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Visit Summary</h3>
        <div className="space-y-3">
          {[
            { label: 'Vitals', value: 'BP: 120/80, Temp: 98.6°F, Pulse: 72, Weight: 65kg, SpO2: 98%' },
            { label: 'Chief Complaint', value: 'Fever and body aches for 3 days' },
            { label: 'Diagnosis', value: 'Viral fever with myalgia' },
            { label: 'Prescription', value: 'PARACETAMOL 500 MG (1-1-1 x 5d), OMEPRAZOLE 20 MG (1-0-0 x 10d)' },
            { label: 'Follow-up', value: '1 week' },
          ].map(item => (
            <div key={item.label} className="border rounded-lg p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
              <p className="text-xs text-foreground">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-[11px] text-muted-foreground">Doctor's Final Notes</Label>
        <Textarea className="mt-1 min-h-[60px] text-sm" placeholder="Any additional notes before completing the visit..." />
      </div>
    </div>
  );
}
