import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { ConsultationRow } from '@/components/consultations/ConsultationRow';
import { mockSOAPNotes, mockPatients, mockConsultations } from '@/data/mockData';

export default function ConsultationsList() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  // Filter function
  const filterBySearch = (items: any[]) => {
    if (!searchQuery) return items;
    const searchLower = searchQuery.toLowerCase();
    
    return items.filter(item => {
      const patient = getPatientInfo(item.patientId);
      return (
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower)
      );
    });
  };

  // Pending SOAP notes (waiting for doctor)
  const allPendingSOAPs = mockSOAPNotes.filter(n => n.status === 'pending' || n.status === 'with_doctor');
  const pendingSOAPs = useMemo(() => filterBySearch(allPendingSOAPs), [searchQuery, allPendingSOAPs]);
  
  // In-progress consultations
  const allInProgressConsultations = mockConsultations.filter(c => c.status === 'in_progress');
  const inProgressConsultations = useMemo(() => filterBySearch(allInProgressConsultations), [searchQuery, allInProgressConsultations]);
  
  // Completed consultations
  const allCompletedConsultations = mockConsultations.filter(c => c.status === 'completed');
  const completedConsultations = useMemo(() => filterBySearch(allCompletedConsultations), [searchQuery, allCompletedConsultations]);

  const currentCount = activeTab === 'pending' 
    ? pendingSOAPs.length 
    : activeTab === 'in_progress' 
    ? inProgressConsultations.length 
    : completedConsultations.length;

  return (
    <DashboardLayout campName="Bapatla">
      {/* Search Filter Header */}
      <SearchFilter
        title="Doctor Consultations"
        count={currentCount}
        placeholder="Search Patient by MR Number / First Name"
        value={searchQuery}
        onChange={setSearchQuery}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">
            Awaiting ({pendingSOAPs.length})
          </TabsTrigger>
          <TabsTrigger value="in_progress">
            In Progress ({inProgressConsultations.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-3">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <ConsultationRow
                  key={note.id}
                  patient={patient}
                  note={note}
                  status="awaiting"
                />
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
          <div className="grid gap-3">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <ConsultationRow
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  consultation={consultation}
                  status="in_progress"
                />
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
          <div className="grid gap-3">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return (
                <ConsultationRow
                  key={consultation.id}
                  patient={patient}
                  note={soapNote}
                  consultation={consultation}
                  status="completed"
                />
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
