import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CheckCircle, DollarSign, Clock, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePrescriptions, usePatients, useDoctors } from '@/hooks/useApiData';

export default function PharmacyDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();

  const getPatientInfo = (patientId: string) => patients.find(p => p.id === patientId);
  const getDoctorInfo = (doctorId: string) => doctors.find(d => d.id === doctorId);

  const pendingPrescriptions = prescriptions.filter(p => p.status === 'pending');
  const partialPrescriptions = prescriptions.filter(p => p.status === 'partial');
  const dispensedPrescriptions = prescriptions.filter(p => p.status === 'dispensed');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-stat-orange text-stat-orange-text border-stat-orange-text/20">Pending</Badge>;
      case 'partial':
        return <Badge className="bg-stat-pink text-stat-pink-text border-stat-pink-text/20">Partial</Badge>;
      case 'dispensed':
        return <Badge className="bg-stat-green text-stat-green-text border-stat-green-text/20">Dispensed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Pharmacy Dashboard</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-stat-orange"><Clock className="h-6 w-6 text-stat-orange-text" /></div><div><p className="text-2xl font-bold">{pendingPrescriptions.length}</p><p className="text-sm text-muted-foreground">Pending</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-stat-pink"><AlertCircle className="h-6 w-6 text-stat-pink-text" /></div><div><p className="text-2xl font-bold">{partialPrescriptions.length}</p><p className="text-sm text-muted-foreground">Partial</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-stat-green"><CheckCircle className="h-6 w-6 text-stat-green-text" /></div><div><p className="text-2xl font-bold">{dispensedPrescriptions.length}</p><p className="text-sm text-muted-foreground">Dispensed</p></div></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="flex items-center gap-4"><div className="p-3 rounded-full bg-stat-blue"><DollarSign className="h-6 w-6 text-stat-blue-text" /></div><div><p className="text-2xl font-bold">₹12,450</p><p className="text-sm text-muted-foreground">Today's Collection</p></div></div></CardContent></Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="pending">Pending ({pendingPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="partial">Partial ({partialPrescriptions.length})</TabsTrigger>
          <TabsTrigger value="dispensed">Dispensed ({dispensedPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {pendingPrescriptions.map((prescription) => {
              const patient = getPatientInfo(prescription.patientId);
              const doctor = getDoctorInfo(prescription.doctorId);
              return (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                          <span className="text-accent font-semibold">{patient?.name.charAt(0)}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{patient?.name} {patient?.surname}</h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                          <p className="text-sm mt-1">
                            <span className="font-medium">{prescription.items.length} medicines</span>
                            <span className="text-muted-foreground"> • Prescribed by {doctor?.name}</span>
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(prescription.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(prescription.status)}
                        <Button size="sm" variant="outline" onClick={() => navigate(`/pharmacy/prescription/${prescription.id}`)}>
                          <Eye className="h-4 w-4 mr-1" /> View
                        </Button>
                        <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate(`/pharmacy/dispense/${prescription.id}`)}>
                          <CheckCircle className="h-4 w-4 mr-1" /> Dispense
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {pendingPrescriptions.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No pending prescriptions.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="partial">
          <div className="grid gap-4">
            {partialPrescriptions.map((prescription) => {
              const patient = getPatientInfo(prescription.patientId);
              return (
                <Card key={prescription.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-stat-pink flex items-center justify-center">
                          <AlertCircle className="h-6 w-6 text-stat-pink-text" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{patient?.name} {patient?.surname}</h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(prescription.status)}
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" className="bg-accent hover:bg-accent/90">Complete</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {partialPrescriptions.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No partial prescriptions.</CardContent></Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="dispensed">
          <div className="grid gap-4">
            {dispensedPrescriptions.map((prescription) => {
              const patient = getPatientInfo(prescription.patientId);
              return (
                <Card key={prescription.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-stat-green flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-stat-green-text" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{patient?.name} {patient?.surname}</h3>
                          <p className="text-sm text-muted-foreground">{patient?.patientId}</p>
                          <p className="text-xs text-muted-foreground mt-1">Dispensed: {new Date(prescription.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(prescription.status)}
                        <Button size="sm" variant="outline">View Receipt</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
