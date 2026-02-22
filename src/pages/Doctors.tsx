import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Phone, Mail, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from '@/components/shared/SearchFilter';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useDoctors, useCamps } from '@/hooks/useApiData';
import type { Doctor } from '@/types';

export default function Doctors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: doctors = [] } = useDoctors();
  const { data: camps = [] } = useCamps();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  );

  const getAssignedCamps = (doctorId: string) =>
    camps.filter((c) => c.doctorIds.includes(doctorId));

  return (
    <DashboardLayout>
      <SearchFilter
        title="Doctor Management"
        count={filteredDoctors.length}
        placeholder="Search by Name / Specialization / Phone"
        value={searchTerm}
        onChange={setSearchTerm}
        action={
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/doctors/new')}>
            <Plus className="mr-2 h-4 w-4" /> Add Doctor
          </Button>
        }
      />

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Doctor</TableHead>
              <TableHead className="hidden sm:table-cell">Specialization</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead className="hidden lg:table-cell">Email</TableHead>
              <TableHead className="hidden md:table-cell">Assigned Camps</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredDoctors.map((doctor) => {
              const assignedCamps = getAssignedCamps(doctor.id);
              const initials = doctor.name.split(' ').map((n) => n[0]).join('');
              return (
                <TableRow key={doctor.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" /> {doctor.specialization}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" /> {doctor.specialization}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" /> {doctor.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {doctor.email ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" /> {doctor.email}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {assignedCamps.length > 0 ? (
                        assignedCamps.slice(0, 2).map((camp) => (
                          <Badge key={camp.id} variant="secondary" className="text-xs">{camp.name}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No camps</span>
                      )}
                      {assignedCamps.length > 2 && (
                        <Badge variant="outline" className="text-xs">+{assignedCamps.length - 2}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => setSelectedDoctor(doctor)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => navigate(`/doctors/${doctor.id}/edit`)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredDoctors.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No doctors found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Doctor View Modal */}
      <Dialog open={!!selectedDoctor} onOpenChange={(open) => !open && setSelectedDoctor(null)}>
        <DialogContent className="sm:max-w-md">
          {selectedDoctor && (() => {
            const initials = selectedDoctor.name.split(' ').map((n) => n[0]).join('');
            const assignedCamps = getAssignedCamps(selectedDoctor.id);
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="text-lg">Doctor Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Doctor profile header */}
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedDoctor.photoUrl} alt={selectedDoctor.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xl">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">{selectedDoctor.name}</h3>
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                        <Stethoscope className="h-3.5 w-3.5" /> {selectedDoctor.specialization}
                      </div>
                      <Badge variant={selectedDoctor.status === 'active' ? 'default' : 'secondary'} className="mt-1.5 text-xs capitalize">
                        {selectedDoctor.status}
                      </Badge>
                    </div>
                  </div>

                  <Separator />

                  {/* Contact info */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{selectedDoctor.phone}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-foreground">{selectedDoctor.email || '—'}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Assigned camps */}
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Assigned Camps</p>
                    <div className="flex flex-wrap gap-2">
                      {assignedCamps.length > 0 ? (
                        assignedCamps.map((camp) => (
                          <Badge key={camp.id} variant="secondary" className="text-xs">{camp.name}</Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No camps assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedDoctor(null)}>
                      Close
                    </Button>
                    <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => { setSelectedDoctor(null); navigate(`/doctors/${selectedDoctor.id}/edit`); }}>
                      <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit Doctor
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
