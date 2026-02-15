import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { History, ChevronDown, Stethoscope, Pill, Calendar, FileText, Activity } from 'lucide-react';
import { mockSOAPNotes, mockConsultations, mockPrescriptions, mockDoctors, mockCamps } from '@/data/mockData';

interface PatientHistoryPanelProps {
  patientId: string;
}

export function PatientHistoryPanel({ patientId }: PatientHistoryPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedVisitIndex, setSelectedVisitIndex] = useState(0);

  // Gather past data for this patient
  const pastSOAPs = mockSOAPNotes.filter(s => s.patientId === patientId);
  const pastConsultations = mockConsultations.filter(c => c.patientId === patientId);
  const pastPrescriptions = mockPrescriptions.filter(p => p.patientId === patientId);

  // Build visits from consultations (completed ones)
  const visits = pastConsultations.map(consultation => {
    const soap = pastSOAPs.find(s => s.id === consultation.soapNoteId);
    const prescription = pastPrescriptions.find(p => p.id === consultation.prescriptionId);
    const doctor = mockDoctors.find(d => d.id === consultation.doctorId);
    const camp = mockCamps.find(c => c.id === consultation.campId);

    return {
      id: consultation.id,
      date: new Date(consultation.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      campName: camp?.name || 'Unknown Camp',
      doctorName: doctor?.name || 'Unknown',
      specialization: doctor?.specialization || '',
      chiefComplaint: consultation.chiefComplaint,
      diagnosis: consultation.diagnosis,
      vitals: soap?.objective,
      subjective: soap?.subjective,
      assessment: soap?.assessment,
      plan: soap?.plan,
      prescription: prescription?.items || [],
      labTests: consultation.labTests || [],
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (visits.length === 0) {
    return null; // No history to show
  }

  const selected = visits[selectedVisitIndex];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full px-3 sm:px-4 py-1.5 border-b bg-muted/20 flex items-center justify-between hover:bg-muted/40 transition-colors">
          <div className="flex items-center gap-2">
            <History className="h-3.5 w-3.5 text-primary" />
            <span className="text-[11px] font-semibold text-foreground uppercase tracking-wider">Medical History</span>
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/30">
              {visits.length} visit{visits.length > 1 ? 's' : ''}
            </Badge>
          </div>
          <ChevronDown className={cn("h-3.5 w-3.5 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border-b">
          <div className="flex">
            {/* Visit tabs */}
            <div className="w-[140px] sm:w-[160px] border-r bg-muted/20 shrink-0">
              <ScrollArea className="h-[220px]">
                {visits.map((visit, i) => (
                  <button
                    key={visit.id}
                    onClick={() => setSelectedVisitIndex(i)}
                    className={cn(
                      "w-full text-left px-3 py-2 border-b border-border/50 transition-colors",
                      i === selectedVisitIndex
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-muted/40"
                    )}
                  >
                    <p className="text-[10px] font-semibold text-foreground">{visit.date}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{visit.campName}</p>
                    <p className="text-[9px] text-muted-foreground truncate">{visit.doctorName}</p>
                  </button>
                ))}
              </ScrollArea>
            </div>

            {/* Visit details */}
            <ScrollArea className="flex-1 h-[220px]">
              {selected && (
                <div className="p-3 space-y-3">
                  {/* Vitals row */}
                  {selected.vitals && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Activity className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Vitals</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selected.vitals.bp && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">BP: {selected.vitals.bp}</span>
                        )}
                        {selected.vitals.pulse && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">Pulse: {selected.vitals.pulse}</span>
                        )}
                        {selected.vitals.weight && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">Wt: {selected.vitals.weight}kg</span>
                        )}
                        {selected.vitals.spo2 && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">SpO2: {selected.vitals.spo2}%</span>
                        )}
                        {selected.vitals.temp && (
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-medium">Temp: {selected.vitals.temp}°F</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Chief Complaint */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Chief Complaint</span>
                    </div>
                    <p className="text-[11px] text-foreground">{selected.chiefComplaint}</p>
                  </div>

                  {/* Diagnosis */}
                  <div>
                    <div className="flex items-center gap-1 mb-1">
                      <Stethoscope className="h-3 w-3 text-muted-foreground" />
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Diagnosis</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {selected.diagnosis.map((d, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-primary/8 text-primary border-primary/25">
                          {d}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Assessment */}
                  {selected.assessment && (
                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Assessment</span>
                      <p className="text-[11px] text-foreground mt-0.5">{selected.assessment}</p>
                    </div>
                  )}

                  {/* Prescription */}
                  {selected.prescription.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1 mb-1">
                        <Pill className="h-3 w-3 text-muted-foreground" />
                        <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Prescription</span>
                      </div>
                      <div className="space-y-0.5">
                        {selected.prescription.map((item, i) => (
                          <p key={i} className="text-[10px] text-foreground">
                            <span className="font-medium">{item.medicineName}</span>
                            <span className="text-muted-foreground ml-1">
                              ({item.morning}-{item.afternoon}-{item.night}) × {item.days}d
                            </span>
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Lab Tests */}
                  {selected.labTests.length > 0 && (
                    <div>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Lab Tests</span>
                      <p className="text-[10px] text-foreground mt-0.5">{selected.labTests.join(', ')}</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
