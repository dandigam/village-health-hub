import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EncounterQueue } from '@/components/encounters/EncounterQueue';
import { EncounterWorkflow } from '@/components/encounters/EncounterWorkflow';
import { MedicalHistoryPanel } from '@/components/encounters/MedicalHistoryPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, Maximize2, Minimize2, Users, UserPlus, Clock, Stethoscope, Pill, CheckCircle2 } from 'lucide-react';
import { usePatients, useDoctors } from '@/hooks/useApiData';
import { Patient } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export type EncounterStatus = 'WAITING' | 'WITH_DOCTOR' | 'PHARMACY' | 'COMPLETED';

export interface EncounterPatient {
  patient: Patient;
  status: EncounterStatus;
  token: number;
  arrivalTime: string;
  waitingMinutes: number;
  isReturning: boolean;
  assignedDoctor?: string;
  currentStep: number;
}

export const statusConfig: Record<EncounterStatus, { label: string; icon: any; color: string; bgColor: string; borderColor: string }> = {
  WAITING: {
    label: 'Pending Consultation',
    icon: Clock,
    color: 'text-[hsl(var(--warning))]',
    bgColor: 'bg-[hsl(var(--warning)/0.1)]',
    borderColor: 'border-[hsl(var(--warning)/0.3)]',
  },
  WITH_DOCTOR: {
    label: 'At Doctor',
    icon: Stethoscope,
    color: 'text-[hsl(var(--info))]',
    bgColor: 'bg-[hsl(var(--info)/0.1)]',
    borderColor: 'border-[hsl(var(--info)/0.3)]',
  },
  PHARMACY: {
    label: 'At Pharmacy',
    icon: Pill,
    color: 'text-[hsl(var(--success))]',
    bgColor: 'bg-[hsl(var(--success)/0.1)]',
    borderColor: 'border-[hsl(var(--success)/0.3)]',
  },
  COMPLETED: {
    label: 'Completed',
    icon: CheckCircle2,
    color: 'text-muted-foreground',
    bgColor: 'bg-muted/50',
    borderColor: 'border-border',
  },
};

