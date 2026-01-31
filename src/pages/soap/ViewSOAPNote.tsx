import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { mockSOAPNotes, mockPatients } from '@/data/mockData';

export default function ViewSOAPNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const note = mockSOAPNotes.find(n => n.id === id);
  const patient = note ? mockPatients.find(p => p.id === note.patientId) : null;

  if (!note || !patient) {
    return (
      <DashboardLayout campName="Bapatla">
        <div className="text-center py-12">
          <p className="text-muted-foreground">SOAP Note not found</p>
          <Button className="mt-4" onClick={() => navigate('/soap')}>
            Back to SOAP Notes
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = () => {
    switch (note.status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Draft</Badge>;
      case 'with_doctor':
        return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Sent to Doctor</Badge>;
      case 'completed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{note.status}</Badge>;
    }
  };

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/soap')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">SOAP Note Details</h1>
            <p className="text-muted-foreground">Created on {new Date(note.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {note.status === 'pending' && (
            <>
              <Button variant="outline" onClick={() => navigate(`/soap/${note.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button className="bg-accent hover:bg-accent/90">
                <Send className="mr-2 h-4 w-4" />
                Send to Doctor
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info */}
      <Card className="mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center">
                <span className="text-xl font-semibold text-accent">{patient.name.charAt(0)}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{patient.name} {patient.surname}</h2>
                <p className="text-muted-foreground">{patient.patientId}</p>
                <p className="text-sm">{patient.age} yrs • {patient.gender} • {patient.village}</p>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardContent>
      </Card>

      {/* SOAP Details */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-accent">S - Subjective</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{note.subjective}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-accent">O - Objective</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 mb-4">
              {note.objective.weight && (
                <div>
                  <p className="text-sm text-muted-foreground">Weight</p>
                  <p className="font-medium">{note.objective.weight} kg</p>
                </div>
              )}
              {note.objective.bp && (
                <div>
                  <p className="text-sm text-muted-foreground">BP</p>
                  <p className="font-medium">{note.objective.bp}</p>
                </div>
              )}
              {note.objective.pulse && (
                <div>
                  <p className="text-sm text-muted-foreground">Pulse</p>
                  <p className="font-medium">{note.objective.pulse} bpm</p>
                </div>
              )}
              {note.objective.temp && (
                <div>
                  <p className="text-sm text-muted-foreground">Temp</p>
                  <p className="font-medium">{note.objective.temp}°F</p>
                </div>
              )}
              {note.objective.spo2 && (
                <div>
                  <p className="text-sm text-muted-foreground">SpO2</p>
                  <p className="font-medium">{note.objective.spo2}%</p>
                </div>
              )}
            </div>
            {note.objective.notes && (
              <>
                <Separator className="my-4" />
                <p className="text-sm text-muted-foreground mb-1">Notes</p>
                <p>{note.objective.notes}</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-accent">A - Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{note.assessment}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-accent">P - Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{note.plan}</p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
