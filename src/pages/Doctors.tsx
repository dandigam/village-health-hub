import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Phone, Mail, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from '@/components/shared/SearchFilter';
<<<<<<< HEAD
import { mockCamps } from '@/data/mockData';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';

=======
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { mockDoctors, mockCamps } from '@/data/mockData';
>>>>>>> b36c3a6cdd60882364c2216f44643e29b0d14df6

export default function Doctors() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/doctors`)
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch(() => setDoctors([]));
  }, []);

  const filteredDoctors = doctors.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.phone.includes(searchTerm)
  );

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
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
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
              const assignedCamps = mockCamps.filter((c) => c.doctorIds.includes(doctor.id));
              const initials = doctor.name.split(' ').map((n) => n[0]).join('');

              return (
                <TableRow key={doctor.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={doctor.photoUrl} alt={doctor.name} />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{doctor.name}</p>
                        <p className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          {doctor.specialization}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" />
                      {doctor.specialization}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      {doctor.phone}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {doctor.email ? (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />
                        {doctor.email}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {assignedCamps.length > 0 ? (
                        assignedCamps.slice(0, 2).map((camp) => (
                          <Badge key={camp.id} variant="secondary" className="text-xs">
                            {camp.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-xs text-muted-foreground">No camps</span>
                      )}
                      {assignedCamps.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{assignedCamps.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="View"
                        onClick={() => navigate(`/doctors/${doctor.id}`)}
                      >
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Edit"
                        onClick={() => navigate(`/doctors/${doctor.id}/edit`)}
                      >
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
    </DashboardLayout>
  );
}
