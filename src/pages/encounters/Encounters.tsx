import { useState, useMemo, useEffect } from 'react';
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
import { useEncounterQueue, EncounterQueueItem } from '@/hooks/useApiData';
import { useAuth } from '@/context/AuthContext';
import { Patient } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { PageLoader } from '@/components/shared/PageLoader';

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

/** Map API encounterStatus string to local EncounterStatus */
function mapApiStatus(apiStatus: string): EncounterStatus {
  const normalized = apiStatus?.toUpperCase?.() || '';
  if (normalized === 'WITH_DOCTOR' || normalized === 'IN_PROGRESS') return 'WITH_DOCTOR';
  if (normalized === 'PHARMACY') return 'PHARMACY';
  if (normalized === 'COMPLETED' || normalized === 'DONE') return 'COMPLETED';
  return 'WAITING';
}

/** Convert API response items to EncounterPatient format */
function mapQueueItemToEncounter(item: EncounterQueueItem, index: number): EncounterPatient {
  const status = mapApiStatus(item.encounter.encounterStatus);
  return {
    patient: {
      id: String(item.encounter.id),
      patientId: item.mr,
      name: item.patientname,
      firstName: item.patientname.split(' ')[0] || '',
      lastName: item.patientname.split(' ').slice(1).join(' ') || '',
      age: item.age,
      gender: item.gender,
      phone: '',
      status: 'registered',
      campId: '',
      address: {} as any,
      village: '',
      createdAt: '',
      updatedAt: '',
    } as Patient,
    status,
    token: index + 1,
    arrivalTime: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    waitingMinutes: 0,
    isReturning: false,
    assignedDoctor: item.doctor?.name,
    currentStep: status === 'COMPLETED' ? 5 : status === 'PHARMACY' ? 5 : status === 'WITH_DOCTOR' ? 2 : 0,
  };
}

export default function Encounters() {
  const { user } = useAuth();
  const campEventId = user?.context?.campEventId ?? null;
  const { data: queueData = [], isLoading: loadingQueue, isFetching, refetch } = useEncounterQueue(campEventId);

  const handleRefreshQueue = () => { refetch(); };

  const [searchTerm, setSearchTerm] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const isMobile = useIsMobile();

  // Map API data to EncounterPatient[]
  const apiQueue = useMemo(
    () => queueData.map((item, i) => mapQueueItemToEncounter(item, i)),
    [queueData]
  );

  const [encounterQueue, setEncounterQueue] = useState<EncounterPatient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Sync API data into local state
  useEffect(() => {
    if (apiQueue.length > 0) {
      setEncounterQueue(apiQueue);
      if (!selectedPatientId) {
        const firstActive = apiQueue.find(e => e.status !== 'COMPLETED');
        setSelectedPatientId(firstActive?.patient.id ?? apiQueue[0]?.patient.id ?? null);
      }
    }
  }, [apiQueue]);

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

  // Patient search disabled — queue is now fully API-driven
  const searchResults: Patient[] = [];

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

  if (loadingQueue) {
    return <DashboardLayout><PageLoader type="full" message="Loading encounters..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
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
            <>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setHistoryOpen(!historyOpen)}>
                <Stethoscope className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{historyOpen ? 'Hide History' : 'History'}</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" onClick={() => setIsFullScreen(!isFullScreen)}>
                {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{isFullScreen ? 'Show Queue' : 'Focus Mode'}</span>
              </Button>
            </>
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
                onRefresh={handleRefreshQueue}
                isRefreshing={isFetching}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* Main 3-Column Layout */}
      <div className="flex gap-3 h-[calc(100vh-10rem)] sm:h-[calc(100vh-9rem)]">
        {/* Left: Queue */}
        {!isMobile && !isFullScreen && (
          <div className="w-[260px] lg:w-[280px] shrink-0 flex flex-col">
            <EncounterQueue
              queue={filteredQueue}
              selectedId={selectedPatientId}
              onSelect={setSelectedPatientId}
              onStartVisit={handleStartVisit}
              onRefresh={handleRefreshQueue}
              isRefreshing={isFetching}
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
        {selectedEncounter && !isMobile && historyOpen && (
          <div className="w-[280px] lg:w-[300px] shrink-0 flex flex-col">
            <MedicalHistoryPanel patientId={selectedEncounter.patient.id} currentDiagnoses={currentDiagnoses} />
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
