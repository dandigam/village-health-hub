import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EncounterPatient } from '@/pages/encounters/Encounters';
import { FileText, Pill, Calendar } from 'lucide-react';

interface PatientSnapshotPanelProps {
  encounter: EncounterPatient;
}

export function PatientSnapshotPanel({ encounter }: PatientSnapshotPanelProps) {
  const { patient } = encounter;

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border w-[220px] shrink-0">
      <div className="px-3 py-2.5 border-b">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Patient Info</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Identity */}
          <div className="text-center">
            {patient.photoUrl ? (
              <img src={patient.photoUrl} alt="" className="h-14 w-14 rounded-full object-cover border mx-auto" />
            ) : (
              <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center text-lg font-medium text-muted-foreground mx-auto">
                {patient.name.charAt(0)}
              </div>
            )}
            <p className="text-sm font-semibold mt-2">{patient.name} {patient.surname}</p>
            <p className="text-[11px] text-muted-foreground">{patient.patientId}</p>
          </div>

          {/* Demographics */}
          <div className="space-y-1.5">
            {[
              { label: 'Age', value: `${patient.age} Yrs` },
              { label: 'Gender', value: patient.gender },
              { label: 'Phone', value: patient.phone },
              { label: 'Village', value: patient.village },
            ].map(item => (
              <div key={item.label} className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">{item.label}</span>
                <span className="font-medium text-foreground">{item.value}</span>
              </div>
            ))}
          </div>

          {/* Allergies / Medications */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Allergies</p>
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/20 bg-destructive/5">
              None reported
            </Badge>
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Ongoing Medications</p>
            <p className="text-[11px] text-muted-foreground">No active medications</p>
          </div>

          {/* Quick Links */}
          <div className="border-t pt-2.5 space-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Quick Links</p>
            {[
              { icon: Calendar, label: 'Previous Visits' },
              { icon: FileText, label: 'Past SOAP Notes' },
              { icon: Pill, label: 'Lab Results' },
            ].map(link => (
              <button
                key={link.label}
                className="flex items-center gap-1.5 text-[11px] text-primary hover:underline w-full text-left"
              >
                <link.icon className="h-3 w-3" />
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
