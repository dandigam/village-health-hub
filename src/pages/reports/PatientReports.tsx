import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Search, Download, Building2, Pill, Stethoscope, DollarSign, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { usePatients, useCamps, useConsultations, usePrescriptions, usePayments, useDoctors, useDiscounts, useMedicines } from '@/hooks/useApiData';
import { format } from 'date-fns';

export default function PatientReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  const filteredPatients = mockPatients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.phone.includes(searchTerm)
  );

  const getPatientDetails = (patientId: string) => {
    const patient = mockPatients.find(p => p.id === patientId);
    const consultations = mockConsultations.filter(c => c.patientId === patientId);
    const prescriptions = mockPrescriptions.filter(p => p.patientId === patientId);
    const payments = mockPayments.filter(p => p.patientId === patientId);
    const discounts = mockDiscounts.filter(d => d.patientId === patientId);
    
    const campsAttended = [...new Set(consultations.map(c => c.campId))];
    const doctors = [...new Set(consultations.map(c => c.doctorId))];
    
    const medicines: { name: string; quantity: number; prescription: string }[] = [];
    prescriptions.forEach(rx => {
      rx.items.forEach(item => {
        medicines.push({
          name: item.medicineName,
          quantity: item.quantity,
          prescription: rx.id,
        });
      });
    });

    return {
      patient,
      consultations,
      prescriptions,
      payments,
      discounts,
      campsAttended: campsAttended.map(id => mockCamps.find(c => c.id === id)),
      doctors: doctors.map(id => mockDoctors.find(d => d.id === id)),
      medicines,
      totalPaid: payments.reduce((sum, p) => sum + p.paidAmount, 0),
      totalDiscount: discounts.reduce((sum, d) => d.type === 'fixed' ? sum + d.value : sum, 0),
    };
  };

  const patient = selectedPatient ? getPatientDetails(selectedPatient) : null;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Patient-Based Reports
              </h1>
              <p className="text-sm text-muted-foreground">Complete patient history and visit records</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by name, ID, or phone..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Patient List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-10 text-xs">Patient ID</TableHead>
                  <TableHead className="h-10 text-xs">Name</TableHead>
                  <TableHead className="h-10 text-xs">Age/Gender</TableHead>
                  <TableHead className="h-10 text-xs">Village</TableHead>
                  <TableHead className="h-10 text-xs">Phone</TableHead>
                  <TableHead className="h-10 text-xs text-center">Visits</TableHead>
                  <TableHead className="h-10 text-xs text-right">Total Paid</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map(patient => {
                  const visits = mockConsultations.filter(c => c.patientId === patient.id).length;
                  const totalPaid = mockPayments.filter(p => p.patientId === patient.id).reduce((sum, p) => sum + p.paidAmount, 0);
                  
                  return (
                    <TableRow 
                      key={patient.id} 
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedPatient(patient.id)}
                    >
                      <TableCell className="py-2 text-xs font-mono">{patient.patientId}</TableCell>
                      <TableCell className="py-2 text-xs font-medium">{patient.name} {patient.surname}</TableCell>
                      <TableCell className="py-2 text-xs">{patient.age}Y / {patient.gender[0]}</TableCell>
                      <TableCell className="py-2 text-xs">{patient.village}</TableCell>
                      <TableCell className="py-2 text-xs">{patient.phone}</TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge variant="secondary">{visits}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right font-medium text-green-600">₹{totalPaid}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Patient Detail Modal */}
        <Dialog open={!!selectedPatient} onOpenChange={() => setSelectedPatient(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            {patient && patient.patient && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{patient.patient.name} {patient.patient.surname}</p>
                      <p className="text-xs font-normal text-muted-foreground">{patient.patient.patientId}</p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {/* Patient Summary */}
                <div className="grid grid-cols-5 gap-3 my-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <Building2 className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{patient.campsAttended.length}</p>
                    <p className="text-[10px] text-blue-600">Camps</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <Stethoscope className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-700">{patient.consultations.length}</p>
                    <p className="text-[10px] text-purple-600">Consultations</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <Pill className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                    <p className="text-lg font-bold text-orange-700">{patient.medicines.length}</p>
                    <p className="text-[10px] text-orange-600">Medicines</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold text-green-700">₹{patient.totalPaid}</p>
                    <p className="text-[10px] text-green-600">Paid</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-teal-600 mb-1" />
                    <p className="text-lg font-bold text-teal-700">₹{patient.totalDiscount}</p>
                    <p className="text-[10px] text-teal-600">Discounts</p>
                  </div>
                </div>

                <Tabs defaultValue="camps" className="w-full">
                  <TabsList className="h-8 mb-2">
                    <TabsTrigger value="camps" className="text-xs h-7">Camps Attended</TabsTrigger>
                    <TabsTrigger value="medicines" className="text-xs h-7">Medicines</TabsTrigger>
                    <TabsTrigger value="consultations" className="text-xs h-7">Consultations</TabsTrigger>
                    <TabsTrigger value="discounts" className="text-xs h-7">Discounts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="camps" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Camp</TableHead>
                            <TableHead className="h-8 text-xs">Location</TableHead>
                            <TableHead className="h-8 text-xs">Date</TableHead>
                            <TableHead className="h-8 text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.campsAttended.map(camp => camp && (
                            <TableRow key={camp.id}>
                              <TableCell className="py-2 text-xs font-medium">{camp.name}</TableCell>
                              <TableCell className="py-2 text-xs">{camp.village}, {camp.district}</TableCell>
                              <TableCell className="py-2 text-xs">{camp.startDate}</TableCell>
                              <TableCell className="py-2 text-xs">
                                <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>{camp.status}</Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="medicines" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Medicine</TableHead>
                            <TableHead className="h-8 text-xs text-right">Quantity</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.medicines.map((med, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="py-2 text-xs font-medium">{med.name}</TableCell>
                              <TableCell className="py-2 text-xs text-right">{med.quantity}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="consultations" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Date</TableHead>
                            <TableHead className="h-8 text-xs">Doctor</TableHead>
                            <TableHead className="h-8 text-xs">Diagnosis</TableHead>
                            <TableHead className="h-8 text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.consultations.map(consult => {
                            const doctor = mockDoctors.find(d => d.id === consult.doctorId);
                            return (
                              <TableRow key={consult.id}>
                                <TableCell className="py-2 text-xs">{format(new Date(consult.createdAt), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="py-2 text-xs font-medium">{doctor?.name}</TableCell>
                                <TableCell className="py-2 text-xs">{consult.diagnosis.join(', ')}</TableCell>
                                <TableCell className="py-2 text-xs">
                                  <Badge variant={consult.status === 'completed' ? 'default' : 'secondary'}>{consult.status}</Badge>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="discounts" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Discount</TableHead>
                            <TableHead className="h-8 text-xs">Reason</TableHead>
                            <TableHead className="h-8 text-xs text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.discounts.map(discount => (
                            <TableRow key={discount.id}>
                              <TableCell className="py-2 text-xs font-medium">{discount.name}</TableCell>
                              <TableCell className="py-2 text-xs text-muted-foreground">{discount.reason}</TableCell>
                              <TableCell className="py-2 text-xs text-right font-medium text-green-600">
                                {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
