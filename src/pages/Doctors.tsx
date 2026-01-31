import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Phone, Mail, Stethoscope } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { mockDoctors, mockCamps } from '@/data/mockData';

export default function Doctors() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = useMemo(() => {
    return mockDoctors.filter((doctor) => {
      const searchLower = searchQuery.toLowerCase();
      return (
        !searchQuery ||
        doctor.name.toLowerCase().includes(searchLower) ||
        doctor.specialization.toLowerCase().includes(searchLower) ||
        doctor.phone.includes(searchQuery)
      );
    });
  }, [searchQuery]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Doctor Management <span className="text-muted-foreground">({filteredDoctors.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage doctors and assignments</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/doctors/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Doctor
        </Button>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by doctor name, specialization, or phone..."
      />

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDoctors.map((doctor) => {
          const assignedCamps = mockCamps.filter((c) => c.doctorIds.includes(doctor.id));

          return (
            <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-accent text-accent-foreground text-lg">
                      {doctor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{doctor.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Stethoscope className="h-4 w-4" />
                      {doctor.specialization}
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {doctor.phone}
                  </div>
                  {doctor.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {doctor.email}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <p className="text-xs text-muted-foreground mb-2">Assigned Camps:</p>
                  <div className="flex flex-wrap gap-2">
                    {assignedCamps.map((camp) => (
                      <Badge key={camp.id} variant="secondary">
                        {camp.name}
                      </Badge>
                    ))}
                    {assignedCamps.length === 0 && (
                      <span className="text-sm text-muted-foreground">No camps assigned</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredDoctors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No doctors found matching your search.</p>
            {searchQuery && (
              <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2">
                Clear search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
