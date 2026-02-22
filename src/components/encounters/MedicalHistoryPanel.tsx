import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Scale, Droplets, Heart, Thermometer, Wind } from 'lucide-react';
import { usePrescriptions, useDoctors, useCamps } from '@/hooks/useApiData';

interface MedicalHistoryPanelProps {
  patientId: string;
  currentDiagnoses?: string[];
}

export function MedicalHistoryPanel({ patientId, currentDiagnoses = [] }: MedicalHistoryPanelProps) {
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allCamps = [] } = useCamps();

  const pastPrescriptions = allPrescriptions.filter(p => p.patientId === patientId);

  const visits = pastPrescriptions.map(prescription => {
    const doctor = allDoctors.find(d => d.id === prescription.doctorId);
    const camp = allCamps.find(c => c.id === prescription.campId);
    return {
      id: prescription.id,
      date: new Date(prescription.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      campName: camp?.name || 'Unknown Camp',
      doctorName: doctor?.name || 'Unknown',
      specialization: doctor?.specialization || '',
      prescription: prescription.items || [],
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const [visitIndex, setVisitIndex] = useState(0);

  if (visits.length === 0) {
    return (
      <div className="h-full flex flex-col bg-card rounded-lg border">
        <div className="px-3 py-2.5 border-b">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Medical History</p>
        </div>
        {/* Current diagnoses even without history */}
        {currentDiagnoses.length > 0 && (
          <div className="px-3 py-2 border-b bg-primary/5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Diagnosis</p>
            <div className="flex flex-wrap gap-1">
              {currentDiagnoses.map(d => (
                <Badge key={d} variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">{d}</Badge>
              ))}
            </div>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center p-4">
          <p className="text-xs text-muted-foreground">No previous visits found</p>
        </div>
      </div>
    );
  }

  const visit = visits[visitIndex];
  const canPrev = visitIndex < visits.length - 1;
  const canNext = visitIndex > 0;

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      {/* Header with Prev/Next */}
      <div className="px-3 py-2 border-b flex items-center justify-between">
        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!canPrev} onClick={() => setVisitIndex(i => i + 1)}>
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <p className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Medical History</p>
        <Button variant="ghost" size="icon" className="h-6 w-6" disabled={!canNext} onClick={() => setVisitIndex(i => i - 1)}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Current diagnoses highlight */}
      {currentDiagnoses.length > 0 && (
        <div className="px-3 py-1.5 border-b bg-primary/5">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">Current Diagnosis</p>
          <div className="flex flex-wrap gap-1">
            {currentDiagnoses.map(d => (
              <Badge key={d} variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">{d}</Badge>
            ))}
          </div>
        </div>
      )}

      {/* Visit Info */}
      <div className="px-3 py-2 border-b bg-muted/20">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Date: <strong className="text-foreground">{visit.date}</strong></span>
          <span>Visit {visits.length - visitIndex}/{visits.length}</span>
        </div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mt-1">
          <span>Camp: <strong className="text-foreground">{visit.campName}</strong></span>
        </div>
        <div className="text-[10px] text-muted-foreground mt-0.5">
          Doctor: <strong className="text-foreground">Dr. {visit.doctorName}</strong>
          {visit.specialization && <span className="ml-1 text-muted-foreground">({visit.specialization})</span>}
        </div>
      </div>

      {/* Scrollable Content */}
      <ScrollArea className="flex-1">
        <div className="p-3 space-y-3">
          {/* Vitals Summary */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Vitals Summary</p>
            <div className="grid grid-cols-5 gap-1">
              {[
                { icon: Scale, label: 'Weight', value: '—' },
                { icon: Droplets, label: 'BP', value: '—' },
                { icon: Heart, label: 'Pulse', value: '—' },
                { icon: Thermometer, label: 'Temp', value: '—' },
                { icon: Wind, label: 'SpO2', value: '—' },
              ].map(v => (
                <div key={v.label} className="text-center">
                  <v.icon className="h-3 w-3 mx-auto text-primary mb-0.5" />
                  <p className="text-[9px] text-muted-foreground">{v.label}</p>
                  <p className="text-[10px] font-semibold text-foreground">{v.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Diagnosis */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Diagnosis</p>
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
                No data
              </Badge>
            </div>
          </div>

          {/* Allergies */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Allergies</p>
            <div className="flex items-center gap-2 text-[10px]">
              <span>Drug <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-0.5">No</Badge></span>
              <span>Food <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-0.5">No</Badge></span>
              <span>Env <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 ml-0.5">No</Badge></span>
            </div>
          </div>

          {/* Medication Table */}
          {visit.prescription.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Medication</p>
              <div className="border rounded overflow-hidden">
                <div className="grid grid-cols-[1fr_50px_70px_40px] gap-0 bg-muted/50 px-2 py-1 text-[8px] font-medium text-muted-foreground uppercase">
                  <span>Medicine</span>
                  <span>Dosage</span>
                  <span>Schedule</span>
                  <span>RX</span>
                </div>
                {visit.prescription.map((item, i) => (
                  <div key={i} className="grid grid-cols-[1fr_50px_70px_40px] gap-0 px-2 py-1 border-t text-[10px]">
                    <span className="font-medium truncate">{item.medicineName}</span>
                    <span className="text-muted-foreground">—</span>
                    <span className="text-muted-foreground">{item.morning}-{item.afternoon}-{item.night}</span>
                    <span className="text-muted-foreground">Inside</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {visit.prescription.length === 0 && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Medication</p>
              <p className="text-[10px] text-muted-foreground italic">No prescription data</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
