import { useNavigate } from 'react-router-dom';
import { Play, Eye } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ConsultationRowProps {
  patient: any;
  note?: any;
  consultation?: any;
  status: 'awaiting' | 'in_progress' | 'completed';
}

const getStatusBadge = (status: 'awaiting' | 'in_progress' | 'completed') => {
  switch (status) {
    case 'awaiting':
      return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Awaiting</Badge>;
    case 'in_progress':
      return <Badge className="bg-blue-50 text-blue-700 border-blue-200">In Progress</Badge>;
    case 'completed':
      return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>;
  }
};

const getInitials = (name?: string, surname?: string) => {
  const first = name?.charAt(0) || '';
  const last = surname?.charAt(0) || '';
  return (first + last).toUpperCase() || 'P';
};

const isBPHigh = (bp: string) => {
  const parts = bp?.split('/');
  if (parts?.length === 2) {
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    return systolic >= 140 || diastolic >= 90;
  }
  return false;
};

export function ConsultationRow({ patient, note, consultation, status }: ConsultationRowProps) {
  const navigate = useNavigate();
  
  const bp = note?.objective?.bp || '---';
  const pulse = note?.objective?.pulse || '---';
  const spo2 = note?.objective?.spo2 || '---';
  const bpIsHigh = isBPHigh(bp);

  const handlePrimaryAction = () => {
    if (status === 'awaiting' && note) {
      navigate(`/consultations/doctor?soapId=${note.id}&patientId=${note.patientId}`);
    } else if (status === 'in_progress' && consultation) {
      navigate(`/consultations/doctor?soapId=${consultation.soapNoteId}&patientId=${consultation.patientId}`);
    } else if (status === 'completed' && consultation) {
      navigate(`/consultations/doctor?soapId=${consultation.soapNoteId}&patientId=${consultation.patientId}`);
    }
  };

  const handleViewSOAP = () => {
    if (note) navigate(`/soap/${note.id}`);
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Avatar + Patient Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Avatar className="h-11 w-11 flex-shrink-0">
              <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
              <AvatarFallback className="bg-accent/10 text-accent font-medium">
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
              {note && (
                <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                  <span className="font-medium text-foreground">Chief Complaint:</span> {note.subjective}
                </p>
              )}
            </div>
          </div>

          {/* Center: Vitals */}
          {note && (
            <div className="hidden lg:flex items-center gap-6 px-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">BP</p>
                <p className={cn(
                  "text-sm font-semibold",
                  bpIsHigh ? "text-destructive" : "text-muted-foreground"
                )}>
                  {bp}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Pulse</p>
                <p className="text-sm font-semibold text-blue-600">{pulse} bpm</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">SpO2</p>
                <p className="text-sm font-semibold text-emerald-600">{spo2}%</p>
              </div>
            </div>
          )}

          {/* Right: Status + Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {getStatusBadge(status)}
            
            <Button size="sm" variant="outline" onClick={handleViewSOAP}>
              <Eye className="h-4 w-4 mr-1" />
              View SOAP
            </Button>
            
            {status === 'awaiting' && (
              <Button 
                size="sm" 
                className="bg-accent hover:bg-accent/90"
                onClick={handlePrimaryAction}
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
            
            {status === 'in_progress' && (
              <Button 
                size="sm" 
                className="bg-primary hover:bg-primary/90"
                onClick={handlePrimaryAction}
              >
                <Play className="h-4 w-4 mr-1" />
                Continue
              </Button>
            )}
            
            {status === 'completed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={handlePrimaryAction}
              >
                <Eye className="h-4 w-4 mr-1" />
                Details
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
