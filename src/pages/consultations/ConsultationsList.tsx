import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ConsultationRow } from '@/components/consultations/ConsultationRow';
import { useSOAPNotes, usePatients, useConsultations } from '@/hooks/useApiData';

export default function ConsultationsList() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: patients = [] } = usePatients();
  const { data: soapNotes = [] } = useSOAPNotes();
  const { data: consultations = [] } = useConsultations();

  const getPatientInfo = (patientId: string) => {
    return patients.find(p => p.id === patientId);
  };

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

  const allPendingSOAPs = soapNotes.filter(n => n.status === 'pending' || n.status === 'with_doctor');
  const pendingSOAPs = useMemo(() => filterBySearch(allPendingSOAPs), [searchQuery, allPendingSOAPs, patients]);
  
  const allInProgressConsultations = consultations.filter(c => c.status === 'in_progress');
  const inProgressConsultations = useMemo(() => filterBySearch(allInProgressConsultations), [searchQuery, allInProgressConsultations, patients]);
  
  const allCompletedConsultations = consultations.filter(c => c.status === 'completed');
  const completedConsultations = useMemo(() => filterBySearch(allCompletedConsultations), [searchQuery, allCompletedConsultations, patients]);

  const currentCount = activeTab === 'pending' 
    ? pendingSOAPs.length 
    : activeTab === 'in_progress' 
    ? inProgressConsultations.length 
    : completedConsultations.length;

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold text-foreground whitespace-nowrap">
          Doctor Consultations <span className="text-muted-foreground font-normal">({currentCount})</span>
        </h1>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search Patient by MR Number / First Name" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10 h-10 bg-background border-border" />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Awaiting ({pendingSOAPs.length})</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress ({inProgressConsultations.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedConsultations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-3">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return <ConsultationRow key={note.id} patient={patient} note={note} status="awaiting" />;
            })}
            {pendingSOAPs.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No patients awaiting consultation.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid gap-3">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = soapNotes.find(n => n.patientId === consultation.patientId);
              return <ConsultationRow key={consultation.id} patient={patient} note={soapNote} consultation={consultation} status="in_progress" />;
            })}
            {inProgressConsultations.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No consultations in progress.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-3">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = soapNotes.find(n => n.patientId === consultation.patientId);
              return <ConsultationRow key={consultation.id} patient={patient} note={soapNote} consultation={consultation} status="completed" />;
            })}
            {completedConsultations.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No completed consultations.</CardContent></Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
