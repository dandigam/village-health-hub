import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, UserPlus } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { usePatients } from '@/hooks/useApiData';

export default function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { data: patientsRaw = [] } = usePatients();
  // Handle paginated response with 'content' array
  const patients = Array.isArray(patientsRaw)
    ? patientsRaw
    : Array.isArray((patientsRaw as any).content)
      ? (patientsRaw as any).content
      : [];
  const filteredPatients = patients.filter(
    (p) =>
      (p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <DashboardLayout>
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
                    <AvatarImage src={patient.photoUrl || undefined} alt={patient.firstName || ''} />
                    <AvatarFallback className="bg-accent/10 text-accent">
                      {(patient.firstName || '').charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </td>
                <td className="font-mono text-sm">{patient.patientId}</td>
                <td className="font-medium">{patient.firstName} {patient.lastName}</td>
                <td>{patient.fatherSpouseName}</td>
                <td>{patient.age}</td>
                <td>{patient.gender}</td>
                <td className="uppercase">{patient.address?.cityVillage}</td>
                <td>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="text-accent" onClick={() => navigate(`/patients/${patient.id}`)} title="View History">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => navigate(`/patients/${patient.id}/edit`)} title="Edit Patient">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
