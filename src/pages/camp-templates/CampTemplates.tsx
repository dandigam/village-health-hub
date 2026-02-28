import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Eye, Edit, Stethoscope, Users, ToggleLeft, ToggleRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SearchFilter } from '@/components/shared/SearchFilter';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useCampTemplates, useDoctors } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  active: 'bg-[hsl(var(--stat-green))] text-[hsl(var(--stat-green-text))]',
  inactive: 'bg-muted text-muted-foreground',
};

export default function CampTemplates() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const { data: templates = [] } = useCampTemplates();
  const { data: doctors = [] } = useDoctors();

  const filtered = templates
    .filter((t) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return t.active === true;
      if (statusFilter === 'inactive') return t.active === false;
      return true;
    })
    .filter((t) => {
      const campName = t.campName ? t.campName.toLowerCase() : '';
      const district = t.district ? t.district.toLowerCase() : '';
      const organizerName = t.organizerName ? t.organizerName.toLowerCase() : '';
      const search = searchTerm.toLowerCase();
      return (
        campName.includes(search) ||
        district.includes(search) ||
        organizerName.includes(search)
      );
    });

  const handleToggleStatus = (e: React.MouseEvent, templateId: string, currentStatus: string) => {
    e.stopPropagation();
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    toast({ title: `Template ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`, description: `Template status changed to ${newStatus}.` });
  };

  return (
    <DashboardLayout>
      <SearchFilter
        title="Camp Templates"
        count={filtered.length}
        placeholder="Search by name, district, or organizer..."
        value={searchTerm}
        onChange={setSearchTerm}
        action={
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/camp-templates/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create Template
          </Button>
        }
      />

      {/* Status Filter Pills */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'inactive'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-medium transition-all border',
              statusFilter === status
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
            )}
          >
            {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-card rounded-xl border shadow-sm overflow-hidden" style={{ boxShadow: 'var(--card-shadow)' }}>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Camp Name</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Organizer</TableHead>
              <TableHead className="hidden lg:table-cell">Doctors</TableHead>
              <TableHead className="hidden lg:table-cell">Staff</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((template) => {
              const assignedDoctors = doctors.filter((d) => {
                // doctorIds may be number[] or string[]; ensure type match
                if (!template.doctorList) return false;
                return template.doctorList.map(String).includes(String(d.id));
              });
              return (
                <TableRow key={template.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => navigate(`/camp-templates/${template.id}`)}>
                  <TableCell>
                    <p className="font-medium text-sm">{template.campName}</p>
                    <p className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {template.district}
                    </p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {template.mandal}, {template.district}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <p className="text-sm">{template.organizerName}</p>
                    <p className="text-xs text-muted-foreground">{template.organizerPhone}</p>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" /> {assignedDoctors.length}
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {template.staffList?.length || 0}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize text-xs', statusColors[template.status] || '')}>
                      {template.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/camp-templates/${template.id}`)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => navigate(`/camp-templates/${template.id}/edit`)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={template.status === 'active' ? 'Deactivate' : 'Activate'}
                        onClick={(e) => handleToggleStatus(e, template.id, template.status)}
                      >
                        {template.status === 'active' ? (
                          <ToggleRight className="h-4 w-4 text-[hsl(var(--stat-green-text))]" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No camp templates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
