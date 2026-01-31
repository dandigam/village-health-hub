import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ArrowLeft, Save, Send, Plus, X, Pill, FlaskConical, Scissors, 
  ChevronDown, ChevronUp, Activity, Thermometer, Heart, Wind,
  Scale, Ruler, Calculator, FileText, History, User, Clock,
  Printer, Download
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
  'Type 2 Diabetes',
  'Viral Fever',
  'Upper Respiratory Infection',
  'Gastritis',
  'Anxiety Disorder',
  'Lower Back Pain',
  'Allergic Rhinitis'
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
  const [assessment, setAssessment] = useState(soapNote?.assessment || '');
  const [selectedDiagnosis, setSelectedDiagnosis] = useState('');
  const [customDiagnosis, setCustomDiagnosis] = useState('');
  const [diagnosisList, setDiagnosisList] = useState<string[]>([]);

  // History State
  const [pastHistory, setPastHistory] = useState('');
  const [familyHistory, setFamilyHistory] = useState('');
  const [socialHistory, setSocialHistory] = useState('');

  // Lab & Operations
  const [labTests, setLabTests] = useState<string[]>([]);
  const [newLabTest, setNewLabTest] = useState('');
  const [suggestedOperations, setSuggestedOperations] = useState<string[]>([]);
  const [newOperation, setNewOperation] = useState('');

  // Prescription
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');
  const [medicineSearch, setMedicineSearch] = useState('');

  // Additional Notes
  const [additionalNotes, setAdditionalNotes] = useState('');

  // UI State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [labTestsOpen, setLabTestsOpen] = useState(true);
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
    if (value < 18.5) return { label: 'Underweight', color: 'text-blue-600' };
    if (value < 25) return { label: 'Normal', color: 'text-green-600' };
    if (value < 30) return { label: 'Overweight', color: 'text-yellow-600' };
    return { label: 'Obese', color: 'text-red-600' };
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
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (subjective || diagnosisList.length > 0 || prescriptionItems.length > 0) {
        handleAutoSave();
      }
    }, 10000); // Auto-save every 10 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [subjective, vitals, assessment, diagnosisList, prescriptionItems, additionalNotes]);

  const handleAutoSave = () => {
    setIsSaving(true);
    // Simulate save
    setTimeout(() => {
      setLastSaved(new Date());
      setIsSaving(false);
    }, 500);
  };

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

  const addLabTest = () => {
    if (newLabTest.trim() && !labTests.includes(newLabTest.trim())) {
      setLabTests([...labTests, newLabTest.trim()]);
      setNewLabTest('');
    }
  };

  const addOperation = () => {
    if (newOperation.trim() && !suggestedOperations.includes(newOperation.trim())) {
      setSuggestedOperations([...suggestedOperations, newOperation.trim()]);
      setNewOperation('');
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
    // Auto-calculate quantity
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
        description: "Your consultation has been saved as a draft.",
      });
    }, 500);
  };

  const handleSendToPharmacy = () => {
    if (prescriptionItems.length === 0) {
      toast({
        title: "No Prescription",
        description: "Please add at least one medicine before sending to pharmacy.",
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient or SOAP Note not found</p>
          <Button className="mt-4" onClick={() => navigate('/consultations')}>
            Back to Consultations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout campName="Bapatla">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b -mx-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/consultations')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Doctor Consultation</h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">{patient.name} {patient.surname}</span>
                <span>•</span>
                <span>{patient.patientId}</span>
                <span>•</span>
                <span>{patient.age} yrs, {patient.gender}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {isSaving ? 'Saving...' : `Saved ${lastSaved.toLocaleTimeString()}`}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => console.log('Print')}>
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handleSendToPharmacy}>
              <Send className="mr-2 h-4 w-4" />
              Complete & Send to Pharmacy
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Sidebar - Patient Info */}
        <div className="lg:col-span-3 space-y-4">
          {/* Patient Quick Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Patient Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ID</span>
                <span className="font-mono font-medium">{patient.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{patient.name} {patient.surname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age/Gender</span>
                <span>{patient.age} yrs / {patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Village</span>
                <span>{patient.village}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone</span>
                <span>{patient.phone}</span>
              </div>
            </CardContent>
          </Card>

          {/* Previous Consultations */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Previous Visits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground text-center py-4">
                No previous consultations
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-6">
          {/* SOAP Notes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SOAP Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Subjective */}
              <div>
                <Label className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">S</span>
                  Subjective (Chief Complaint)
                </Label>
                <Textarea
                  className="min-h-[100px]"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  placeholder="Patient complains of..."
                />
              </div>

              <Separator />

              {/* Objective - Vitals */}
              <div>
                <Label className="text-sm font-semibold text-primary flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">O</span>
                  Objective (Vitals)
                </Label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Activity className="h-3 w-3" /> BP (mmHg)
                    </Label>
                    <Input
                      value={vitals.bp}
                      onChange={(e) => updateVital('bp', e.target.value)}
                      placeholder="120/80"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Heart className="h-3 w-3" /> Pulse (bpm)
                    </Label>
                    <Input
                      type="number"
                      value={vitals.pulse}
                      onChange={(e) => updateVital('pulse', e.target.value ? Number(e.target.value) : '')}
                      placeholder="72"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Thermometer className="h-3 w-3" /> Temp (°F)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vitals.temp}
                      onChange={(e) => updateVital('temp', e.target.value ? Number(e.target.value) : '')}
                      placeholder="98.6"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Wind className="h-3 w-3" /> SpO2 (%)
                    </Label>
                    <Input
                      type="number"
                      value={vitals.spo2}
                      onChange={(e) => updateVital('spo2', e.target.value ? Number(e.target.value) : '')}
                      placeholder="98"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Scale className="h-3 w-3" /> Weight (kg)
                    </Label>
                    <Input
                      type="number"
                      step="0.1"
                      value={vitals.weight}
                      onChange={(e) => updateVital('weight', e.target.value ? Number(e.target.value) : '')}
                      placeholder="70"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Ruler className="h-3 w-3" /> Height (cm)
                    </Label>
                    <Input
                      type="number"
                      value={vitals.height}
                      onChange={(e) => updateVital('height', e.target.value ? Number(e.target.value) : '')}
                      placeholder="170"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <Label className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calculator className="h-3 w-3" /> BMI
                          </Label>
                          <div className="mt-1 h-10 flex items-center justify-center rounded-md border bg-muted/50 font-medium">
                            {bmi ? (
                              <span className={bmiCategory?.color}>{bmi}</span>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
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

              <Separator />

              {/* Assessment */}
              <div>
                <Label className="text-sm font-semibold text-primary flex items-center gap-2 mb-2">
                  <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">A</span>
                  Assessment (Diagnosis)
                </Label>
                <div className="flex gap-2 mb-3">
                  <Select value={selectedDiagnosis} onValueChange={setSelectedDiagnosis}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select diagnosis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {diagnosisOptions.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-muted-foreground self-center">or</span>
                  <Input
                    placeholder="Custom diagnosis..."
                    value={customDiagnosis}
                    onChange={(e) => setCustomDiagnosis(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                    className="flex-1"
                  />
                  <Button onClick={addDiagnosis} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {diagnosisList.map((d, i) => (
                    <Badge key={i} variant="secondary" className="flex items-center gap-1 px-3 py-1">
                      {d}
                      <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => setDiagnosisList(diagnosisList.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                  {diagnosisList.length === 0 && (
                    <span className="text-sm text-muted-foreground">No diagnosis added</span>
                  )}
                </div>
              </div>

              <Separator />

              {/* History - Collapsible */}
              <Collapsible open={historyOpen} onOpenChange={setHistoryOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <Label className="text-sm font-semibold text-primary flex items-center gap-2 cursor-pointer">
                      <History className="h-4 w-4" />
                      Medical History
                    </Label>
                    {historyOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">Past Medical History</Label>
                      <Textarea
                        className="mt-1 min-h-[80px]"
                        value={pastHistory}
                        onChange={(e) => setPastHistory(e.target.value)}
                        placeholder="Previous illnesses, surgeries, allergies..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Family History</Label>
                      <Textarea
                        className="mt-1 min-h-[80px]"
                        value={familyHistory}
                        onChange={(e) => setFamilyHistory(e.target.value)}
                        placeholder="Diabetes, hypertension, heart disease in family..."
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Social History</Label>
                      <Textarea
                        className="mt-1 min-h-[80px]"
                        value={socialHistory}
                        onChange={(e) => setSocialHistory(e.target.value)}
                        placeholder="Smoking, alcohol, occupation..."
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>

          {/* Lab Tests & Operations */}
          <Collapsible open={labTestsOpen} onOpenChange={setLabTestsOpen}>
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FlaskConical className="h-5 w-5" />
                      Lab Tests & Suggested Operations
                    </span>
                    {labTestsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Lab Tests */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <FlaskConical className="h-4 w-4 text-blue-600" />
                        Lab Tests
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add lab test..."
                          value={newLabTest}
                          onChange={(e) => setNewLabTest(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addLabTest()}
                        />
                        <Button onClick={addLabTest} size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {labTests.map((t, i) => (
                          <Badge key={i} variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-700 border-blue-200">
                            {t}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setLabTests(labTests.filter((_, idx) => idx !== i))} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Suggested Operations */}
                    <div>
                      <Label className="text-sm font-medium flex items-center gap-2 mb-2">
                        <Scissors className="h-4 w-4 text-red-600" />
                        Suggested Operations
                      </Label>
                      <div className="flex gap-2 mb-3">
                        <Input
                          placeholder="Add operation..."
                          value={newOperation}
                          onChange={(e) => setNewOperation(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addOperation()}
                        />
                        <Button onClick={addOperation} size="icon" variant="outline">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {suggestedOperations.map((o, i) => (
                          <Badge key={i} variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                            {o}
                            <X className="h-3 w-3 cursor-pointer" onClick={() => setSuggestedOperations(suggestedOperations.filter((_, idx) => idx !== i))} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Prescription Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Medicine Search & Add */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search medicine..."
                    value={medicineSearch}
                    onChange={(e) => setMedicineSearch(e.target.value)}
                    className="pr-8"
                  />
                </div>
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select medicine..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredMedicines.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} <span className="text-muted-foreground">({m.category})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addMedicine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Medicine
                </Button>
              </div>

              {/* Prescription Table */}
              {prescriptionItems.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-3 text-left font-medium">Medicine</th>
                        <th className="p-3 text-center w-20 font-medium">
                          <Tooltip>
                            <TooltipTrigger>M</TooltipTrigger>
                            <TooltipContent>Morning</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="p-3 text-center w-20 font-medium">
                          <Tooltip>
                            <TooltipTrigger>A</TooltipTrigger>
                            <TooltipContent>Afternoon</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="p-3 text-center w-20 font-medium">
                          <Tooltip>
                            <TooltipTrigger>N</TooltipTrigger>
                            <TooltipContent>Night</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="p-3 text-center w-20 font-medium">Days</th>
                        <th className="p-3 text-center w-20 font-medium">
                          <Tooltip>
                            <TooltipTrigger>Qty</TooltipTrigger>
                            <TooltipContent>(M+A+N) × Days</TooltipContent>
                          </Tooltip>
                        </th>
                        <th className="p-3 text-left font-medium">Notes</th>
                        <th className="p-3 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionItems.map((item, index) => (
                        <tr key={item.id} className="border-t hover:bg-muted/30">
                          <td className="p-3 font-medium">{item.medicineName}</td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-9 text-center"
                              value={item.morning}
                              onChange={(e) => updatePrescriptionItem(index, 'morning', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-9 text-center"
                              value={item.afternoon}
                              onChange={(e) => updatePrescriptionItem(index, 'afternoon', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-9 text-center"
                              value={item.night}
                              onChange={(e) => updatePrescriptionItem(index, 'night', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-3">
                            <Input
                              type="number"
                              min="1"
                              className="h-9 text-center"
                              value={item.days}
                              onChange={(e) => updatePrescriptionItem(index, 'days', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center justify-center h-9 w-full rounded-md border bg-muted/50 font-semibold">
                              {item.quantity}
                            </span>
                          </td>
                          <td className="p-3">
                            <Input
                              placeholder="Instructions..."
                              className="h-9"
                              value={item.notes}
                              onChange={(e) => updatePrescriptionItem(index, 'notes', e.target.value)}
                            />
                          </td>
                          <td className="p-3">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removePrescriptionItem(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                  <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No medicines added yet</p>
                  <p className="text-sm">Search and add medicines from the dropdown above</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Additional Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[100px]"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Any additional notes, instructions for the patient, follow-up recommendations..."
              />
            </CardContent>
          </Card>

          {/* Bottom Action Buttons (Mobile) */}
          <div className="lg:hidden flex gap-3 sticky bottom-4">
            <Button variant="outline" className="flex-1" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={handleSendToPharmacy}>
              <Send className="mr-2 h-4 w-4" />
              Send to Pharmacy
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
