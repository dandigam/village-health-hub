import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCampEvents, useDoctors, useCampTemplates } from '@/hooks/useApiData';
import { ArrowLeft, Edit, MapPin, Calendar, Users, Stethoscope, Tent } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  planned: 'bg-[hsl(var(--stat-orange))] text-[hsl(var(--stat-orange-text))]',
  started: 'bg-[hsl(var(--stat-green))] text-[hsl(var(--stat-green-text))]',
  closed: 'bg-muted text-muted-foreground',
};

export default function ViewCampEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: events = [] } = useCampEvents();
  const { data: doctors = [] } = useDoctors();
  const { data: templates = [] } = useCampTemplates();

  const event = events.find((e) => String(e.id) === String(id));

  if (!event) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Camp event not found</p>
          <Button className="mt-4" onClick={() => navigate('/camp-events')}>Back to Events</Button>
        </div>
      </DashboardLayout>
    );
  }

  const template = templates.find((t) => String(t.id) === String(event.campId));
  const assignedDoctors = doctors.filter((d) => event.doctorsList?.includes(d.id));
  const isLocked = event.status === 'started' || event.status === 'closed';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/camp-events')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{event.campName || template?.campName || 'Camp Event'}</h1>
              <p className="text-sm text-muted-foreground">Camp Event</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={cn('capitalize text-xs', statusColors[event.status] || '')}>{event.status}</Badge>
            {event.status === 'planned' && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/camp-events/${event.id}/edit`)}>
                <Edit className="h-4 w-4 mr-1.5" /> Edit
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{event.startDate ? new Date(event.startDate).toLocaleDateString() : '—'}</p>
                <p className="text-xs text-muted-foreground">Start Date</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold">{event.endDate ? new Date(event.endDate).toLocaleDateString() : '—'}</p>
                <p className="text-xs text-muted-foreground">End Date</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-orange))]/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-[hsl(var(--stat-orange-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignedDoctors.length}</p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-teal))]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[hsl(var(--stat-teal-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold">{event.staffList?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Staff</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Template Link */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Tent className="h-4 w-4 text-accent" /> Linked Template
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {template ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{template.campName}</p>
                      <p className="text-xs text-muted-foreground">{template.organizerName} · {template.organizerPhone}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/camp-templates/${template.id}`)}>View Template</Button>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><span className="text-muted-foreground">State:</span> <span className="font-medium">{event.state || '—'}</span></div>
                    <div><span className="text-muted-foreground">District:</span> <span className="font-medium">{event.district || '—'}</span></div>
                    <div><span className="text-muted-foreground">Mandal:</span> <span className="font-medium">{event.mandal || '—'}</span></div>
                    <div><span className="text-muted-foreground">City:</span> <span className="font-medium">{event.city || '—'}</span></div>
                    <div className="col-span-2"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{event.address || '—'}</span></div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Template not found</p>
              )}
            </CardContent>
          </Card>

          {/* Doctors */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-accent" /> Assigned Doctors ({assignedDoctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {assignedDoctors.length > 0 ? (
                <div className="space-y-2.5">
                  {assignedDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">{doctor.status}</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No doctors assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lock Notice */}
        {isLocked && (
          <div className="p-4 rounded-lg bg-muted/40 border border-border/40 text-center">
            <p className="text-sm text-muted-foreground">
              {event.status === 'started' 
                ? '🔒 This camp event is currently running. Template editing is locked.'
                : '🔒 This camp event has been closed. No further changes can be made. The template remains available for future events.'
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
