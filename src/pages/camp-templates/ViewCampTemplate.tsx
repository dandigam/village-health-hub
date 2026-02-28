import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCampTemplates, useDoctors, useCampEvents } from '@/hooks/useApiData';
import { useCampTemplate } from '@/hooks/useCampTemplate';
import { ArrowLeft, Edit, MapPin, Stethoscope, Users, Calendar, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active: 'bg-[hsl(var(--stat-green))] text-[hsl(var(--stat-green-text))]',
  inactive: 'bg-muted text-muted-foreground',
};

const eventStatusColors: Record<string, string> = {
  planned: 'bg-[hsl(var(--stat-orange))] text-[hsl(var(--stat-orange-text))]',
  started: 'bg-[hsl(var(--stat-green))] text-[hsl(var(--stat-green-text))]',
  closed: 'bg-muted text-muted-foreground',
};

export default function ViewCampTemplate() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: templates = [] } = useCampTemplates();
  const { data: template, isLoading } = useCampTemplate(id);
  const { data: doctors = [] } = useDoctors();
  const { data: events = [] } = useCampEvents();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }
  if (!template) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Template not found</p>
          <Button className="mt-4" onClick={() => navigate('/camp-templates')}>Back to Templates</Button>
        </div>
      </DashboardLayout>
    );
  }

  const assignedDoctors = doctors.filter((d) => {
    if (!template.doctorList) return false;
    return template.doctorList.map(String).includes(String(d.id));
  });
  const templateEvents = events.filter((e) => e.id === template.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/camp-templates')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{template.campName}</h1>
              <p className="text-sm text-muted-foreground">Camp Template</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={cn('capitalize text-xs', statusColors[template.status] || (template.active === true ? statusColors['active'] : statusColors['inactive']) || '')}>
              {template.status || (template.active === true ? 'active' : 'inactive')}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/camp-templates/${template.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1.5" /> Edit
            </Button>
            <Button size="sm" onClick={() => navigate(`/camp-events/new?templateId=${template.id}`)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Event
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-orange))]/20 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-[hsl(var(--stat-orange-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{assignedDoctors.length}</p>
                <p className="text-xs text-muted-foreground">Default Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-teal))]/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-[hsl(var(--stat-teal-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{template.doctorList?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Default Staff</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-blue))]/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[hsl(var(--stat-blue-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{templateEvents.length}</p>
                <p className="text-xs text-muted-foreground">Total Events</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(var(--stat-green))]/20 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-[hsl(var(--stat-green-text))]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{templateEvents.filter((e) => e.status === 'started').length}</p>
                <p className="text-xs text-muted-foreground">Active Events</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Info */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> Location & Organizer
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-xs text-muted-foreground">Organizer</p><p className="text-sm font-medium">{template.organizerName}</p></div>
                <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-medium">{template.organizerPhone}</p></div>
                <div><p className="text-xs text-muted-foreground">State</p><p className="text-sm font-medium">{template.state || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">District</p><p className="text-sm font-medium">{template.district || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">Mandal</p><p className="text-sm font-medium">{template.mandal || '—'}</p></div>
                <div><p className="text-xs text-muted-foreground">City</p><p className="text-sm font-medium">{template.city || '—'}</p></div>
              </div>
              <Separator />
              <div><p className="text-xs text-muted-foreground mb-1">Address</p><p className="text-sm">{template.address || '—'}</p></div>
            </CardContent>
          </Card>

          {/* Doctors */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-accent" /> Default Doctors ({assignedDoctors.length})
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
                <p className="text-sm text-muted-foreground text-center py-4">No default doctors assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event History */}
        {templateEvents.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> Camp Events ({templateEvents.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {templateEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/camp-events/${event.id}`)}>
                    <div>
                      <p className="font-medium text-sm">{event.startDate} – {event.endDate}</p>
                      <p className="text-xs text-muted-foreground">{event.doctorsList?.length || 0} doctors · {event.staffList?.length || 0} staff</p>
                    </div>
                    <Badge className={cn('capitalize text-xs', eventStatusColors[event.status] || '')}>
                      {event.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
