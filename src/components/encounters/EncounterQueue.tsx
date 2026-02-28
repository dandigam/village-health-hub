import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Clock, RotateCcw, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EncounterPatient, EncounterStatus, statusConfig } from '@/pages/encounters/Encounters';

interface EncounterQueueProps {
  queue: EncounterPatient[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onStartVisit: (id: string) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function EncounterQueue({ queue, selectedId, onSelect, onStartVisit, onRefresh, isRefreshing }: EncounterQueueProps) {
  // Sort: WAITING first, then WITH_DOCTOR, then PHARMACY
  const statusOrder: Record<EncounterStatus, number> = { WAITING: 0, WITH_DOCTOR: 1, PHARMACY: 2, COMPLETED: 3 };
  const sorted = [...queue].sort((a, b) => statusOrder[a.status] - statusOrder[b.status] || a.token - b.token);

  return (
    <div className="h-full flex flex-col bg-card rounded-xl border border-border/50" style={{ boxShadow: '0 1px 4px hsl(var(--shadow-color, 222 40% 8%) / 0.04)' }}>
      <div className="px-3 py-2.5 border-b border-border/40">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Queue</p>
          <div className="flex items-center gap-1.5">
            {onRefresh && (
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={onRefresh} disabled={isRefreshing}>
                <RefreshCw className={cn('h-3 w-3', isRefreshing && 'animate-spin')} />
              </Button>
            )}
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4.5">
              {queue.length} patients
            </Badge>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {sorted.map((encounter) => {
            const config = statusConfig[encounter.status];
            const isSelected = selectedId === encounter.patient.id;
            const StatusIcon = config.icon;

            return (
              <div
                key={encounter.patient.id}
                onClick={() => onSelect(encounter.patient.id)}
                className={cn(
                  'p-2.5 rounded-lg cursor-pointer transition-all duration-150 border group',
                  isSelected
                    ? 'bg-primary/5 border-primary/20 shadow-sm'
                    : 'border-transparent hover:bg-muted/50'
                )}
              >
                {/* Token + Name Row */}
                <div className="flex items-start gap-2.5">
                  {/* Token Badge */}
                  <div className={cn(
                    'h-7 w-7 rounded-lg flex items-center justify-center text-[10px] font-bold shrink-0',
                    config.bgColor, config.color
                  )}>
                    {encounter.token}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground font-mono">{encounter.patient.patientId}</span>
                      {encounter.isReturning && (
                        <RotateCcw className="h-2.5 w-2.5 text-[hsl(var(--warning))]" />
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {encounter.patient.name || `${encounter.patient.firstName || ''} ${encounter.patient.lastName || ''}`.trim()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {encounter.patient.age}Y · {encounter.patient.gender}
                    </p>
                  </div>
                </div>

                {/* Status + Waiting Time */}
                <div className="flex items-center justify-between mt-2 pl-9">
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 h-4.5 gap-1', config.color, config.bgColor, config.borderColor)}>
                      <StatusIcon className="h-2.5 w-2.5" />
                      {config.label}
                    </Badge>
                  </div>
                  {encounter.status === 'WAITING' && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      {encounter.waitingMinutes}m
                    </div>
                  )}
                </div>

                {/* Start button for waiting patients */}
                {encounter.status === 'WAITING' && (
                  <div className="mt-2 pl-9">
                    <Button
                      size="sm"
                      className="h-6 text-[10px] px-3 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        onStartVisit(encounter.patient.id);
                      }}
                    >
                      <Play className="h-2.5 w-2.5 mr-1" />
                      Start Consultation
                    </Button>
                  </div>
                )}

                {encounter.assignedDoctor && (
                  <p className="text-[10px] text-muted-foreground truncate mt-1 pl-9">
                    Dr. {encounter.assignedDoctor}
                  </p>
                )}
              </div>
            );
          })}

          {sorted.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No patients in queue
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
