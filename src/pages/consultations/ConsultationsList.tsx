import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Eye, Search, Filter, Calendar, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { mockSOAPNotes, mockPatients, mockConsultations } from '@/data/mockData';
import { ConsultationCard } from '@/components/consultations/ConsultationCard';
import { format } from 'date-fns';

export default function ConsultationsList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  // Filter function
  const filterData = (items: any[], getPatient: (id: string) => any) => {
    return items.filter(item => {
      const patient = getPatient(item.patientId);
      const searchLower = searchQuery.toLowerCase();
      
      // Search filter
      const matchesSearch = !searchQuery || 
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower);
      
      // Date filter
      const itemDate = new Date(item.createdAt || item.date);
      const matchesDate = !dateFilter || 
        (itemDate.toDateString() === dateFilter.toDateString());
      
      return matchesSearch && matchesDate;
    });
  };

  // Pending SOAP notes (waiting for doctor)
  const allPendingSOAPs = mockSOAPNotes.filter(n => n.status === 'pending' || n.status === 'with_doctor');
  const pendingSOAPs = useMemo(() => filterData(allPendingSOAPs, getPatientInfo), [searchQuery, dateFilter, allPendingSOAPs]);
  
  // In-progress consultations
  const allInProgressConsultations = mockConsultations.filter(c => c.status === 'in_progress');
  const inProgressConsultations = useMemo(() => filterData(allInProgressConsultations, getPatientInfo), [searchQuery, dateFilter, allInProgressConsultations]);
  
  // Completed consultations
  const allCompletedConsultations = mockConsultations.filter(c => c.status === 'completed');
  const completedConsultations = useMemo(() => filterData(allCompletedConsultations, getPatientInfo), [searchQuery, dateFilter, allCompletedConsultations]);

  const clearFilters = () => {
    setSearchQuery('');
    setDateFilter(undefined);
    setStatusFilter('all');
  };

  const hasActiveFilters = searchQuery || dateFilter || statusFilter !== 'all';

  return (
    <DashboardLayout campName="Bapatla">
      {/* Section Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary">Doctor Consultations</h1>
        <p className="text-sm text-muted-foreground mt-1">Recent patient consultations</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search by patient name or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>

          {/* Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 px-4 bg-gray-50 border-gray-200 hover:bg-white">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                {dateFilter ? format(dateFilter, 'MMM dd, yyyy') : 'Select Date'}
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

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px] h-10 bg-gray-50 border-gray-200">
              <Filter className="h-4 w-4 mr-2 text-gray-500" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="awaiting">Awaiting</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="h-10 px-3 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100/80 p-1 rounded-xl">
          <TabsTrigger 
            value="pending" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            Awaiting Consultation ({pendingSOAPs.length})
          </TabsTrigger>
          <TabsTrigger 
            value="in_progress" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            In Progress ({inProgressConsultations.length})
          </TabsTrigger>
          <TabsTrigger 
            value="completed" 
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm px-4"
          >
            Completed ({completedConsultations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                        className="flex-1 text-xs h-9 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
                        onClick={() => navigate(`/soap/${note.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View SOAP
                      </Button>
                      <Button 
                        size="sm" 
                        className="flex-1 text-xs h-9 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-lg shadow-sm"
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
            <div className="bg-white rounded-2xl p-12 text-center text-muted-foreground shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No patients awaiting consultation.</p>
              {hasActiveFilters && (
                <Button variant="link" onClick={clearFilters} className="mt-2 text-primary">
                  Clear filters to see all
                </Button>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="in_progress">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                      className="w-full text-xs h-9 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-sm"
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
            <div className="bg-white rounded-2xl p-12 text-center text-muted-foreground shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No consultations in progress.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
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
                      className="w-full text-xs h-9 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg"
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
            <div className="bg-white rounded-2xl p-12 text-center text-muted-foreground shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500">No completed consultations.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
