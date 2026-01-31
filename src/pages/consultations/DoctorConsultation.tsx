import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Printer, Download, Clock } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
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
        <div className="flex gap-6 min-h-[calc(100vh-120px)]">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Patient Header Bar */}
            <div className="bg-slate-800 text-white rounded-t-lg px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-slate-700 h-8 w-8"
                  onClick={() => navigate('/consultations')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Avatar className="h-10 w-10 border-2 border-white/20">
                  <AvatarImage src={patient.photoUrl} />
                  <AvatarFallback className="bg-slate-600 text-white">
                    {getInitials(patient.name, patient.surname)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span className="font-semibold">
                    {patient.patientId} | {patient.name} {patient.surname} | {patient.gender} | {patient.age}
                  </span>
                  <p className="text-xs text-slate-300">{patient.village} | {patient.district}</p>
                </div>
              </div>

              {/* Inline Vitals Badges */}
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Vitals</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-white text-xs">
                      Weight {vitals.weight || '--'}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-white text-xs">
                      BP {vitals.bp || '--'}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-white text-xs">
                      Pulse {vitals.pulse || '--'}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-white text-xs">
                      Temp {vitals.temp ? `${vitals.temp}°F` : '--'}
                    </Badge>
                    <Badge variant="outline" className="bg-slate-700 border-slate-600 text-white text-xs">
                      SpO2 {vitals.spo2 ? `${vitals.spo2}%` : '--'}
                    </Badge>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Diagnosis</p>
                  <div className="flex gap-1 mt-1">
                    {diagnosisList.map((d, i) => (
                      <Badge key={i} variant="outline" className="bg-transparent border-amber-400 text-amber-400 text-xs">
                        {d}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-slate-400 uppercase">Allergies</p>
                  <div className="flex gap-2 mt-1 text-xs">
                    <span>Drug <Badge variant={allergies.drug ? "destructive" : "secondary"} className="ml-1 text-[10px]">{allergies.drug ? 'Yes' : 'No'}</Badge></span>
                    <span>Food <Badge variant={allergies.food ? "destructive" : "secondary"} className="ml-1 text-[10px]">{allergies.food ? 'Yes' : 'No'}</Badge></span>
                    <span>Environment <Badge variant={allergies.environment ? "destructive" : "secondary"} className="ml-1 text-[10px]">{allergies.environment ? 'Yes' : 'No'}</Badge></span>
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
              <div className="bg-white border rounded-lg mt-4 p-4 flex items-center justify-between">
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
                  <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
                    <Save className="mr-1.5 h-4 w-4" />
                    Save Draft
                  </Button>
                  <Button onClick={handleSendToPharmacy} className="bg-primary hover:bg-primary/90">
                    <Send className="mr-1.5 h-4 w-4" />
                    Complete & Send to Pharmacy
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <PatientSidebar
            patient={patient}
            doctor={doctor}
            campName={selectedCamp}
            date={new Date().toLocaleDateString('en-GB')}
            vitals={vitals}
            diagnosis={diagnosisList}
            allergies={allergies}
          />
        </div>
      </DashboardLayout>
    </TooltipProvider>
  );
}
