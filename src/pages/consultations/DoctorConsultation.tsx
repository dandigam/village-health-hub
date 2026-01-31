import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Printer, Download, Clock, PanelRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { mockSOAPNotes, mockPatients, mockDoctors, mockMedicines, mockStockItems } from '@/data/mockData';
import { useCamp } from '@/context/CampContext';

// Tab Components
import { PatientSidebar } from '@/components/consultation/PatientSidebar';
import { SubjectiveTab } from '@/components/consultation/SubjectiveTab';
import { ObjectiveTab } from '@/components/consultation/ObjectiveTab';
import { AssessmentTab } from '@/components/consultation/AssessmentTab';
import { PlanTab } from '@/components/consultation/PlanTab';
import { SummaryTab } from '@/components/consultation/SummaryTab';

export default function DoctorConsultation() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { selectedCamp } = useCamp();
  const [searchParams] = useSearchParams();
  const soapId = searchParams.get('soapId');
  const patientId = searchParams.get('patientId');

  const soapNote = mockSOAPNotes.find(n => n.id === soapId);
  const patient = mockPatients.find(p => p.id === patientId);
  const doctor = mockDoctors[0]; // Default doctor for mock

  // UI State
  const [activeTab, setActiveTab] = useState('subject');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Subjective Tab State
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['diabetes', 'htn']);
  const [generalQuestions, setGeneralQuestions] = useState<Record<string, boolean>>({});
  const [diabetesData, setDiabetesData] = useState({
    type: 'gestational',
    onsetDuration: '',
    presentingComplaints: false,
  });
  const [htnData, setHtnData] = useState({
    onsetDuration: '',
    presentingComplaints: false,
  });

  // Objective Tab State
  const [vitals, setVitals] = useState({
    weight: soapNote?.objective.weight || '' as number | '',
    bp: soapNote?.objective.bp || '',
    pulse: soapNote?.objective.pulse || '' as number | '',
    temp: soapNote?.objective.temp || '' as number | '',
    spo2: soapNote?.objective.spo2 || '' as number | '',
  });
  const [labTests, setLabTests] = useState([
    { id: 'lab-1', name: 'BP', date: '', testWithMedicine: null, clinicalResults: '', resultDifference: '-' },
    { id: 'lab-2', name: 'FBS', date: '', testWithMedicine: null, clinicalResults: '', resultDifference: '-' },
    { id: 'lab-3', name: 'PPBS', date: '', testWithMedicine: null, clinicalResults: '', resultDifference: '-' },
    { id: 'lab-4', name: 'HBA1C', date: '', testWithMedicine: null, clinicalResults: '', resultDifference: '-' },
    { id: 'lab-5', name: 'RBS', date: '', testWithMedicine: null, clinicalResults: '', resultDifference: '-' },
  ]);

  // Assessment Tab State
  const [assessmentNotes, setAssessmentNotes] = useState('');
  const [conditionHistories] = useState({});

  // Plan Tab State - Initialize with mock medicines
  const [prescriptionItems, setPrescriptionItems] = useState(() => {
    return mockMedicines.slice(0, 9).map((medicine, index) => {
      const stockItem = mockStockItems.find(s => s.medicineId === medicine.id);
      return {
        id: `rx-${index}`,
        selected: false,
        medicineName: medicine.name,
        qtyAvailable: stockItem?.quantity || 0,
        morning: index % 3 === 0 ? 1 : 0,
        afternoon: index % 2 === 0 ? 1 : 0,
        night: index % 3 === 1 ? 1 : 0,
        days: 56,
        quantityOrdered: 0,
      };
    }).map(item => ({
      ...item,
      quantityOrdered: (item.morning + item.afternoon + item.night) * item.days
    }));
  });

  // Summary Tab State
  const [summaryDescription, setSummaryDescription] = useState('');

  // Diagnosis for sidebar
  const diagnosisList = selectedConditions.map(c => {
    switch(c) {
      case 'diabetes': return 'Diabetes';
      case 'htn': return 'HTN';
      case 'stroke': return 'Stroke';
      case 'asthma': return 'Asthama';
      case 'seizures': return 'APD';
      default: return c;
    }
  });

  // Allergies mock data
  const allergies = {
    drug: true,
    food: false,
    environment: false,
    drugList: ['Penicillin', 'Amoxicillin', 'Sulfa drugs'],
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
    const selectedMedicines = prescriptionItems.filter(item => item.selected);
    if (selectedMedicines.length === 0) {
      toast({
        title: "No Medicines Selected",
        description: "Please select at least one medicine before sending.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Sent to Pharmacy",
      description: `Prescription with ${selectedMedicines.length} medicine(s) sent successfully.`,
    });
    navigate('/consultations');
  };

  const getInitials = (name?: string, surname?: string) => {
    const first = name?.charAt(0) || '';
    const last = surname?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  };

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">Patient not found</p>
          <Button onClick={() => navigate('/consultations')}>Back to Consultations</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <TooltipProvider>
      <DashboardLayout>
        <div className="min-h-[calc(100vh-120px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Patient Header Bar - Redesigned */}
            <div className="bg-primary text-primary-foreground rounded-t-lg overflow-hidden">
              {/* Row 1: Patient Info */}
              <div className="px-4 py-3 flex items-center gap-4 border-b border-primary-foreground/10">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-primary-foreground hover:bg-primary-foreground/10 h-8 w-8 shrink-0"
                  onClick={() => navigate('/consultations')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-12 w-12 border-2 border-primary-foreground/20 shrink-0">
                  <AvatarImage src={patient.photoUrl} />
                  <AvatarFallback className="bg-primary-foreground/20 text-primary-foreground">
                    {getInitials(patient.name, patient.surname)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-semibold text-lg truncate">
                    {patient.name} {patient.surname}
                  </h2>
                  <p className="text-sm text-primary-foreground/70">
                    {patient.patientId} • {patient.gender} • {patient.age} yrs • {patient.village}, {patient.district}
                  </p>
                </div>
              </div>

              {/* Row 2: Vitals, Diagnosis, Allergies */}
              <div className="px-4 py-2 flex items-center gap-6 flex-wrap">
                {/* Vitals with Icons */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5" title="Weight">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{vitals.weight || '--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Blood Pressure">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{vitals.bp || '--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Pulse">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{vitals.pulse || '--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="Temperature">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{vitals.temp ? `${vitals.temp}°F` : '--'}</span>
                  </div>
                  <div className="flex items-center gap-1.5" title="SpO2">
                    <div className="w-7 h-7 rounded-full bg-primary-foreground/10 flex items-center justify-center">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 6v6l4 2"/>
                      </svg>
                    </div>
                    <span className="text-sm font-medium">{vitals.spo2 ? `${vitals.spo2}%` : '--'}</span>
                  </div>
                </div>

                <div className="w-px h-6 bg-primary-foreground/20" />

                {/* Diagnosis Badges */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary-foreground/60 uppercase">Dx:</span>
                  {diagnosisList.map((d, i) => (
                    <Badge key={i} variant="outline" className="bg-accent/20 border-accent text-accent text-xs">
                      {d}
                    </Badge>
                  ))}
                </div>

                <div className="w-px h-6 bg-primary-foreground/20" />

                {/* Allergies */}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-primary-foreground/60 uppercase">Allergies:</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={allergies.drug ? "destructive" : "secondary"} className="text-xs">
                      Drug {allergies.drug ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={allergies.food ? "destructive" : "secondary"} className="text-xs">
                      Food {allergies.food ? '✓' : '✗'}
                    </Badge>
                    <Badge variant={allergies.environment ? "destructive" : "secondary"} className="text-xs">
                      Env {allergies.environment ? '✓' : '✗'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start rounded-none bg-slate-700 p-0 h-auto">
                <TabsTrigger 
                  value="subject" 
                  className="rounded-none px-6 py-3 text-white data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:text-white"
                >
                  <div className="text-left">
                    <p className="font-medium">Subject</p>
                    <p className="text-[10px] opacity-80">Chief Complaints</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="objective"
                  className="rounded-none px-6 py-3 text-white data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:text-white"
                >
                  <div className="text-left">
                    <p className="font-medium">Objective</p>
                    <p className="text-[10px] opacity-80">Vitals / Labs</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="assessment"
                  className="rounded-none px-6 py-3 text-white data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:text-white"
                >
                  <div className="text-left">
                    <p className="font-medium">Assessment</p>
                    <p className="text-[10px] opacity-80">Diagnosis</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="plan"
                  className="rounded-none px-6 py-3 text-white data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:text-white"
                >
                  <div className="text-left">
                    <p className="font-medium">Plan / Recommendation</p>
                    <p className="text-[10px] opacity-80">Inside RX / Outside RX</p>
                  </div>
                </TabsTrigger>
                <TabsTrigger 
                  value="summary"
                  className="rounded-none px-6 py-3 text-white data-[state=active]:bg-white data-[state=active]:text-slate-800 data-[state=inactive]:text-slate-300 data-[state=inactive]:hover:text-white"
                >
                  <div className="text-left">
                    <p className="font-medium">Summary</p>
                    <p className="text-[10px] opacity-80">Description</p>
                  </div>
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents */}
              <div className="flex-1 bg-white rounded-b-lg border border-t-0 p-6 overflow-auto">
                <TabsContent value="subject" className="m-0">
                  <SubjectiveTab
                    selectedConditions={selectedConditions}
                    onConditionsChange={setSelectedConditions}
                    generalQuestions={generalQuestions}
                    onGeneralQuestionsChange={setGeneralQuestions}
                    diabetesData={diabetesData}
                    onDiabetesDataChange={setDiabetesData}
                    htnData={htnData}
                    onHtnDataChange={setHtnData}
                  />
                </TabsContent>

                <TabsContent value="objective" className="m-0">
                  <ObjectiveTab
                    vitals={vitals}
                    onVitalsChange={setVitals}
                    labTests={labTests}
                    onLabTestsChange={setLabTests}
                  />
                </TabsContent>

                <TabsContent value="assessment" className="m-0">
                  <AssessmentTab
                    conditionHistories={conditionHistories}
                    notes={assessmentNotes}
                    onNotesChange={setAssessmentNotes}
                  />
                </TabsContent>

                <TabsContent value="plan" className="m-0">
                  <PlanTab
                    prescriptionItems={prescriptionItems}
                    onPrescriptionItemsChange={setPrescriptionItems}
                  />
                </TabsContent>

                <TabsContent value="summary" className="m-0">
                  <SummaryTab
                    description={summaryDescription}
                    onDescriptionChange={setSummaryDescription}
                    patientSummary={{
                      name: `${patient.name} ${patient.surname}`,
                      age: patient.age,
                      gender: patient.gender,
                      conditions: diagnosisList,
                      prescribedMedicines: prescriptionItems.filter(i => i.selected).map(i => i.medicineName),
                    }}
                  />
                </TabsContent>
              </div>

              {/* Action Buttons Footer */}
              <div className="bg-card border rounded-lg mt-4 p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {lastSaved && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {isSaving ? 'Saving...' : `Last saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" onClick={() => window.print()}>
                        <Printer className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Print</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download PDF</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                      >
                        <PanelRight className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Patient Details</TooltipContent>
                  </Tooltip>
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSendToPharmacy}>
                    <Send className="mr-1.5 h-4 w-4" />
                    Complete & Send to Pharmacy
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Right Sidebar as Sheet */}
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetContent side="right" className="w-[380px] p-0">
              <PatientSidebar
                patient={patient}
                doctor={doctor}
                campName={selectedCamp}
                date={new Date().toLocaleDateString('en-GB')}
                vitals={vitals}
                diagnosis={diagnosisList}
                allergies={allergies}
                onClose={() => setIsSidebarOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
