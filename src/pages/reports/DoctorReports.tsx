import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Stethoscope, Search, Download, Building2, Users, Pill, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctors, useConsultations, usePrescriptions, usePatients, useCamps, useMedicines } from '@/hooks/useApiData';
import { format } from 'date-fns';

export default function DoctorReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  const { data: allDoctors = [] } = useDoctors();
  const { data: allConsultations = [] } = useConsultations();
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: allPatients = [] } = usePatients();
  const { data: allCamps = [] } = useCamps();
  const { data: allMedicines = [] } = useMedicines();

  const filteredDoctors = allDoctors.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDoctorStats = (doctorId: string) => {
    const doctor = allDoctors.find(d => d.id === doctorId);
    const consultations = allConsultations.filter(c => c.doctorId === doctorId);
    const prescriptions = allPrescriptions.filter(p => p.doctorId === doctorId);
    
    const campIds = [...new Set(consultations.map(c => c.campId))];
    const patientIds = [...new Set(consultations.map(c => c.patientId))];
    
    const medicineCount: Record<string, number> = {};
    prescriptions.forEach(rx => {
      rx.items.forEach(item => {
        medicineCount[item.medicineId] = (medicineCount[item.medicineId] || 0) + item.quantity;
      });
    });

    return {
      doctor,
      consultations,
      prescriptions,
      camps: campIds.map(id => allCamps.find(c => c.id === id)).filter(Boolean),
      patients: patientIds.map(id => allPatients.find(p => p.id === id)).filter(Boolean),
      medicineCount,
      totalPrescriptions: prescriptions.length,
    };
  };

  const doctorStats = selectedDoctor ? getDoctorStats(selectedDoctor) : null;

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
                <Stethoscope className="h-5 w-5 text-primary" />
                Doctor-Based Reports
              </h1>
              <p className="text-sm text-muted-foreground">Doctor performance and consultation history</p>
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
                placeholder="Search by doctor name or specialization..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Doctor List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-10 text-xs">Doctor Name</TableHead>
                  <TableHead className="h-10 text-xs">Specialization</TableHead>
                  <TableHead className="h-10 text-xs">Phone</TableHead>
                  <TableHead className="h-10 text-xs text-center">Camps</TableHead>
                  <TableHead className="h-10 text-xs text-center">Patients</TableHead>
                  <TableHead className="h-10 text-xs text-center">Consultations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDoctors.map(doctor => {
                  const stats = getDoctorStats(doctor.id);
                  return (
                    <TableRow 
                      key={doctor.id} 
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedDoctor(doctor.id)}
                    >
                      <TableCell className="py-2 text-xs font-medium">{doctor.name}</TableCell>
                      <TableCell className="py-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{doctor.specialization}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{doctor.phone}</TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge variant="secondary">{stats.camps.length}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge variant="secondary">{stats.patients.length}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge>{stats.consultations.length}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Doctor Detail Modal */}
        <Dialog open={!!selectedDoctor} onOpenChange={() => setSelectedDoctor(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            {doctorStats && doctorStats.doctor && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Stethoscope className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{doctorStats.doctor.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {doctorStats.doctor.specialization} • {doctorStats.doctor.phone}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {/* Summary Stats */}
                <div className="grid grid-cols-4 gap-3 my-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <Building2 className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{doctorStats.camps.length}</p>
                    <p className="text-[10px] text-blue-600">Camps</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold text-green-700">{doctorStats.patients.length}</p>
                    <p className="text-[10px] text-green-600">Patients</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <Calendar className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-700">{doctorStats.consultations.length}</p>
                    <p className="text-[10px] text-purple-600">Consultations</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <Pill className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                    <p className="text-lg font-bold text-orange-700">{Object.keys(doctorStats.medicineCount).length}</p>
                    <p className="text-[10px] text-orange-600">Medicines</p>
                  </div>
                </div>

                <Tabs defaultValue="camps" className="w-full">
                  <TabsList className="h-8 mb-2">
                    <TabsTrigger value="camps" className="text-xs h-7">Camps Attended</TabsTrigger>
                    <TabsTrigger value="patients" className="text-xs h-7">Patients Consulted</TabsTrigger>
                    <TabsTrigger value="medicines" className="text-xs h-7">Medicines Prescribed</TabsTrigger>
                    <TabsTrigger value="history" className="text-xs h-7">Consultation History</TabsTrigger>
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
                            <TableHead className="h-8 text-xs text-right">Consultations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctorStats.camps.map(camp => camp && (
                            <TableRow key={camp.id}>
                              <TableCell className="py-2 text-xs font-medium">{camp.name}</TableCell>
                              <TableCell className="py-2 text-xs">{camp.village}, {camp.district}</TableCell>
                              <TableCell className="py-2 text-xs">{camp.startDate}</TableCell>
                              <TableCell className="py-2 text-xs">
                                <Badge variant={camp.status === 'active' ? 'default' : 'secondary'}>{camp.status}</Badge>
                              </TableCell>
                              <TableCell className="py-2 text-xs text-right font-medium">
                                {doctorStats.consultations.filter(c => c.campId === camp.id).length}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="patients" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Patient ID</TableHead>
                            <TableHead className="h-8 text-xs">Name</TableHead>
                            <TableHead className="h-8 text-xs">Age/Gender</TableHead>
                            <TableHead className="h-8 text-xs">Village</TableHead>
                            <TableHead className="h-8 text-xs text-right">Visits</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctorStats.patients.map(patient => patient && (
                            <TableRow key={patient.id}>
                              <TableCell className="py-2 text-xs font-mono">{patient.patientId}</TableCell>
                              <TableCell className="py-2 text-xs font-medium">{patient.name} {patient.surname}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.age}Y / {patient.gender[0]}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.village}</TableCell>
                              <TableCell className="py-2 text-xs text-right font-medium">
                                {doctorStats.consultations.filter(c => c.patientId === patient.id).length}
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
                            <TableHead className="h-8 text-xs">Category</TableHead>
                            <TableHead className="h-8 text-xs text-right">Qty Prescribed</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(doctorStats.medicineCount).map(([medId, qty]) => {
                            const medicine = allMedicines.find(m => m.id === medId);
                            return medicine ? (
                              <TableRow key={medId}>
                                <TableCell className="py-2 text-xs font-medium">{medicine.name}</TableCell>
                                <TableCell className="py-2 text-xs">
                                  <Badge variant="outline" className="text-[10px]">{medicine.category}</Badge>
                                </TableCell>
                                <TableCell className="py-2 text-xs text-right font-medium">{qty}</TableCell>
                              </TableRow>
                            ) : null;
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="history" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Date</TableHead>
                            <TableHead className="h-8 text-xs">Patient</TableHead>
                            <TableHead className="h-8 text-xs">Diagnosis</TableHead>
                            <TableHead className="h-8 text-xs">Camp</TableHead>
                            <TableHead className="h-8 text-xs">Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {doctorStats.consultations.map(consult => {
                            const patient = allPatients.find(p => p.id === consult.patientId);
                            const camp = allCamps.find(c => c.id === consult.campId);
                            return (
                              <TableRow key={consult.id}>
                                <TableCell className="py-2 text-xs">{format(new Date(consult.createdAt), 'dd/MM/yyyy')}</TableCell>
                                <TableCell className="py-2 text-xs font-medium">{patient?.name}</TableCell>
                                <TableCell className="py-2 text-xs max-w-[200px] truncate">{consult.diagnosis.join(', ')}</TableCell>
                                <TableCell className="py-2 text-xs">{camp?.name}</TableCell>
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
                </Tabs>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}