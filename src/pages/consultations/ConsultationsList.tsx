import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Search, Calendar, X, FileText, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockSOAPNotes, mockPatients, mockConsultations } from '@/data/mockData';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const getStatusBadge = (status: 'awaiting' | 'in_progress' | 'completed') => {
  switch (status) {
    case 'awaiting':
      return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Awaiting</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Completed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getInitials = (name?: string, surname?: string) => {
  const first = name?.charAt(0) || '';
  const last = surname?.charAt(0) || '';
  return (first + last).toUpperCase() || 'P';
};

const isBPHigh = (bp?: string) => {
  const parts = bp?.split('/');
  if (parts?.length === 2) {
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    return systolic >= 140 || diastolic >= 90;
  }
  return false;
};

export default function ConsultationsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  const filterData = (items: any[], getPatient: (id: string) => any) => {
    return items.filter(item => {
      const patient = getPatient(item.patientId);
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = !searchQuery || 
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower);
      
      const itemDate = new Date(item.createdAt || item.date);
      const matchesDate = !dateFilter || 
        (itemDate.toDateString() === dateFilter.toDateString());
      
      return matchesSearch && matchesDate;
    });
  };

  const allPendingSOAPs = mockSOAPNotes.filter(n => n.status === 'pending' || n.status === 'with_doctor');
  const pendingSOAPs = useMemo(() => filterData(allPendingSOAPs, getPatientInfo), [searchQuery, dateFilter, allPendingSOAPs]);
  
  const allInProgressConsultations = mockConsultations.filter(c => c.status === 'in_progress');
  const inProgressConsultations = useMemo(() => filterData(allInProgressConsultations, getPatientInfo), [searchQuery, dateFilter, allInProgressConsultations]);
  
  const allCompletedConsultations = mockConsultations.filter(c => c.status === 'completed');
  const completedConsultations = useMemo(() => filterData(allCompletedConsultations, getPatientInfo), [searchQuery, dateFilter, allCompletedConsultations]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter(undefined);
  };

  const hasActiveFilters = searchQuery || dateFilter;

  const renderConsultationRow = (
    item: any, 
    patient: any, 
    note: any, 
    status: 'awaiting' | 'in_progress' | 'completed'
  ) => {
    const bp = note?.objective?.bp || '---';
    const pulse = note?.objective?.pulse || '---';
    const spo2 = note?.objective?.spo2 || '---';
    const bpIsHigh = isBPHigh(bp);

    return (
      <Card key={item.id} className="hover:shadow-md transition-shadow">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Avatar + Patient Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(patient?.name, patient?.surname)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-foreground">
                    {patient?.name} {patient?.surname}
                  </h3>
                  <span className="text-sm text-muted-foreground">
                    • {patient?.age} yrs • {patient?.gender}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{patient?.patientId}</p>
                {note?.subjective && (
                  <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                    <span className="font-medium text-foreground">Chief Complaint:</span> {note.subjective}
                  </p>
                )}
              </div>
            </div>

            {/* Center: Vitals */}
            <div className="hidden md:flex items-center gap-4 flex-shrink-0">
              <div className="text-center px-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">BP</p>
                <p className={cn(
                  "text-sm font-bold",
                  bpIsHigh ? "text-destructive" : "text-muted-foreground"
                )}>
                  {bp}
                </p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Pulse</p>
                <p className="text-sm font-bold text-blue-600">{pulse}</p>
              </div>
              <div className="text-center px-3">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">SpO2</p>
                <p className="text-sm font-bold text-emerald-600">{spo2}%</p>
              </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(status)}
              
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => navigate(`/soap/${note?.id || item.soapNoteId}`)}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              
              {status === 'awaiting' && (
                <Button 
                  size="sm" 
                  className="bg-accent hover:bg-accent/90"
                  onClick={() => navigate(`/consultations/new?soapId=${note?.id}&patientId=${item.patientId}`)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Start
                </Button>
              )}
              
              {status === 'in_progress' && (
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90"
                  onClick={() => navigate(`/consultations/${item.id}`)}
                >
                  <Play className="h-4 w-4 mr-1" />
                  Continue
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="h-8 w-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">{message}</p>
        {hasActiveFilters && (
          <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
            Clear filters to see all
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <DashboardLayout campName="Bapatla">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Doctor Consultations</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patient consultations</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              <Calendar className="h-4 w-4 mr-2" />
              {dateFilter ? format(dateFilter, 'MMM dd, yyyy') : 'Filter by Date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <CalendarComponent
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tabs */}
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
          <div className="grid gap-4">
            {pendingSOAPs.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return renderConsultationRow(note, patient, note, 'awaiting');
            })}
            {pendingSOAPs.length === 0 && (
              <EmptyState message="No patients awaiting consultation." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid gap-4">
            {inProgressConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return renderConsultationRow(consultation, patient, soapNote, 'in_progress');
            })}
            {inProgressConsultations.length === 0 && (
              <EmptyState message="No consultations in progress." />
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {completedConsultations.map((consultation) => {
              const patient = getPatientInfo(consultation.patientId);
              const soapNote = mockSOAPNotes.find(n => n.patientId === consultation.patientId);
              return renderConsultationRow(consultation, patient, soapNote, 'completed');
            })}
            {completedConsultations.length === 0 && (
              <EmptyState message="No completed consultations." />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
