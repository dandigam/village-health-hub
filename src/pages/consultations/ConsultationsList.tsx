import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, FileText, Stethoscope, User } from 'lucide-react';
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

  const PatientCard = ({ 
    patient, 
    note, 
    status, 
    statusColor, 
    actions 
  }: { 
    patient: any; 
    note?: any; 
    status: string; 
    statusColor: string;
    actions: React.ReactNode;
  }) => (
    <Card className="hover:shadow-lg transition-shadow border border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">
              {patient?.name} {patient?.surname} • {patient?.age} yrs • {patient?.gender}
            </h3>
            <p className="text-xs text-muted-foreground">{patient?.patientId}</p>
          </div>
          <Badge className={`${statusColor} text-xs flex-shrink-0`}>
            {status}
          </Badge>
        </div>
        
        {note && (
          <>
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1">
                <span className="font-medium text-foreground">Chief Complaint:</span>
              </p>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {note.subjective}
              </p>
            </div>
            
            <div className="flex gap-3 text-xs text-muted-foreground mb-4 bg-muted/50 rounded-md p-2">
              <span><span className="font-medium">BP:</span> {note.objective.bp}</span>
              <span><span className="font-medium">Pulse:</span> {note.objective.pulse} bpm</span>
              <span><span className="font-medium">SpO2:</span> {note.objective.spo2}%</span>
            </div>
          </>
        )}
        
        <div className="flex gap-2 flex-wrap">
          {actions}
        </div>
      </CardContent>
    </Card>
  );

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <PatientCard
                  key={note.id}
                  patient={patient}
                  note={note}
                  status="Awaiting"
                  statusColor="bg-yellow-100 text-yellow-700 border-yellow-200"
                  actions={
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1 text-xs h-8"
                        onClick={() => navigate(`/soap/${note.id}`)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View SOAP
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 bg-accent hover:bg-accent/90 text-xs h-8"
                        onClick={() => navigate(`/consultations/new?soapId=${note.id}&patientId=${note.patientId}`)}
                      >
                        <Play className="h-3 w-3 mr-1" />
                        Start
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
          {pendingSOAPs.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No patients awaiting consultation.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <PatientCard
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  status="In Progress"
                  statusColor="bg-orange-100 text-orange-700 border-orange-200"
                  actions={
                    <Button 
                      size="sm" 
                      className="w-full bg-accent hover:bg-accent/90 text-xs h-8"
                    >
                      <Stethoscope className="h-3 w-3 mr-1" />
                      Continue Consultation
                    </Button>
                  }
                />
              );
            })}
          </div>
          {inProgressConsultations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No consultations in progress.
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <PatientCard
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  status="Completed"
                  statusColor="bg-green-100 text-green-700 border-green-200"
                  actions={
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full text-xs h-8"
                      onClick={() => navigate(`/consultations/${consultation.id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                  }
                />
              );
            })}
          </div>
          {completedConsultations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No completed consultations.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
