import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchFilter } from '@/components/shared/SearchFilter';
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
      <SearchFilter
        title="Patients List"
        count={filteredPatients.length}
        placeholder="Search Patient by MR Number / First Name"
        value={searchTerm}
        onChange={setSearchTerm}
        action={
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/patients/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        }
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
                    <AvatarFallback className="bg-accent/10 text-accent">
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
