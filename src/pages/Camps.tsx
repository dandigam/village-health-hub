import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, Eye, Edit, Play, Square } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilter } from '@/components/shared/SearchFilter';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { useCamps, useDoctors } from '@/hooks/useApiData';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-stat-green/20 text-stat-green-text',
  closed: 'bg-muted text-muted-foreground',
};

export default function Camps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: camps = [] } = useCamps();
  const { data: doctors = [] } = useDoctors();

  const tabFilteredCamps = activeTab === 'all' ? camps : camps.filter((c) => c.status === activeTab);

  const filteredCamps = tabFilteredCamps.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartCamp = (e: React.MouseEvent, campName: string) => {
    e.stopPropagation();
    toast({ title: 'Camp Started', description: `${campName} is now active.` });
  };

  const handleStopCamp = (e: React.MouseEvent, campName: string) => {
    e.stopPropagation();
    toast({ title: 'Camp Stopped', description: `${campName} has been closed.` });
  };

  return (
    <DashboardLayout>
      <SearchFilter
        title="Camp Management"
        count={filteredCamps.length}
        placeholder="Search by Camp Name / Village / District"
        value={searchTerm}
        onChange={setSearchTerm}
        action={
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/camps/new')}>
            <Plus className="mr-2 h-4 w-4" /> Create New Camp
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="bg-card rounded-lg border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Camp Name</TableHead>
              <TableHead className="hidden sm:table-cell">Location</TableHead>
              <TableHead className="hidden md:table-cell">Duration</TableHead>
              <TableHead className="hidden lg:table-cell">Doctors</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCamps.map((camp) => {
              const assignedDoctors = doctors.filter((d) => camp.doctorIds.includes(d.id));
              return (
                <TableRow key={camp.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm">{camp.name}</p>
                      <p className="text-xs text-muted-foreground sm:hidden flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {camp.village}, {camp.district}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" /> {camp.village}, {camp.district}
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{new Date(camp.startDate).toLocaleDateString()} – {new Date(camp.endDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-3.5 w-3.5" /> {assignedDoctors.length} assigned
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn('capitalize text-xs', statusColors[camp.status])}>{camp.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View" onClick={() => navigate(`/camps/${camp.id}`)}>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit" onClick={() => navigate(`/camps/${camp.id}/edit`)}>
                        <Edit className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      {camp.status === 'draft' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Start Camp" onClick={(e) => handleStartCamp(e, camp.name)}>
                          <Play className="h-4 w-4 text-stat-green-text" />
                        </Button>
                      )}
                      {camp.status === 'active' && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="Stop Camp" onClick={(e) => handleStopCamp(e, camp.name)}>
                          <Square className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {filteredCamps.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No camps found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </DashboardLayout>
  );
}
