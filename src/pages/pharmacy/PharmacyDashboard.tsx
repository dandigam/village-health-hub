import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, DollarSign, Clock, AlertCircle, Pill } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { mockPrescriptions, mockPatients, mockDoctors } from '@/data/mockData';

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>();

  const getPatientInfo = (patientId: string) => mockPatients.find(p => p.id === patientId);
  const getDoctorInfo = (doctorId: string) => mockDoctors.find(d => d.id === doctorId);

  const getInitials = (name?: string, surname?: string) => {
    const first = name?.charAt(0) || '';
    const last = surname?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  };

  const filterPrescriptions = (prescriptions: typeof mockPrescriptions) => {
    return prescriptions.filter(prescription => {
      const patient = getPatientInfo(prescription.patientId);
      const doctor = getDoctorInfo(prescription.doctorId);
      const searchLower = searchQuery.toLowerCase();
      
      const matchesSearch = !searchQuery ||
        patient?.name?.toLowerCase().includes(searchLower) ||
        patient?.surname?.toLowerCase().includes(searchLower) ||
        patient?.patientId?.toLowerCase().includes(searchLower) ||
        doctor?.name?.toLowerCase().includes(searchLower);
      
      const prescriptionDate = new Date(prescription.createdAt);
      const matchesDate = !dateFilter ||
        prescriptionDate.toDateString() === dateFilter.toDateString();
      
      return matchesSearch && matchesDate;
    });
  };

  const pendingPrescriptions = useMemo(() => 
    filterPrescriptions(mockPrescriptions.filter(p => p.status === 'pending')),
    [searchQuery, dateFilter]
  );
  const partialPrescriptions = useMemo(() => 
    filterPrescriptions(mockPrescriptions.filter(p => p.status === 'partial')),
    [searchQuery, dateFilter]
  );
  const dispensedPrescriptions = useMemo(() => 
    filterPrescriptions(mockPrescriptions.filter(p => p.status === 'dispensed')),
    [searchQuery, dateFilter]
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'partial':
        return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Partial</Badge>;
      case 'dispensed':
        return <Badge className="bg-green-100 text-green-700 border-green-200">Dispensed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderPrescriptionCard = (prescription: typeof mockPrescriptions[0], showDispenseButton = false) => {
    const patient = getPatientInfo(prescription.patientId);
    const doctor = getDoctorInfo(prescription.doctorId);

    return (
      <Card key={prescription.id} className="hover:shadow-md transition-shadow">
        <CardContent className="py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <Avatar className="h-12 w-12 flex-shrink-0">
                <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {getInitials(patient?.name, patient?.surname)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold">{patient?.name} {patient?.surname}</h3>
                </div>
                <p className="text-sm text-muted-foreground font-mono">{patient?.patientId}</p>
                <p className="text-sm mt-1">
                  <span className="font-medium">{prescription.items.length} medicines</span>
                  <span className="text-muted-foreground"> • Prescribed by {doctor?.name}</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(prescription.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(prescription.status)}
              <Button size="sm" variant="outline" onClick={() => navigate(`/pharmacy/prescription/${prescription.id}`)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              {showDispenseButton && (
                <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate(`/pharmacy/dispense/${prescription.id}`)}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Dispense
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <Card>
      <CardContent className="py-12 text-center">
        <Pill className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">{message}</p>
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
  );

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pharmacy Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage prescriptions and dispensing</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-yellow-100">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPrescriptions.filter(p => p.status === 'pending').length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-orange-100">
                <AlertCircle className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPrescriptions.filter(p => p.status === 'partial').length}</p>
                <p className="text-sm text-muted-foreground">Partial</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{mockPrescriptions.filter(p => p.status === 'dispensed').length}</p>
                <p className="text-sm text-muted-foreground">Dispensed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">₹12,450</p>
                <p className="text-sm text-muted-foreground">Today's Collection</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by patient name, ID, or doctor..."
        showDateFilter
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending ({pendingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="partial">Partial ({partialPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="dispensed">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingPrescriptions.map((prescription) => renderPrescriptionCard(prescription, true))}
            {pendingPrescriptions.length === 0 && <EmptyState message="No pending prescriptions." />}
          </div>
        </TabsContent>

        <TabsContent value="partial">
          <div className="grid gap-4">
            {partialPrescriptions.map((prescription) => renderPrescriptionCard(prescription, true))}
            {partialPrescriptions.length === 0 && <EmptyState message="No partial prescriptions." />}
          </div>
        </TabsContent>

        <TabsContent value="dispensed">
          <div className="grid gap-4">
            {dispensedPrescriptions.map((prescription) => renderPrescriptionCard(prescription))}
            {dispensedPrescriptions.length === 0 && <EmptyState message="No dispensed prescriptions." />}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
