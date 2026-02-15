import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Send, ArrowLeft, Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatients } from '@/hooks/useApiData';
import type { Patient } from '@/types';

export default function NewSOAPNote() {
  const navigate = useNavigate();
  const { data: allPatients = [] } = usePatients();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientList, setShowPatientList] = useState(false);
  
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState({ weight: '', bp: '', pulse: '', temp: '', spo2: '', notes: '' });
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  const filteredPatients = allPatients.filter(p => 
    p.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    p.patientId.toLowerCase().includes(patientSearch.toLowerCase())
  );

  const handleSaveDraft = () => {
    console.log('Saving as draft...');
    navigate('/soap');
  };

  const handleSendToDoctor = () => {
    console.log('Sending to doctor...');
    navigate('/soap');
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/soap')}><ArrowLeft className="h-5 w-5" /></Button>
          <h1 className="page-title">New SOAP Note</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSaveDraft}><Save className="mr-2 h-4 w-4" />Save Draft</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleSendToDoctor}><Send className="mr-2 h-4 w-4" />Send to Doctor</Button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-foreground whitespace-nowrap">
            {selectedPatient ? 'Selected Patient' : 'Select Patient'}
          </h2>
          {selectedPatient ? (
            <div className="flex items-center gap-4 px-4 py-2 bg-muted rounded-lg border">
              <div>
                <p className="font-medium">{selectedPatient.name} {selectedPatient.surname}</p>
                <p className="text-sm text-muted-foreground">{selectedPatient.patientId} • {selectedPatient.age} yrs • {selectedPatient.gender}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>Change</Button>
            </div>
          ) : (
            <div className="relative w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search by MR Number / Name..." className="pl-10 h-10 bg-background border-border" value={patientSearch} onChange={(e) => { setPatientSearch(e.target.value); setShowPatientList(true); }} onFocus={() => setShowPatientList(true)} />
              {showPatientList && patientSearch && (
                <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredPatients.map(patient => (
                    <div key={patient.id} className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0" onClick={() => { setSelectedPatient(patient); setShowPatientList(false); setPatientSearch(''); }}>
                      <p className="font-medium">{patient.name} {patient.surname}</p>
                      <p className="text-sm text-muted-foreground">{patient.patientId} • {patient.age} yrs • {patient.gender}</p>
                    </div>
                  ))}
                  {filteredPatients.length === 0 && <p className="p-3 text-muted-foreground">No patients found</p>}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="subjective">
            <TabsList className="grid grid-cols-4 w-full mb-6">
              <TabsTrigger value="subjective">S - Subjective</TabsTrigger>
              <TabsTrigger value="objective">O - Objective</TabsTrigger>
              <TabsTrigger value="assessment">A - Assessment</TabsTrigger>
              <TabsTrigger value="plan">P - Plan</TabsTrigger>
            </TabsList>
            <TabsContent value="subjective" className="space-y-4">
              <div><Label htmlFor="subjective">Patient Complaints / Chief Complaint</Label><Textarea id="subjective" placeholder="Enter patient's complaints, symptoms, and history in their own words..." className="min-h-[200px] mt-2" value={subjective} onChange={(e) => setSubjective(e.target.value)} /></div>
            </TabsContent>
            <TabsContent value="objective" className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                <div><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" placeholder="72" value={objective.weight} onChange={(e) => setObjective({...objective, weight: e.target.value})} /></div>
                <div><Label htmlFor="bp">Blood Pressure</Label><Input id="bp" placeholder="120/80" value={objective.bp} onChange={(e) => setObjective({...objective, bp: e.target.value})} /></div>
                <div><Label htmlFor="pulse">Pulse (bpm)</Label><Input id="pulse" type="number" placeholder="72" value={objective.pulse} onChange={(e) => setObjective({...objective, pulse: e.target.value})} /></div>
                <div><Label htmlFor="temp">Temperature (°F)</Label><Input id="temp" placeholder="98.6" value={objective.temp} onChange={(e) => setObjective({...objective, temp: e.target.value})} /></div>
                <div><Label htmlFor="spo2">SpO2 (%)</Label><Input id="spo2" type="number" placeholder="98" value={objective.spo2} onChange={(e) => setObjective({...objective, spo2: e.target.value})} /></div>
              </div>
              <div><Label htmlFor="objNotes">Observations / Physical Exam Notes</Label><Textarea id="objNotes" placeholder="Enter physical examination findings, observations..." className="min-h-[120px] mt-2" value={objective.notes} onChange={(e) => setObjective({...objective, notes: e.target.value})} /></div>
            </TabsContent>
            <TabsContent value="assessment" className="space-y-4">
              <div><Label htmlFor="assessment">Initial Assessment / Provisional Diagnosis</Label><Textarea id="assessment" placeholder="Enter your initial assessment based on subjective and objective findings..." className="min-h-[200px] mt-2" value={assessment} onChange={(e) => setAssessment(e.target.value)} /></div>
            </TabsContent>
            <TabsContent value="plan" className="space-y-4">
              <div><Label htmlFor="plan">Plan / Suggested Actions</Label><Textarea id="plan" placeholder="Enter suggested plan of action, referrals, tests needed..." className="min-h-[200px] mt-2" value={plan} onChange={(e) => setPlan(e.target.value)} /></div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
