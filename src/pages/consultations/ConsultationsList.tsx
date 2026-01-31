import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, FileText, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockSOAPNotes, mockPatients, mockConsultations } from '@/data/mockData';

export default function ConsultationsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  // Pending SOAP notes (waiting for doctor)
  const pendingSOAPs = mockSOAPNotes.filter(n => n.status === 'pending' || n.status === 'with_doctor');
  // In-progress consultations
  const inProgressConsultations = mockConsultations.filter(c => c.status === 'in_progress');
  // Completed consultations
  const completedConsultations = mockConsultations.filter(c => c.status === 'completed');

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">Doctor Consultations</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Awaiting Consultation ({pendingSOAPs.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressConsultations.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {patient?.name} {patient?.surname} • {patient?.age} yrs • {patient?.gender}
                          </h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Chief Complaint:</span> {note.subjective.substring(0, 80)}...
                          </p>
                          <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                            <span>BP: {note.objective.bp}</span>
                            <span>Pulse: {note.objective.pulse} bpm</span>
                            <span>SpO2: {note.objective.spo2}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                          Awaiting
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/soap/${note.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View SOAP
                        </Button>
                        <Button 
                          size="sm" 
                          className="bg-accent hover:bg-accent/90"
                          onClick={() => navigate(`/consultations/new?soapId=${note.id}&patientId=${note.patientId}`)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {pendingSOAPs.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No patients awaiting consultation.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid gap-4">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              return (
                <Card key={consultation.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {patient?.name} {patient?.surname}
                          </h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Complaint:</span> {consultation.chiefComplaint}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                          In Progress
                        </Badge>
                        <Button size="sm" className="bg-accent hover:bg-accent/90">
                          Continue Consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {inProgressConsultations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No consultations in progress.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              return (
                <Card key={consultation.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                          <Stethoscope className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {patient?.name} {patient?.surname}
                          </h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Diagnosis:</span> {consultation.diagnosis.join(', ')}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Completed: {new Date(consultation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Completed
                        </Badge>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/consultations/${consultation.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {completedConsultations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No completed consultations.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
