import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCamps, useDoctors, usePatients } from '@/hooks/useApiData';
import { ArrowLeft, Edit, MapPin, Calendar, Users, Stethoscope, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-stat-green/20 text-stat-green-text',
  closed: 'bg-muted text-muted-foreground',
};

export default function ViewCamp() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: camps = [] } = useCamps();
  const { data: doctors = [] } = useDoctors();
  const { data: patients = [] } = usePatients();

  const camp = camps.find((c) => c.id === id);

  if (!camp) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Camp not found</p>
          <Button className="mt-4" onClick={() => navigate('/camps')}>Back to Camps</Button>
        </div>
      </DashboardLayout>
    );
  }

  const assignedDoctors = doctors.filter((d) => camp.doctorIds.includes(d.id));
  const campPatients = patients.filter((p) => p.campId === camp.id);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/camps')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-foreground">{camp.name}</h1>
              <p className="text-sm text-muted-foreground">Camp Details</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={cn('capitalize text-xs', statusColors[camp.status] || '')}>{camp.status}</Badge>
            <Button size="sm" variant="outline" onClick={() => navigate(`/camps/${camp.id}/edit`)}>
              <Edit className="h-4 w-4 mr-1.5" /> Edit
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{campPatients.length}</p>
                <p className="text-xs text-muted-foreground">Patients</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{assignedDoctors.length}</p>
                <p className="text-xs text-muted-foreground">Doctors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {camp.startDate ? new Date(camp.startDate).toLocaleDateString() : '—'}
                </p>
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
                <p className="text-sm font-semibold text-foreground">
                  {camp.endDate ? new Date(camp.endDate).toLocaleDateString() : '—'}
                </p>
                <p className="text-xs text-muted-foreground">End Date</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Camp Information */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> Location & Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Village</p>
                  <p className="text-sm font-medium text-foreground">{camp.village || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">District</p>
                  <p className="text-sm font-medium text-foreground">{camp.district || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="text-sm font-medium text-foreground">{camp.location || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge className={cn('capitalize text-xs mt-0.5', statusColors[camp.status] || '')}>{camp.status}</Badge>
                </div>
              </div>
              {camp.description && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{camp.description}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Assigned Doctors */}
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-accent" /> Assigned Doctors ({assignedDoctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {assignedDoctors.length > 0 ? (
                <div className="space-y-3">
                  {assignedDoctors.map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                      <div>
                        <p className="font-medium text-sm text-foreground">{doctor.name}</p>
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

        {/* Recent Patients */}
        {campPatients.length > 0 && (
          <Card className="shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-accent" /> Recent Patients ({campPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {campPatients.slice(0, 5).map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => navigate(`/patients/${patient.id}`)}>
                    <div>
                      <p className="font-medium text-sm text-foreground">{patient.name} {patient.surname || ''}</p>
                      <p className="text-xs text-muted-foreground">{patient.patientId} · {patient.gender}, {patient.age} yrs</p>
                    </div>
                    <Badge variant={patient.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">{patient.status}</Badge>
                  </div>
                ))}
                {campPatients.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{campPatients.length - 5} more patients
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
