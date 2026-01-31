import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Send, Plus, Trash2, 
  ChevronDown, ChevronUp, Activity, Thermometer, Heart, Wind,
  Scale, Ruler, Calculator, FileText, History, Clock,
  Printer, Download, Stethoscope, ClipboardList, Pill
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { mockSOAPNotes, mockPatients, mockMedicines } from '@/data/mockData';

interface PrescriptionItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  morning: number;
  afternoon: number;
  night: number;
  days: number;
  notes: string;
}

interface Vitals {
  bp: string;
  pulse: number | '';
  temp: number | '';
  spo2: number | '';
  weight: number | '';
  height: number | '';
}

const diagnosisOptions = [
  'Tension Headache',
  'Migraine',
  'Hypertension',
  'Diabetes',
  'Respiratory Infection',
  'Anemia',
  'Viral Fever',
  'Upper Respiratory Infection',
  'Gastritis',
  'Lower Back Pain',
];

export default function NewConsultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const soapId = searchParams.get('soapId');
  const patientId = searchParams.get('patientId');

  const soapNote = mockSOAPNotes.find(n => n.id === soapId);
  const patient = mockPatients.find(p => p.id === patientId);

  // SOAP Notes State
  const [subjective, setSubjective] = useState(soapNote?.subjective || '');
  const [vitals, setVitals] = useState<Vitals>({
    bp: soapNote?.objective.bp || '',
    pulse: soapNote?.objective.pulse || '',
    temp: soapNote?.objective.temp || '',
    spo2: soapNote?.objective.spo2 || '',
    weight: soapNote?.objective.weight || '',
    height: '',
  });
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [diagnosisList, setDiagnosisList] = useState<string[]>([]);

  // History State
  const [pastHistory, setPastHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [socialHistory, setSocialHistory] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');

  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // UI State
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Calculate BMI
  const bmi = useMemo(() => {
    if (vitals.weight && vitals.height) {
      const heightInM = Number(vitals.height) / 100;
      const bmiValue = Number(vitals.weight) / (heightInM * heightInM);
      return bmiValue.toFixed(1);
    }
    return null;
  }, [vitals.weight, vitals.height]);

  // BMI Category
  const bmiCategory = useMemo(() => {
    if (!bmi) return null;
    const value = parseFloat(bmi);
    if (value < 18.5) return { label: 'Underweight', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (value < 25) return { label: 'Normal', color: 'text-green-600', bg: 'bg-green-50' };
    if (value < 30) return { label: 'Overweight', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Obese', color: 'text-red-600', bg: 'bg-red-50' };
  }, [bmi]);

  // Filtered medicines for search
  const filteredMedicines = useMemo(() => {
    if (!medicineSearch) return mockMedicines;
    return mockMedicines.filter(m => 
      m.name.toLowerCase().includes(medicineSearch.toLowerCase()) ||
      m.category.toLowerCase().includes(medicineSearch.toLowerCase())
    );
  }, [medicineSearch]);

  // Auto-save effect
  const handleAutoSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 300);
  }, []);

  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (subjective || diagnosisList.length > 0 || prescriptionItems.length > 0) {
        handleAutoSave();
      }
    }, 5000);

    return () => clearTimeout(autoSaveTimer);
  }, [subjective, vitals, diagnosisList, prescriptionItems, additionalNotes, handleAutoSave]);

  const updateVital = (field: keyof Vitals, value: string | number) => {
    setVitals(prev => ({ ...prev, [field]: value }));
  };

  const addDiagnosis = () => {
    const diagToAdd = selectedDiagnosis || customDiagnosis.trim();
    if (diagToAdd && !diagnosisList.includes(diagToAdd)) {
      setDiagnosisList([...diagnosisList, diagToAdd]);
      setSelectedDiagnosis('');
      setCustomDiagnosis('');
    }
  };

  const addMedicine = () => {
    if (selectedMedicine) {
      const medicine = mockMedicines.find(m => m.id === selectedMedicine);
      if (medicine && !prescriptionItems.find(p => p.medicineId === medicine.id)) {
        setPrescriptionItems([...prescriptionItems, {
          id: `rx-${Date.now()}`,
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity: 0,
          morning: 0,
          afternoon: 0,
          night: 0,
          days: 5,
          notes: '',
        }]);
      }
      setSelectedMedicine('');
      setMedicineSearch('');
    }
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: number | string) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    if (['morning', 'afternoon', 'night', 'days'].includes(field)) {
      const item = updated[index];
      updated[index].quantity = (Number(item.morning) + Number(item.afternoon) + Number(item.night)) * Number(item.days);
    }
    setPrescriptionItems(updated);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
      toast({
        title: "Draft Saved",
        description: "Consultation saved as draft.",
      });
    }, 300);
  };

  const handleSendToPharmacy = () => {
    if (prescriptionItems.length === 0) {
      toast({
        title: "No Prescription",
        description: "Add at least one medicine before sending.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sent to Pharmacy",
      description: `Prescription with ${prescriptionItems.length} medicine(s) sent successfully.`,
    });
    navigate('/consultations');
  };

  if (!patient || !soapNote) {
    return (
      <DashboardLayout campName="Bapatla">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">Patient or SOAP Note not found</p>
          <Button onClick={() => navigate('/consultations')}>Back to Consultations</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <TooltipProvider>
      <DashboardLayout campName="Bapatla">
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-card border-b shadow-sm -mx-6 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/consultations')} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground leading-tight">
                  {patient.name} {patient.surname}
                  <span className="text-muted-foreground font-normal text-sm ml-2">• {patient.patientId}</span>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {patient.age} yrs • {patient.gender} • {patient.village}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1 mr-2">
                  <Clock className="h-3 w-3" />
                  {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                </span>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.print()}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Print</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download PDF</TooltipContent>
              </Tooltip>
              <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving}>
                <Save className="mr-1.5 h-3.5 w-3.5" />
                Save Draft
              </Button>
              <Button size="sm" onClick={handleSendToPharmacy} className="bg-primary hover:bg-primary/90">
                <Send className="mr-1.5 h-3.5 w-3.5" />
                Complete & Send to Pharmacy
              </Button>
            </div>
          </div>
        </div>

        <div className="py-4 space-y-4">
          {/* SOAP Notes Section */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-primary" />
                SOAP Notes
              </h2>
            </div>
            <div className="p-4 space-y-4">
              {/* Subjective */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-primary/10 text-primary text-xs font-bold">S</span>
                  Subjective
                  <span className="text-muted-foreground font-normal text-xs">(Chief Complaint)</span>
                </Label>
                <Textarea
                  className="min-h-[80px] text-sm resize-none"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="Patient complains of..."
                />
              </div>

              {/* Objective - Vitals */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-red-500/10 text-red-600 text-xs font-bold">O</span>
                  Vitals
                </Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> BP
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          value={vitals.bp}
                          onChange={(e) => updateVital('bp', e.target.value)}
                          placeholder="120/80"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Blood Pressure (mmHg)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" /> Pulse
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          value={vitals.pulse}
                          onChange={(e) => updateVital('pulse', e.target.value ? Number(e.target.value) : '')}
                          placeholder="72"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Pulse Rate (bpm)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> Temp
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          step="0.1"
                          value={vitals.temp}
                          onChange={(e) => updateVital('temp', e.target.value ? Number(e.target.value) : '')}
                          placeholder="98.6"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Temperature (°F)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wind className="h-3 w-3" /> SpO2
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          value={vitals.spo2}
                          onChange={(e) => updateVital('spo2', e.target.value ? Number(e.target.value) : '')}
                          placeholder="98"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Oxygen Saturation (%)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Scale className="h-3 w-3" /> Weight
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          step="0.1"
                          value={vitals.weight}
                          onChange={(e) => updateVital('weight', e.target.value ? Number(e.target.value) : '')}
                          placeholder="70"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Weight (kg)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Ruler className="h-3 w-3" /> Height
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Input
                          type="number"
                          value={vitals.height}
                          onChange={(e) => updateVital('height', e.target.value ? Number(e.target.value) : '')}
                          placeholder="170"
                          className="h-9 text-sm"
                        />
                      </TooltipTrigger>
                      <TooltipContent>Height (cm)</TooltipContent>
                    </Tooltip>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calculator className="h-3 w-3" /> BMI
                    </Label>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className={`h-9 flex items-center justify-center rounded-md border text-sm font-medium ${bmiCategory ? bmiCategory.bg : 'bg-muted/50'}`}>
                          {bmi ? (
                            <span className={bmiCategory?.color}>{bmi}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>BMI = Weight / (Height/100)²</p>
                        {bmiCategory && <p className={bmiCategory.color}>{bmiCategory.label}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>

              {/* Assessment */}
              <div>
                <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-5 h-5 rounded bg-amber-500/10 text-amber-600 text-xs font-bold">A</span>
                  Assessment
                  <span className="text-muted-foreground font-normal text-xs">(Diagnosis)</span>
                </Label>
                <div className="flex gap-2 mb-2">
                  <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                    <SelectTrigger className="flex-1 h-9 text-sm">
                      <SelectValue placeholder="Select diagnosis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnosisOptions.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Or type custom..."
                    value={customDiagnosis}
                    onChange={(e) => setCustomDiagnosis(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                    className="flex-1 h-9 text-sm"
                  />
                  <Button onClick={addDiagnosis} size="sm" className="h-9 px-3">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {diagnosisList.map((d, i) => (
                    <Badge key={i} variant="secondary" className="text-xs px-2 py-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors" onClick={() => setDiagnosisList(diagnosisList.filter((_, idx) => idx !== i))}>
                      {d} ×
                    </Badge>
                  ))}
                  {diagnosisList.length === 0 && (
                    <span className="text-xs text-muted-foreground">No diagnosis added yet</span>
                  )}
                </div>
              </div>

              {/* Patient History - Collapsible */}
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-between w-full p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <Label className="text-sm font-medium flex items-center gap-2 cursor-pointer">
                      <History className="h-4 w-4 text-purple-600" />
                      Patient History
                      <span className="text-muted-foreground font-normal text-xs">(Past, Family, Social)</span>
                    </Label>
                    {historyOpen ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <div className="grid md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Past Medical History</Label>
                      <Textarea
                        className="min-h-[70px] text-sm resize-none"
                        value={pastHistory}
                        onChange={(e) => setPastHistory(e.target.value)}
                        placeholder="Previous illnesses, surgeries..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Family History</Label>
                      <Textarea
                        className="min-h-[70px] text-sm resize-none"
                        value={familyHistory}
                        onChange={(e) => setFamilyHistory(e.target.value)}
                        placeholder="Diabetes, hypertension in family..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Social History</Label>
                      <Textarea
                        className="min-h-[70px] text-sm resize-none"
                        value={socialHistory}
                        onChange={(e) => setSocialHistory(e.target.value)}
                        placeholder="Smoking, alcohol, occupation..."
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>

          {/* Prescription Table */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/30 flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Pill className="h-4 w-4 text-primary" />
                Prescription
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Search medicine..."
                  value={medicineSearch}
                  onChange={(e) => setMedicineSearch(e.target.value)}
                  className="w-40 h-8 text-sm"
                />
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger className="w-48 h-8 text-sm">
                    <SelectValue placeholder="Select medicine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMedicines.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addMedicine} size="sm" className="h-8 px-3">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
            <div className="p-4">
              {prescriptionItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Medicine</th>
                        <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">M</TooltipTrigger>
                            <TooltipContent>Morning dose</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">A</TooltipTrigger>
                            <TooltipContent>Afternoon dose</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">N</TooltipTrigger>
                            <TooltipContent>Night dose</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">Days</th>
                        <th className="px-2 py-2 text-center font-medium text-muted-foreground w-16">
                          <Tooltip>
                            <TooltipTrigger className="cursor-help">Qty</TooltipTrigger>
                            <TooltipContent>(M + A + N) × Days</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-muted-foreground">Notes</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionItems.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="px-3 py-2 font-medium text-sm">{item.medicineName}</td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center text-sm"
                              value={item.morning}
                              onChange={(e) => updatePrescriptionItem(index, 'morning', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center text-sm"
                              value={item.afternoon}
                              onChange={(e) => updatePrescriptionItem(index, 'afternoon', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center text-sm"
                              value={item.night}
                              onChange={(e) => updatePrescriptionItem(index, 'night', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              type="number"
                              min="1"
                              className="h-8 text-center text-sm"
                              value={item.days}
                              onChange={(e) => updatePrescriptionItem(index, 'days', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <div className="h-8 flex items-center justify-center rounded-md bg-primary/10 text-primary font-semibold text-sm">
                              {item.quantity}
                            </div>
                          </td>
                          <td className="px-1 py-1.5">
                            <Input
                              placeholder="Instructions..."
                              className="h-8 text-sm"
                              value={item.notes}
                              onChange={(e) => updatePrescriptionItem(index, 'notes', e.target.value)}
                            />
                          </td>
                          <td className="px-1 py-1.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removePrescriptionItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Pill className="h-6 w-6 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">No medicines added</p>
                  <p className="text-xs text-muted-foreground/70">Search and select medicines above</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          <div className="bg-card rounded-lg border shadow-sm">
            <div className="p-4 border-b bg-muted/30">
              <h2 className="text-base font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Additional Notes
              </h2>
            </div>
            <div className="p-4">
              <Textarea
                className="min-h-[80px] text-sm resize-none"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional notes or instructions for the patient..."
              />
            </div>
          </div>

          {/* Mobile Action Buttons */}
          <div className="lg:hidden flex gap-2 sticky bottom-4">
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
              <Save className="mr-1.5 h-4 w-4" />
              Save Draft
            </Button>
            <Button className="flex-1" onClick={handleSendToPharmacy}>
              <Send className="mr-1.5 h-4 w-4" />
              Send to Pharmacy
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
