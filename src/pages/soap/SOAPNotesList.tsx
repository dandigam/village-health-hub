import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Send, Edit, FileText } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { mockSOAPNotes, mockPatients } from '@/data/mockData';

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Draft</Badge>;
    case 'with_doctor':
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Sent to Doctor</Badge>;
    case 'completed':
      return <Badge className="bg-green-100 text-green-700 border-green-200">Reviewed</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
};

const getInitials = (name?: string, surname?: string) => {
  const first = name?.charAt(0) || '';
  const last = surname?.charAt(0) || '';
  return (first + last).toUpperCase() || 'P';
};

export default function SOAPNotesList() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  const filteredNotes = useMemo(() => {
    let notes = activeTab === 'all' 
      ? mockSOAPNotes 
      : mockSOAPNotes.filter(n => n.status === activeTab);

    return notes.filter(note => {
      const patient = getPatientInfo(note.patientId);
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = !searchQuery ||
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower) ||
        note.subjective?.toLowerCase().includes(searchLower);
      
      const noteDate = new Date(note.createdAt);
      const matchesDate = !dateFilter ||
        noteDate.toDateString() === dateFilter.toDateString();
      
      return matchesSearch && matchesDate;
    });
  }, [activeTab, searchQuery, dateFilter]);

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            SOAP Notes <span className="text-muted-foreground">({filteredNotes.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage patient SOAP notes</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/soap/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New SOAP Note
        </Button>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient name, ID, or chief complaint..."
        showDateFilter
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Notes ({mockSOAPNotes.length})</TabsTrigger>
          <TabsTrigger value="pending">Draft ({mockSOAPNotes.filter(n => n.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="with_doctor">Sent ({mockSOAPNotes.filter(n => n.status === 'with_doctor').length})</TabsTrigger>
          <TabsTrigger value="completed">Reviewed ({mockSOAPNotes.filter(n => n.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-4">
            {filteredNotes.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 flex-shrink-0">
                          <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {getInitials(patient?.name, patient?.surname)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold">
                              {patient?.name} {patient?.surname}
                            </h3>
                            <span className="text-sm text-muted-foreground">
                              • {patient?.age} yrs • {patient?.gender}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground font-mono">{patient?.patientId}</p>
                          <p className="text-sm mt-1 text-muted-foreground line-clamp-1">
                            <span className="font-medium text-foreground">Chief Complaint:</span> {note.subjective}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Created: {new Date(note.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getStatusBadge(note.status)}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/soap/${note.id}`)}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        {note.status === 'pending' && (
                          <>
                            <Button size="sm" variant="outline" onClick={() => navigate(`/soap/${note.id}/edit`)}>
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" className="bg-accent hover:bg-accent/90">
                              <Send className="h-4 w-4 mr-1" />
                              Send to Doctor
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {filteredNotes.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No SOAP notes found matching your search.</p>
                  {(searchQuery || dateFilter) && (
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(''); setDateFilter(undefined); }} 
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
