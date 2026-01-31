import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockSOAPNotes, mockPatients, mockConsultations } from '@/data/mockData';
import { ConsultationCard } from '@/components/consultations/ConsultationCard';

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
      {/* Section Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#2563EB]">Doctor Consultations</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent patient consultations</p>
        <div className="h-px bg-border mt-4" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-muted/50">
          <TabsTrigger value="pending" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Awaiting Consultation ({pendingSOAPs.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            In Progress ({inProgressConsultations.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
            Completed ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <ConsultationCard
                  key={note.id}
                  patient={patient}
                  note={note}
                  status="Awaiting"
                  statusColor="awaiting"
                  actions={
                    <>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs h-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                        onClick={() => navigate(`/soap/${note.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View SOAP
                      </Button>
                      <Button 
                        size="sm" 
                        className="text-xs h-8 bg-[#F43F5E] hover:bg-[#E11D48] text-white"
                        onClick={() => navigate(`/consultations/new?soapId=${note.id}&patientId=${note.patientId}`)}
                      >
                        <Play className="h-3.5 w-3.5 mr-1.5" />
                        Start
                      </Button>
                    </>
                  }
                />
              );
            })}
          </div>
          {pendingSOAPs.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-muted-foreground shadow-sm">
              No patients awaiting consultation.
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <ConsultationCard
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  status="In Progress"
                  statusColor="in_progress"
                  actions={
                    <Button 
                      size="sm" 
                      className="w-full text-xs h-8 bg-[#3B82F6] hover:bg-[#2563EB] text-white"
                    >
                      <Play className="h-3.5 w-3.5 mr-1.5" />
                      Continue Consultation
                    </Button>
                  }
                />
              );
            })}
          </div>
          {inProgressConsultations.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-muted-foreground shadow-sm">
              No consultations in progress.
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <ConsultationCard
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  status="Completed"
                  statusColor="completed"
                  actions={
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full text-xs h-8 border-gray-300 text-gray-600 hover:bg-gray-50"
                      onClick={() => navigate(`/consultations/${consultation.id}`)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View Details
                    </Button>
                  }
                />
              );
            })}
          </div>
          {completedConsultations.length === 0 && (
            <div className="bg-white rounded-xl p-8 text-center text-muted-foreground shadow-sm">
              No completed consultations.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
