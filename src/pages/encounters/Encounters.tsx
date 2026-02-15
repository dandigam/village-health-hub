import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EncounterQueue } from '@/components/encounters/EncounterQueue';
import { EncounterWorkflow } from '@/components/encounters/EncounterWorkflow';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Search, Bell, Filter, Maximize2, Minimize2, Users } from 'lucide-react';
import { mockPatients, mockDoctors } from '@/data/mockData';
import { Patient } from '@/types';
import { useIsMobile } from '@/hooks/use-mobile';

export type EncounterStatus = 'waiting' | 'in_progress' | 'completed';

export interface EncounterPatient {
  patient: Patient;
  status: EncounterStatus;
  arrivalTime: string;
  isReturning: boolean;
  assignedDoctor?: string;
  currentStep: number;
}

const buildEncounterQueue = (): EncounterPatient[] => {
  const patients = mockPatients.slice(0, 6);
  const statuses: EncounterStatus[] = ['waiting', 'in_progress', 'completed', 'waiting', 'in_progress', 'waiting'];
  const arrivals = ['08:30 AM', '08:45 AM', '09:00 AM', '09:15 AM', '09:30 AM', '09:45 AM'];
  
  return patients.map((p, i) => ({
    patient: p,
    status: statuses[i],
    arrivalTime: arrivals[i],
    isReturning: i === 1 || i === 4,
    assignedDoctor: statuses[i] === 'in_progress' ? mockDoctors[i % mockDoctors.length].name : undefined,
    currentStep: statuses[i] === 'completed' ? 5 : statuses[i] === 'in_progress' ? 2 : 0,
  }));
};

export default function Encounters() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [encounterQueue, setEncounterQueue] = useState<EncounterPatient[]>(buildEncounterQueue);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [mobileQueueOpen, setMobileQueueOpen] = useState(false);
  const isMobile = useIsMobile();

  const [notifications] = useState([
    { id: '1', message: 'New patient registered: Rama Krishna', time: '2 min ago' },
    { id: '2', message: 'Lab results ready for Ramana Babu', time: '5 min ago' },
    { id: '3', message: 'Follow-up due: Rama Kumari', time: '10 min ago' },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  const filteredQueue = useMemo(() => {
    let queue = encounterQueue;
    if (statusFilter !== 'all') {
      queue = queue.filter(e => e.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      queue = queue.filter(e =>
        e.patient.name.toLowerCase().includes(term) ||
        e.patient.patientId.toLowerCase().includes(term) ||
        e.patient.phone.includes(term)
      );
    }
    return queue;
  }, [encounterQueue, statusFilter, searchTerm]);

  const selectedEncounter = encounterQueue.find(e => e.patient.id === selectedPatientId);

  const handleStartVisit = (patientId: string) => {
    setEncounterQueue(prev =>
      prev.map(e =>
        e.patient.id === patientId ? { ...e, status: 'in_progress' as EncounterStatus, currentStep: 1 } : e
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

  const handleCompleteVisit = () => {
    if (!selectedPatientId) return;
    setEncounterQueue(prev =>
      prev.map(e =>
        e.patient.id === selectedPatientId ? { ...e, status: 'completed' as EncounterStatus, currentStep: 5 } : e
      )
    );
  };

  const handleSelectPatient = (id: string) => {
    setSelectedPatientId(id);
    if (isMobile) setMobileQueueOpen(false);
  };

  const waitingCount = encounterQueue.filter(e => e.status === 'waiting').length;
  const inProgressCount = encounterQueue.filter(e => e.status === 'in_progress').length;
  const completedCount = encounterQueue.filter(e => e.status === 'completed').length;

  return (
    <DashboardLayout>
      {/* Top Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 mb-3 sm:mb-4 flex-wrap">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-foreground whitespace-nowrap">Encounters</h1>
          
          {/* Mobile: Queue toggle button */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5 md:hidden"
              onClick={() => setMobileQueueOpen(true)}
            >
              <Users className="h-3.5 w-3.5" />
              Queue
            </Button>
          )}

          <div className="relative w-full max-w-[200px] sm:max-w-[280px] hidden sm:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search Name / ID / Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 sm:h-9 text-xs sm:text-sm bg-card"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-28 sm:w-36 h-8 sm:h-9 text-xs sm:text-sm">
              <Filter className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="waiting">Waiting</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {selectedEncounter && !isMobile && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1.5"
              onClick={() => setIsFullScreen(!isFullScreen)}
            >
              {isFullScreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">{isFullScreen ? 'Show Queue' : 'Full Screen'}</span>
            </Button>
          )}
          <Badge variant="outline" className="text-[hsl(var(--info))] border-[hsl(var(--info)/0.3)] bg-[hsl(var(--info)/0.08)] text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
            {waitingCount} <span className="hidden sm:inline">Waiting</span>
          </Badge>
          <Badge variant="outline" className="text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)] bg-[hsl(var(--success)/0.08)] text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
            {inProgressCount} <span className="hidden sm:inline">Active</span>
          </Badge>
          <Badge variant="outline" className="text-muted-foreground border-border bg-muted/50 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5">
            {completedCount} <span className="hidden sm:inline">Done</span>
          </Badge>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 sm:h-9 sm:w-9 relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              {notifications.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-[10px] text-accent-foreground flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </Button>
            {showNotifications && (
              <div className="absolute right-0 top-10 w-64 sm:w-72 bg-card border rounded-lg shadow-lg z-50 py-1">
                <p className="text-xs font-medium text-muted-foreground px-3 py-1.5 border-b">Notifications</p>
                {notifications.map(n => (
                  <div key={n.id} className="px-3 py-2 hover:bg-muted/50 cursor-pointer">
                    <p className="text-xs text-foreground">{n.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
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

      {/* Main Content */}
      <div className="flex gap-3 sm:gap-4 h-[calc(100vh-9rem)] sm:h-[calc(100vh-10rem)]">
        {/* Left Panel — Queue (desktop only) */}
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

        {/* Right Panel — Workflow */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedEncounter ? (
            <EncounterWorkflow
              encounter={selectedEncounter}
              onStepChange={handleStepChange}
              onComplete={handleCompleteVisit}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-card rounded-lg border">
              <div className="text-center px-4">
                <p className="text-muted-foreground text-sm">Select a patient from the queue to begin</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {isMobile ? 'Tap "Queue" to see patients' : 'or search for a returning patient'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
