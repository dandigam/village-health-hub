import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MapPin, Calendar, Users, ChevronRight, Tent } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { mockCamps, mockDoctors } from '@/data/mockData';
import { cn } from '@/lib/utils';

const statusColors = {
  draft: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  active: 'bg-green-100 text-green-800 border-green-200',
  closed: 'bg-gray-100 text-gray-800 border-gray-200',
};

export default function Camps() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const filteredCamps = useMemo(() => {
    let camps = activeTab === 'all'
      ? mockCamps
      : mockCamps.filter((c) => c.status === activeTab);

    return camps.filter((camp) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery ||
        camp.name.toLowerCase().includes(searchLower) ||
        camp.village.toLowerCase().includes(searchLower) ||
        camp.district.toLowerCase().includes(searchLower);

      const campDate = new Date(camp.startDate);
      const matchesDate = !dateFilter ||
        campDate.toDateString() === dateFilter.toDateString();

      return matchesSearch && matchesDate;
    });
  }, [activeTab, searchQuery, dateFilter]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">
            Camp Management <span className="text-muted-foreground">({filteredCamps.length})</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage medical camps and locations</p>
        </div>
        <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/camps/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Create New Camp
        </Button>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by camp name, village, or district..."
        showDateFilter
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Camps ({mockCamps.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({mockCamps.filter(c => c.status === 'active').length})</TabsTrigger>
          <TabsTrigger value="draft">Draft ({mockCamps.filter(c => c.status === 'draft').length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({mockCamps.filter(c => c.status === 'closed').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCamps.map((camp) => {
          const doctors = mockDoctors.filter((d) => camp.doctorIds.includes(d.id));

          return (
            <Card
              key={camp.id}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/camps/${camp.id}`)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{camp.name}</CardTitle>
                  <Badge className={cn('capitalize', statusColors[camp.status])}>
                    {camp.status}
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
                      {new Date(camp.startDate).toLocaleDateString()} -{' '}
                      {new Date(camp.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{doctors.length} Doctors assigned</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {doctors.slice(0, 3).map((doctor) => (
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

      {filteredCamps.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Tent className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No camps found matching your search.</p>
            {(searchQuery || dateFilter) && (
              <Button 
                variant="link" 
                onClick={() => { setSearchQuery(''); setDateFilter(undefined); }} 
                className="mt-2"
              >
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </DashboardLayout>
  );
}
