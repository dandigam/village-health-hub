import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, ChevronRight } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilter } from '@/components/shared/SearchFilter';
// import { mockDoctors } from '@/data/mockData';
import { useEffect } from 'react';
import { API_BASE_URL } from '@/lib/api';
import { cn } from '@/lib/utils';

const statusColors = {
  draft: 'bg-stat-orange text-stat-orange-text border-stat-orange-text/20',
  start: 'bg-stat-green text-stat-green-text border-stat-green-text/20',
  closed: 'bg-muted text-muted-foreground border-muted-foreground/20',
};

function Camps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [camps, setCamps] = useState([]);
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/camps`)
      .then((res) => res.json())
      .then((data) => setCamps(data))
      .catch(() => setCamps([]));
    fetch(`${API_BASE_URL}/doctors`)
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch(() => setDoctors([]));
  }, []);

  const tabFilteredCamps =
    activeTab === 'all'
      ? camps
      : camps.filter((c) => c.campStatus === activeTab);

  const filteredCamps = tabFilteredCamps.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.village.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.district.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
            <Plus className="mr-2 h-4 w-4" />
            Create New Camp
          </Button>
        }
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Camps</TabsTrigger>
          <TabsTrigger value="start">Active</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps.map((camp) => {
          // doctorIds may be string or number, so convert to string for comparison
          const assignedDoctors = doctors.filter((d) => camp.doctorIds && camp.doctorIds.map(String).includes(String(d.id)));

          return (
            <Card
              key={camp.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/camps/${camp.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{camp.name}</CardTitle>
                  <Badge className={cn('capitalize', statusColors[camp.campStatus])}>
                    {camp.campStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {camp.village}, {camp.district}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {camp.planDate ? new Date(camp.planDate).toLocaleDateString() : '-'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{assignedDoctors.length} Doctors assigned</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {assignedDoctors.slice(0, 3).map((doctor) => (
                      <div
                        key={doctor.id}
                        className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium border-2 border-card"
                      >
                        {doctor.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                    ))}
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

export default Camps;