export default function Encounters() {
  const { data: patientsRaw = [] } = usePatients();
  const patientList = Array.isArray((patientsRaw as any).content)
    ? (patientsRaw as any).content
    : Array.isArray(patientsRaw) ? patientsRaw : [];
  const { data: doctors = [] } = useDoctors();

  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const isMobile = useIsMobile();

  // Build initial queue from patient data
  const buildEncounterQueue = useMemo((): EncounterPatient[] => {
    const sliced = patientList.slice(0, 8);
    const statuses: EncounterStatus[] = ['WAITING', 'WITH_DOCTOR', 'PHARMACY', 'WAITING', 'WITH_DOCTOR', 'WAITING', 'COMPLETED', 'COMPLETED'];
    const arrivals = ['08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM', '07:30 AM', '07:45 AM'];
    const waits = [45, 30, 15, 25, 10, 5, 0, 0];
    return sliced.map((p, i) => ({
      patient: p,
      status: statuses[i] || 'WAITING',
      token: i + 1,
      arrivalTime: arrivals[i] || '08:30 AM',
      waitingMinutes: waits[i] || 0,
      isReturning: i === 1 || i === 4,
      assignedDoctor: (statuses[i] === 'WITH_DOCTOR' || statuses[i] === 'PHARMACY') ? doctors[i % doctors.length]?.name : undefined,
      currentStep: statuses[i] === 'COMPLETED' ? 5 : statuses[i] === 'PHARMACY' ? 5 : statuses[i] === 'WITH_DOCTOR' ? 2 : 0,
    }));
  }, [patientList, doctors]);

  const [encounterQueue, setEncounterQueue] = useState<EncounterPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  useMemo(() => {
    if (buildEncounterQueue.length > 0 && encounterQueue.length === 0) {
      setEncounterQueue(buildEncounterQueue);
      const firstActive = buildEncounterQueue.find(e => e.status !== 'COMPLETED');
      setSelectedPatientId(firstActive?.patient.id ?? buildEncounterQueue[0]?.patient.id ?? null);
    }
  }, [buildEncounterQueue]);

  // Queue stats
  const waitingCount = encounterQueue.filter(e => e.status === 'WAITING').length;
  const withDoctorCount = encounterQueue.filter(e => e.status === 'WITH_DOCTOR').length;
  const pharmacyCount = encounterQueue.filter(e => e.status === 'PHARMACY').length;
  const completedCount = encounterQueue.filter(e => e.status === 'COMPLETED').length;

  // Filter queue: hide completed, apply search
  const filteredQueue = useMemo(() => {
    let queue = encounterQueue.filter(e => e.status !== 'COMPLETED');
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      queue = queue.filter(e =>
        (e.patient.name?.toLowerCase?.() || '').includes(term) ||
        (e.patient.patientId?.toLowerCase?.() || '').includes(term) ||
        (e.patient.phone?.toLowerCase?.() || '').includes(term)
      );
    }
    return queue;
  }, [encounterQueue, searchTerm]);

  // Patient search for starting new encounter
  const searchResults = useMemo(() => {
    if (!patientSearch.trim()) return [];
    const q = patientSearch.toLowerCase();
    return patientList
      .filter((p: Patient) =>
        !encounterQueue.some(e => e.patient.id === p.id && e.status !== 'COMPLETED') &&
        ((p.name?.toLowerCase() || '').includes(q) ||
         (p.patientId?.toLowerCase() || '').includes(q) ||
         (p.phone?.toLowerCase() || '').includes(q))
      )
      .slice(0, 5);
  }, [patientSearch, patientList, encounterQueue]);

  const selectedEncounter = encounterQueue.find(e => e.patient.id === selectedPatientId);
  const [currentDiagnoses, setCurrentDiagnoses] = useState<string[]>([]);
  const [currentVitals, setCurrentVitals] = useState({ weight: '', bp: '', pulse: '', temp: '', spo2: '' });

  const handleStartEncounter = (patient: Patient) => {
    const nextToken = Math.max(...encounterQueue.map(e => e.token), 0) + 1;
    const newEncounter: EncounterPatient = {
      patient,
      status: 'WAITING',
      token: nextToken,
      arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      waitingMinutes: 0,
      isReturning: encounterQueue.some(e => e.patient.id === patient.id),
      currentStep: 0,
    };
    setEncounterQueue(prev => [...prev, newEncounter]);
    setPatientSearch('');
  };

  const handleStartVisit = (patientId: string) => {
    setEncounterQueue(prev =>
      prev.map(e =>
        e.patient.id === patientId ? { ...e, status: 'WITH_DOCTOR' as EncounterStatus, currentStep: 1 } : e
      )
    );
    setSelectedPatientId(patientId);
    if (isMobile) setMobileQueueOpen(false);
  };

  const handleStepChange = (step: number) => {
    if (!selectedPatientId) return;
    setEncounterQueue(prev =>
      prev.map(e =>
        e.patient.id === selectedPatientId ? { ...e, currentStep: step } : e
      )
    );
  };

  const handleSendToPharmacy = () => {
    if (!selectedPatientId) return;
    setEncounterQueue(prev =>
      prev.map(e =>
        e.patient.id === selectedPatientId ? { ...e, status: 'PHARMACY' as EncounterStatus, currentStep: 5 } : e
      )
    );
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    if (isMobile) setMobileQueueOpen(false);
  };

  const statCards = [
    { label: 'Pending Consultation', count: waitingCount, icon: Clock, color: 'text-[hsl(var(--warning))]', bg: 'bg-[hsl(var(--warning)/0.08)]' },
    { label: 'At Doctor', count: withDoctorCount, icon: Stethoscope, color: 'text-[hsl(var(--info))]', bg: 'bg-[hsl(var(--info)/0.08)]' },
    { label: 'At Pharmacy', count: pharmacyCount, icon: Pill, color: 'text-[hsl(var(--success))]', bg: 'bg-[hsl(var(--success)/0.08)]' },
    { label: 'Completed Today', count: completedCount, icon: CheckCircle2, color: 'text-muted-foreground', bg: 'bg-muted/30' },
  ];

  return (
    <DashboardLayout>
      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {statCards.map(s => (
          <Card key={s.label} className="p-3 flex items-center gap-3 border-border/50">
            <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', s.bg)}>
              <s.icon className={cn('h-5 w-5', s.color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-foreground">{s.count}</p>
              <p className="text-[10px] text-muted-foreground font-medium">{s.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Search Patient & Start Encounter */}
      <Card className="p-3 mb-4 border-border/50">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Patient (Name / Phone / Patient ID)..."
              className="pl-9 h-10"
              value={patientSearch}
              onChange={e => setPatientSearch(e.target.value)}
            />
            {patientSearch.trim() && searchResults.length > 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 border rounded-lg bg-popover shadow-lg max-h-60 overflow-auto">
                {searchResults.map((p: Patient) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {p.photoUrl ? (
                        <img src={p.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover border" />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                          {(p.name || '').charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium">{p.name} {p.surname || ''}</p>
                        <p className="text-xs text-muted-foreground">{p.patientId} · Age {p.age} · {p.gender}</p>
                      </div>
                    </div>
                    <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => handleStartEncounter(p)}>
                      <UserPlus className="h-3.5 w-3.5" />
                      Start Encounter
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {patientSearch.trim() && searchResults.length === 0 && (
              <div className="absolute z-20 top-full left-0 right-0 mt-1 border rounded-lg bg-popover shadow-lg p-4 text-center text-sm text-muted-foreground">
                No patients found matching "{patientSearch}"
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Top bar with queue search & controls */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-foreground whitespace-nowrap">Patient Queue</h2>
          {isMobile && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5 md:hidden" onClick={() => setMobileQueueOpen(true)}>
              <Users className="h-3.5 w-3.5" /> Queue
            </Button>
          )}
          <div className="relative w-full max-w-[240px] hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Filter queue..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs bg-card"
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {selectedEncounter && !isMobile && (
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsFullScreen(!isFullScreen)}>
              {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullScreen ? 'Show Queue' : 'Focus Mode'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Queue Sheet */}
      {isMobile && (
        <Sheet open={mobileQueueOpen} onOpenChange={setMobileQueueOpen}>
          <SheetContent side="left" className="p-0 w-[300px]">
            <div className="h-full pt-10">
              <EncounterQueue
                queue={filteredQueue}
                selectedId={selectedPatientId}
                onSelect={handleSelectPatient}
                onStartVisit={handleStartVisit}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main 3-Column Layout */}
      <div className="flex gap-3 h-[calc(100vh-22rem)] sm:h-[calc(100vh-21rem)]">
        {/* Left: Queue */}
        {!isMobile && !isFullScreen && (
          <div className="w-[260px] lg:w-[280px] shrink-0 flex flex-col">
            <EncounterQueue
              queue={filteredQueue}
              selectedId={selectedPatientId}
              onSelect={setSelectedPatientId}
              onStartVisit={handleStartVisit}
            />
          </div>
        )}

        {/* Center: Workflow */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedEncounter ? (
            <EncounterWorkflow
              encounter={selectedEncounter}
              onStepChange={handleStepChange}
              onComplete={handleSendToPharmacy}
              onDiagnosesChange={setCurrentDiagnoses}
              onVitalsChange={setCurrentVitals}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-card rounded-lg border">
              <div className="text-center px-4">
                <Search className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground text-sm font-medium">No patient selected</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Search for a patient above or select from the queue
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Medical History */}
        {selectedEncounter && !isMobile && (
          <div className="w-[280px] lg:w-[300px] shrink-0 flex flex-col">
            <MedicalHistoryPanel patientId={selectedEncounter.patient.id} currentDiagnoses={currentDiagnoses} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
