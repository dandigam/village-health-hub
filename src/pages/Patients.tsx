import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { mockPatients } from '@/data/mockData';

export default function Patients() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const filteredPatients = useMemo(() => {
    return mockPatients.filter((patient) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        patient.name.toLowerCase().includes(searchLower) ||
        patient.patientId.toLowerCase().includes(searchLower) ||
        patient.surname?.toLowerCase().includes(searchLower) ||
        patient.fatherName?.toLowerCase().includes(searchLower) ||
        patient.village?.toLowerCase().includes(searchLower);

      const patientDate = new Date(patient.createdAt);
      const matchesDate = !dateFilter ||
        patientDate.toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesDate;
    });
  }, [searchQuery, dateFilter]);

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Patients List <span className="text-muted-foreground">({filteredPatients.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage registered patients</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/patients/new')}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by MR Number, patient name, father name, or village..."
        showDateFilter
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      {/* Patient Table */}
      <div className="data-table">
        <table className="w-full">
          <thead>
            <tr>
              <th>Photo</th>
              <th>MR Number</th>
              <th>Patient Name</th>
              <th>Father Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>City Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.map((patient) => (
              <tr key={patient.id}>
                <td>
                  <Avatar>
                    <AvatarImage src={patient.photoUrl} alt={patient.name} />
                    <AvatarFallback className="bg-muted">
                      {patient.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="font-mono text-sm">{patient.patientId}</td>
                <td className="font-medium">
                  {patient.name} {patient.surname}
                </td>
                <td>{patient.fatherName}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td className="uppercase">{patient.village}</td>
                <td>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-accent"
                    onClick={() => navigate(`/patients/${patient.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {filteredPatients.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-12">
                  <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">No patients found matching your search.</p>
                  {(searchQuery || dateFilter) && (
                    <Button 
                      variant="link" 
                      onClick={() => { setSearchQuery(''); setDateFilter(undefined); }} 
                      className="mt-2"
                    >
                      Clear filters
                    </Button>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
