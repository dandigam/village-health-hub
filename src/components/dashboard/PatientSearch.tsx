import { useState } from 'react';
import { Search, ArrowRight, UserPlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { mockPatients } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';

export function PatientSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  
  const filteredPatients = searchTerm
    ? mockPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.patientId.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="bg-card rounded-lg border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-accent">Find Patient</h3>
        <Button variant="link" className="text-accent" onClick={() => navigate('/patients')}>
          View all Patients →
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Patient by MR Number / First Name / Surname"
          className="pl-10 pr-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-accent hover:bg-accent/90"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Search Results */}
      {filteredPatients.length > 0 && (
        <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => navigate(`/patients/${patient.id}`)}
            >
              <div>
                <p className="font-medium">{patient.name}</p>
                <p className="text-sm text-muted-foreground">
                  {patient.village} | {patient.patientId}
                </p>
              </div>
              <span className="text-sm px-2 py-1 bg-muted rounded">{patient.age} Yrs</span>
            </div>
          ))}
        </div>
      )}

      <div className="text-center text-muted-foreground my-4">(or)</div>

      <Button 
        className="w-full bg-accent hover:bg-accent/90"
        onClick={() => navigate('/patients/new')}
      >
        <UserPlus className="mr-2 h-4 w-4" />
        Add New Patient
      </Button>
    </div>
  );
}
