import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Send, Edit } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [searchTerm, setSearchTerm] = useState('');

  const getPatientInfo = (patientId: string) => {
    return mockPatients.find(p => p.id === patientId);
  };

  const tabFilteredNotes = activeTab === 'all' 
    ? mockSOAPNotes 
    : mockSOAPNotes.filter(n => n.status === activeTab);

  const filteredNotes = useMemo(() => {
    if (!searchTerm) return tabFilteredNotes;
    const searchLower = searchTerm.toLowerCase();
    
    return tabFilteredNotes.filter(note => {
      const patient = getPatientInfo(note.patientId);
      return (
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower)
      );
    });
  }, [searchTerm, tabFilteredNotes]);

  return (
    <DashboardLayout campName="Bapatla">
      <div className="flex items-center justify-between mb-6">
        <SearchFilter
          title="SOAP Notes"
          count={filteredNotes.length}
          placeholder="Search Patient by MR Number / First Name"
          value={searchTerm}
          onChange={setSearchTerm}
        />
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/soap/new')}>
          <Plus className="mr-2 h-4 w-4" />
          New SOAP Note
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Notes ({mockSOAPNotes.length})</TabsTrigger>
          <TabsTrigger value="pending">Draft ({mockSOAPNotes.filter(n => n.status === 'pending').length})</TabsTrigger>
          <TabsTrigger value="with_doctor">Sent ({mockSOAPNotes.filter(n => n.status === 'with_doctor').length})</TabsTrigger>
          <TabsTrigger value="completed">Reviewed ({mockSOAPNotes.filter(n => n.status === 'completed').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <div className="grid gap-3">
            {filteredNotes.map((note) => {
              const patient = getPatientInfo(note.patientId);
              return (
                <Card key={note.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-11 w-11 flex-shrink-0">
                          <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
                          <AvatarFallback className="bg-accent/10 text-accent font-medium">
                            {getInitials(patient?.name, patient?.surname)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground">
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
                      <div className="flex items-center gap-2">
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
                <CardContent className="py-8 text-center text-muted-foreground">
                  No SOAP notes found in this category.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
