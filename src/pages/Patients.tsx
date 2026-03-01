import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Edit2, UserPlus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { usePatients } from '@/hooks/useApiData';
import { PageLoader } from '@/components/shared/PageLoader';
import { PatientQuickViewModal } from '@/components/patients/PatientQuickViewModal';
import { cn } from '@/lib/utils';
import type { Patient } from '@/types';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'registered', label: 'Registered' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const statusDisplay: Record<string, { label: string; className: string }> = {
  registered: { label: 'Registered', className: 'bg-stat-blue text-stat-blue-text' },
  in_progress: { label: 'In Progress', className: 'bg-stat-orange text-stat-orange-text' },
  completed: { label: 'Completed', className: 'bg-stat-green text-stat-green-text' },
};

const PAGE_SIZES = [10, 20, 50];

export default function Patients() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const { data: patientsRaw = [], isLoading } = usePatients();

  const patients: Patient[] = Array.isArray(patientsRaw)
    ? patientsRaw
    : Array.isArray((patientsRaw as any).content)
      ? (patientsRaw as any).content
      : [];

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch =
        !searchTerm ||
        p.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.patientId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [patients, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / pageSize));
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePatientClick = (patient: Patient) => {
    setSelectedPatient(patient);
    setModalOpen(true);
  };

  // Reset page when filters change
  const handleSearchChange = (v: string) => { setSearchTerm(v); setCurrentPage(1); };
  const handleStatusChange = (v: string) => { setStatusFilter(v); setCurrentPage(1); };

  if (isLoading) {
    return <DashboardLayout><PageLoader type="table" /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      {/* Header with search + filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <SearchFilter
          title="Patients List"
          count={filteredPatients.length}
          placeholder="Search by MR Number / Name"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <div className="flex items-center gap-3">
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[160px] h-10">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/patients/new')}>
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Patient
          </Button>
        </div>
      </div>

      {/* Table */}
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
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedPatients.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center py-12 text-muted-foreground">
                  No patients found
                </td>
              </tr>
            ) : (
              paginatedPatients.map((patient) => {
                const sd = statusDisplay[patient.status] || statusDisplay.registered;
                return (
                  <tr
                    key={patient.id}
                    className="cursor-pointer hover:bg-primary/5 transition-colors"
                    onClick={() => handlePatientClick(patient)}
                  >
                    <td>
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={patient.photoUrl || undefined} alt={patient.firstName || patient.name || ''} />
                        <AvatarFallback className="bg-accent/10 text-accent text-xs font-semibold">
                          {(patient.firstName || patient.name || '').charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </td>
                    <td className="font-mono text-sm">{patient.patientId}</td>
                    <td className="font-medium">
                      {patient.firstName || patient.name} {patient.lastName || patient.surname || ''}
                    </td>
                    <td>{patient.fatherSpouseName || patient.fatherName || '-'}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td className="uppercase">{typeof patient.address === 'object' ? patient.address?.cityVillage : patient.village}</td>
                    <td>
                      <Badge className={cn('text-[11px] font-medium rounded-full px-2.5 py-0.5', sd.className)}>
                        {sd.label}
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 text-accent border-accent/30 hover:bg-accent/10"
                          onClick={() => navigate(`/patients/${patient.id}`)}
                        >
                          <Eye className="h-3 w-3" /> View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 hover:bg-primary/10"
                          onClick={() => navigate(`/patients/${patient.id}/edit`)}
                        >
                          <Edit2 className="h-3 w-3" /> Edit
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPatients.length > 0 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Show</span>
            <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map((s) => (
                  <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
            <span className="ml-2 text-foreground font-medium">
              {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredPatients.length)} of {filteredPatients.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
              Math.max(0, currentPage - 3),
              currentPage + 2
            ).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8 text-xs"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Patient Quick View Modal */}
      <PatientQuickViewModal
        patient={selectedPatient}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </DashboardLayout>
  );
}
