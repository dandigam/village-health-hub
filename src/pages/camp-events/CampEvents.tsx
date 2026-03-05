import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Eye, Edit, Play, Square, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilter } from '@/components/shared/SearchFilter';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useCampEvents, useDoctors, useSaveCampEvent } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  planned: 'bg-[hsl(var(--stat-orange))] text-[hsl(var(--stat-orange-text))]',
  started: 'bg-[hsl(var(--stat-green))] text-[hsl(var(--stat-green-text))]',
  closed: 'bg-muted text-muted-foreground',
};

export default function CampEvents() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('started');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmAction, setConfirmAction] = useState<{ type: 'start' | 'close'; eventId: string; name: string } | null>(null);
  const { data: events = [] } = useCampEvents();
  const { data: doctors = [] } = useDoctors();
  const saveMutation = useSaveCampEvent();

  const tabFiltered = activeTab === 'all' ? events : events.filter((e) => e.status === activeTab);
  const filtered = tabFiltered.filter(
    (e) =>
      (e.campName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.city || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    if (confirmAction.type === 'start') {
      // Find the event to update
      const event = events.find((e) => String(e.id) === String(confirmAction.eventId));
      if (event) {
        const payload = { ...event, status: 'started' };
        await saveMutation.mutateAsync(payload);
        toast({ title: 'Camp Started', description: `${confirmAction.name} is now active.` });
      }
    } else if (confirmAction.type === 'close') {
      // Stop (close) the event
      const event = events.find((e) => String(e.id) === String(confirmAction.eventId));
      if (event) {
        const payload = { ...event, status: 'closed' };
        await saveMutation.mutateAsync(payload);
        toast({ title: 'Camp Closed', description: `${confirmAction.name} has been closed.` });
      }
    }
    setConfirmAction(null);
  };

  return (
    <DashboardLayout>
      <SearchFilter
        title="Camp Events"
        count={filtered.length}
        placeholder="Search by camp name, district, or city..."
        value={searchTerm}
        onChange={setSearchTerm}
        action={
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/camp-events/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Event
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="started">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--stat-green-text))] mr-1.5" />
            Active
          </TabsTrigger>
          <TabsTrigger value="planned">
            <span className="w-2 h-2 rounded-full bg-[hsl(var(--stat-orange-text))] mr-1.5" />
            Planned
          </TabsTrigger>
          <TabsTrigger value="closed">
            <span className="w-2 h-2 rounded-full bg-muted-foreground mr-1.5" />
            Closed
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Camp Name</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Date Range</TableHead>
              <TableHead className="hidden lg:table-cell">Doctors</TableHead>
              <TableHead className="hidden lg:table-cell">Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((event) => {
              const assignedDoctors = doctors.filter((d) => event.doctorsList?.includes(d.id));
              return (
                <TableRow key={event.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/camp-events/${event.id}`)}>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{event.campName}</p>
                      <p className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {event.district}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {event.city || event.mandal}, {event.district}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" /> {assignedDoctors.length}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {event.staffList?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize text-xs', statusColors[event.status] || '')}>{event.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      {/* Always show View */}
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/camp-events/${event.id}`)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      {/* Planned: Edit, Start */}
                      {event.status === 'planned' && (
                        <>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => navigate(`/camp-events/${event.id}/edit`)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8" title="Start Camp"
                            onClick={() => setConfirmAction({ type: 'start', eventId: event.id, name: event.campName || 'Camp' })}
                          >
                            <Play className="h-4 w-4 text-[hsl(var(--stat-green-text))]" />
                          </Button>
                        </>
                      )}
                      {/* Active: Stop */}
                      {event.status === 'started' && (
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8" title="Stop Camp"
                          onClick={() => setConfirmAction({ type: 'close', eventId: event.id, name: event.campName || 'Camp' })}
                        >
                          <Square className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                      {/* Closed: Only View (already shown above) */}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No camp events found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.type === 'start' ? 'Start Camp Event?' : 'Close Camp Event?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === 'start'
                ? `Are you sure you want to start "${confirmAction?.name}"? This will change the status to Started and lock template editing.`
                : `Are you sure you want to close "${confirmAction?.name}"? This action cannot be undone. The template will remain active for future events.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              className={confirmAction?.type === 'close' ? 'bg-destructive hover:bg-destructive/90' : ''}
            >
              {confirmAction?.type === 'start' ? 'Start Camp' : 'Close Camp'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
