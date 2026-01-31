import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { mockPatients } from '@/data/mockData';

export default function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = mockPatients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.surname?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <h1 className="page-title">
          Patients List <span className="text-muted-foreground">({filteredPatients.length})</span>
        </h1>
        <div className="flex items-center gap-4">
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search Patient by MR Number / First Name / Surname"
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/patients/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        </div>
      </div>

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
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
