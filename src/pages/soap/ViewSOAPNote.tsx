import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { mockSOAPNotes, mockPatients } from '@/data/mockData';
import { cn } from '@/lib/utils';

const getInitials = (name?: string, surname?: string) => {
  const first = name?.charAt(0) || '';
  const last = surname?.charAt(0) || '';
  return (first + last).toUpperCase() || 'P';
};

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
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Draft</Badge>;
      case 'with_doctor':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 font-medium">Sent to Doctor</Badge>;
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Reviewed</Badge>;
      default:
        return <Badge variant="secondary">{note.status}</Badge>;
    }
  };

  return (
    <DashboardLayout campName="Bapatla">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/soap')}
            className="hover:bg-muted"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">SOAP Note Details</h1>
            <p className="text-sm text-muted-foreground">
              Created on {new Date(note.createdAt).toLocaleDateString('en-US', { 
                month: 'numeric', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          {note.status === 'pending' && (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-9"
                onClick={() => navigate(`/soap/${note.id}/edit`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button size="sm" className="h-9 bg-accent hover:bg-accent/90">
                <Send className="mr-2 h-4 w-4" />
                Send to Doctor
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Patient Info Card */}
      <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-border relative">
        {/* Left accent border */}
        <div className="absolute left-0 top-4 bottom-4 w-1 bg-accent rounded-full" />
        
        <div className="flex items-center justify-between pl-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.photoUrl} alt={patient.name} />
              <AvatarFallback className="bg-accent/10 text-accent font-semibold">
                {getInitials(patient.name, patient.surname)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold text-foreground">
                {patient.name} {patient.surname}
              </h2>
              <p className="text-sm text-muted-foreground font-mono">{patient.patientId}</p>
              <p className="text-sm text-muted-foreground">
                {patient.age} yrs • {patient.gender} • {patient.village}
              </p>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </div>

      {/* SOAP Sections - 2x2 Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* S - Subjective */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-accent mb-4">S - Subjective</h3>
          <p className="text-foreground leading-relaxed">{note.subjective}</p>
        </div>

        {/* O - Objective */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-accent mb-4">O - Objective</h3>
          
          {/* Vitals Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {note.objective.weight && (
              <div>
                <p className="text-sm text-accent/80 mb-1">Weight</p>
                <p className="font-medium text-foreground">{note.objective.weight} kg</p>
              </div>
            )}
            {note.objective.bp && (
              <div>
                <p className="text-sm text-accent/80 mb-1">BP</p>
                <p className={cn(
                  "font-medium",
                  isBPHigh(note.objective.bp) ? "text-destructive" : "text-foreground"
                )}>
                  {note.objective.bp}
                </p>
              </div>
            )}
            {note.objective.pulse && (
              <div>
                <p className="text-sm text-accent/80 mb-1">Pulse</p>
                <p className="font-medium text-foreground">{note.objective.pulse} bpm</p>
              </div>
            )}
            {note.objective.temp && (
              <div>
                <p className="text-sm text-accent/80 mb-1">Temp</p>
                <p className="font-medium text-foreground">{note.objective.temp}°F</p>
              </div>
            )}
            {note.objective.spo2 && (
              <div>
                <p className="text-sm text-accent/80 mb-1">SpO2</p>
                <p className="font-medium text-foreground">{note.objective.spo2}%</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {note.objective.notes && (
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-accent/80 mb-1">Notes</p>
              <p className="text-foreground">{note.objective.notes}</p>
            </div>
          )}
        </div>

        {/* A - Assessment */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-accent mb-4">A - Assessment</h3>
          <p className="text-foreground leading-relaxed">{note.assessment}</p>
        </div>

        {/* P - Plan */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-border">
          <h3 className="text-lg font-semibold text-accent mb-4">P - Plan</h3>
          <p className="text-foreground leading-relaxed">{note.plan}</p>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Helper function to check if BP is high
function isBPHigh(bp: string): boolean {
  const parts = bp?.split('/');
  if (parts?.length === 2) {
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    return systolic >= 140 || diastolic >= 90;
  }
  return false;
}
