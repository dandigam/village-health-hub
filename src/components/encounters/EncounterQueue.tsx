import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Play, ChevronDown, Clock, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EncounterPatient, EncounterStatus } from '@/pages/encounters/Encounters';
import { useState } from 'react';

interface EncounterQueueProps {
  queue: EncounterPatient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStartVisit: (id: string) => void;
}

const statusConfig: Record<EncounterStatus, { label: string; className: string }> = {
  waiting: {
    label: 'Pending Consultation',
    className: 'text-[hsl(var(--info))] bg-[hsl(var(--info)/0.1)] border-[hsl(var(--info)/0.2)]',
  },
  in_progress: {
    label: 'At Doctor',
    className: 'text-[hsl(var(--success))] bg-[hsl(var(--success)/0.1)] border-[hsl(var(--success)/0.2)]',
  },
  completed: {
    label: 'Pharmacy',
    className: 'text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.2)]',
  },
};

export function EncounterQueue({ queue, selectedId, onSelect, onStartVisit }: EncounterQueueProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  
  const activeQueue = queue.filter(e => e.status !== 'completed');
  const completedQueue = queue.filter(e => e.status === 'completed');

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border">
      <div className="px-3 py-2.5 border-b">
        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Patient Queue</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">Today's encounters</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1.5">
          {activeQueue.map((encounter) => {
            const config = statusConfig[encounter.status];
            const isSelected = selectedId === encounter.patient.id;

            return (
              <div
                key={encounter.patient.id}
                onClick={() => onSelect(encounter.patient.id)}
                className={cn(
                  'p-2.5 rounded-lg cursor-pointer transition-all duration-150 border',
                  isSelected
                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                    : 'border-transparent hover:bg-muted/50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono">{encounter.patient.patientId}</span>
                      <span className="text-[10px] text-muted-foreground">•</span>
                      <span className="text-[10px] text-muted-foreground">{encounter.patient.age}Y</span>
                      {encounter.isReturning && (
                        <RotateCcw className="h-3 w-3 text-[hsl(var(--warning))] shrink-0" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate mt-0.5">
                      {encounter.patient.name || `${encounter.patient.firstName || ''} ${encounter.patient.lastName || ''}`.trim()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {encounter.arrivalTime}
                  </div>
                  <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4.5 shrink-0', config.className)}>
                    {config.label}
                  </Badge>
                </div>

                {encounter.status === 'waiting' && (
                  <div className="mt-1.5">
                    <Button
                      size="sm"
                      className="h-6 text-[10px] px-2 bg-primary hover:bg-primary/90 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartVisit(encounter.patient.id);
                      }}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Start
                    </Button>
                  </div>
                )}
                {encounter.assignedDoctor && (
                  <p className="text-[10px] text-muted-foreground truncate mt-1">
                    Dr. {encounter.assignedDoctor}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {/* Completed Section - Collapsible */}
        {completedQueue.length > 0 && (
          <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
            <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 border-t text-xs text-muted-foreground hover:text-foreground transition-colors">
              <span>At Pharmacy ({completedQueue.length})</span>
              <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', showCompleted && 'rotate-180')} />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-2 space-y-1.5">
                {completedQueue.map((encounter) => (
                  <div
                    key={encounter.patient.id}
                    onClick={() => onSelect(encounter.patient.id)}
                    className={cn(
                      'p-2.5 rounded-lg cursor-pointer transition-all duration-150 border opacity-60',
                      selectedId === encounter.patient.id
                        ? 'bg-muted/50 border-border shadow-sm opacity-100'
                        : 'border-transparent hover:bg-muted/30'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="min-w-0">
                        <span className="text-[10px] text-muted-foreground font-mono">{encounter.patient.patientId}</span>
                        <p className="text-sm font-medium text-foreground truncate">{encounter.patient.name}</p>
                      </div>
                      <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4.5 text-[hsl(var(--warning))] bg-[hsl(var(--warning)/0.1)] border-[hsl(var(--warning)/0.2)]">
                        Pharmacy
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </ScrollArea>
    </div>
  );
}
