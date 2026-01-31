import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, Eye } from 'lucide-react';

const mockSOAPNotes = [
  {
    id: '1',
    patientName: 'Rama Krishna',
    patientId: 'BPTL-OCT0718-7225',
    age: 55,
    gender: 'Male',
    subjective: 'Complaints of chest pain and breathlessness',
    status: 'pending',
    createdBy: 'Staff User',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: '2',
    patientName: 'Ramana Babu',
    patientId: 'BPTL-OCT0718-7226',
    age: 55,
    gender: 'Male',
    subjective: 'Frequent headaches and dizziness',
    status: 'with_doctor',
    createdBy: 'Staff User',
    createdAt: '2025-01-15T11:00:00Z',
  },
];

export default function Consultations() {
  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">Consultations</h1>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending SOAP Notes</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {mockSOAPNotes
              .filter((n) => n.status === 'pending')
              .map((note) => (
                <Card key={note.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-semibold">
                            {note.patientName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {note.patientName} • {note.age} yrs • {note.gender}
                          </h3>
                          <p className="text-sm text-muted-foreground">{note.patientId}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">Chief Complaint:</span> {note.subjective}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Awaiting Doctor
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View SOAP
                        </Button>
                        <Button size="sm" className="bg-accent hover:bg-accent/90">
                          <Play className="h-4 w-4 mr-1" />
                          Start Consultation
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="in-progress">
          <div className="grid gap-4">
            {mockSOAPNotes
              .filter((n) => n.status === 'with_doctor')
              .map((note) => (
                <Card key={note.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                          <span className="text-yellow-700 font-semibold">
                            {note.patientName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">
                            {note.patientName} • {note.age} yrs • {note.gender}
                          </h3>
                          <p className="text-sm text-muted-foreground">{note.patientId}</p>
                        </div>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                        With Doctor
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Consultations</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Completed consultations will appear here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
