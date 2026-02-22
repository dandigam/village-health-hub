import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useDoctors, useCamps } from '@/hooks/useApiData';
import { Stethoscope, Phone, Mail, ArrowLeft } from 'lucide-react';

export default function ViewDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: doctors = [] } = useDoctors();
  const { data: camps = [] } = useCamps();
  const doctor = doctors.find((d) => String(d.id) === String(id));

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
          <Button className="mt-4" onClick={() => navigate('/doctors')}>Back to Doctors</Button>
        </div>
      </DashboardLayout>
    );
  }

  const assignedCamps = camps.filter((c) => c.doctorIds.includes(String(doctor.id)));
  const initials = doctor.name.split(' ').map((n) => n[0]).join('');

  return (
    <DashboardLayout>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate('/doctors')}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="page-title">Doctor Details</h1>
      </div>
      <Card className="max-w-xl mx-auto">
        <CardHeader className="py-4 border-b bg-muted/30">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Avatar className="h-12 w-12">
              <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-lg">{initials}</AvatarFallback>
            </Avatar>
            {doctor.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Stethoscope className="h-4 w-4" /> {doctor.specialization}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Phone className="h-4 w-4" /> {doctor.phoneNumber ?? doctor.phone}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Mail className="h-4 w-4" /> {doctor.email || '—'}
          </div>
          <div className="mt-4">
            <span className="text-xs text-muted-foreground">Assigned Camps</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {assignedCamps.length > 0 ? (
                assignedCamps.map((camp) => (
                  <Badge key={camp.id} variant="secondary" className="text-xs">{camp.name}</Badge>
                ))
              ) : (
                <span className="text-xs text-muted-foreground">No camps</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
