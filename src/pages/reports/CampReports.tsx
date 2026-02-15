import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Building2, Users, Pill, Stethoscope, DollarSign, Download, Search, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCamps, usePatients, useConsultations, usePrescriptions, usePayments, useDoctors, useMedicines, useDiscounts } from '@/hooks/useApiData';

export default function CampReports() {
  const navigate = useNavigate();
  const [selectedCamp, setSelectedCamp] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: camps = [] } = useCamps();
  const { data: patients = [] } = usePatients();
  const { data: consultations = [] } = useConsultations();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: payments = [] } = usePayments();
  const { data: discounts = [] } = useDiscounts();
  const { data: doctors = [] } = useDoctors();
  const { data: medicines = [] } = useMedicines();

  const filteredCamps = selectedCamp === 'all' 
    ? camps 
    : camps.filter(c => c.id === selectedCamp);

  const getCampStats = (campId: string) => {
    const campPatients = patients.filter(p => p.campId === campId);
    const campConsultations = consultations.filter(c => c.campId === campId);
    const campPrescriptions = prescriptions.filter(p => p.campId === campId);
    const campPayments = payments.filter(p => p.campId === campId);
    const campDiscounts = discounts.filter(d => d.campId === campId);
    const doctorIds = camps.find(c => c.id === campId)?.doctorIds || [];

    const medicinesConsumed: Record<string, number> = {};
    campPrescriptions.forEach(rx => {
      rx.items.forEach(item => {
        medicinesConsumed[item.medicineId] = (medicinesConsumed[item.medicineId] || 0) + item.quantity;
      });
    });

    return {
      patientCount: campPatients.length,
      consultationCount: campConsultations.length,
      totalCollection: campPayments.reduce((sum, p) => sum + p.paidAmount, 0),
      pendingAmount: campPayments.reduce((sum, p) => sum + p.pendingAmount, 0),
      totalDiscounts: campDiscounts.reduce((sum, d) => d.type === 'percentage' ? sum : sum + d.value, 0),
      doctorCount: doctorIds.length,
      medicinesConsumed,
      patients: campPatients,
      doctors: doctors.filter(d => doctorIds.includes(d.id)),
      discounts: campDiscounts,
    };
  };

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
                <Building2 className="h-5 w-5 text-primary" />
                Camp-Based Reports
              </h1>
              <p className="text-sm text-muted-foreground">Detailed camp analytics and statistics</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-3">
            <div className="flex gap-3">
              <Select value={selectedCamp} onValueChange={setSelectedCamp}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Select Camp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Camps</SelectItem>
                  {camps.map(camp => (
                    <SelectItem key={camp.id} value={camp.id}>{camp.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search patients, doctors..." 
                  className="pl-9 h-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Camp Cards */}
        {filteredCamps.map(camp => {
          const stats = getCampStats(camp.id);
          
          return (
            <Card key={camp.id}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    {camp.name}
                    <Badge variant={camp.status === 'active' ? 'default' : camp.status === 'draft' ? 'secondary' : 'outline'}>
                      {camp.status}
                    </Badge>
                  </CardTitle>
                  <span className="text-xs text-muted-foreground">
                    {camp.startDate} - {camp.endDate}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                {/* Summary Stats */}
                <div className="grid grid-cols-6 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <Users className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{stats.patientCount}</p>
                    <p className="text-[10px] text-blue-600">Patients</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <Stethoscope className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-700">{stats.doctorCount}</p>
                    <p className="text-[10px] text-purple-600">Doctors</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <Stethoscope className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                    <p className="text-lg font-bold text-orange-700">{stats.consultationCount}</p>
                    <p className="text-[10px] text-orange-600">Consultations</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold text-green-700">₹{stats.totalCollection}</p>
                    <p className="text-[10px] text-green-600">Collected</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-red-600 mb-1" />
                    <p className="text-lg font-bold text-red-700">₹{stats.pendingAmount}</p>
                    <p className="text-[10px] text-red-600">Pending</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-2 text-center">
                    <Pill className="h-4 w-4 mx-auto text-teal-600 mb-1" />
                    <p className="text-lg font-bold text-teal-700">{Object.keys(stats.medicinesConsumed).length}</p>
                    <p className="text-[10px] text-teal-600">Medicines</p>
                  </div>
                </div>

                {/* Tabs for Details */}
                <Tabs defaultValue="patients" className="w-full">
                  <TabsList className="h-8 mb-2">
                    <TabsTrigger value="patients" className="text-xs h-7">Patients</TabsTrigger>
                    <TabsTrigger value="medicines" className="text-xs h-7">Medicines</TabsTrigger>
                    <TabsTrigger value="doctors" className="text-xs h-7">Doctors</TabsTrigger>
                    <TabsTrigger value="discounts" className="text-xs h-7">Discounts</TabsTrigger>
                  </TabsList>

                  <TabsContent value="patients" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Patient ID</TableHead>
                            <TableHead className="h-8 text-xs">Name</TableHead>
                            <TableHead className="h-8 text-xs">Age/Gender</TableHead>
                            <TableHead className="h-8 text-xs">Village</TableHead>
                            <TableHead className="h-8 text-xs">Phone</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.patients.slice(0, 5).map(patient => (
                            <TableRow key={patient.id} className="cursor-pointer hover:bg-muted/30" onClick={() => navigate(`/patients/${patient.id}`)}>
                              <TableCell className="py-2 text-xs font-mono">{patient.patientId}</TableCell>
                              <TableCell className="py-2 text-xs font-medium">{patient.name} {patient.surname}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.age}Y / {patient.gender[0]}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.village}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.phone}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    {stats.patients.length > 5 && (
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        +{stats.patients.length - 5} more patients
                      </p>
                    )}
                  </TabsContent>

                  <TabsContent value="medicines" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Medicine</TableHead>
                            <TableHead className="h-8 text-xs">Category</TableHead>
                            <TableHead className="h-8 text-xs text-right">Qty Consumed</TableHead>
                            <TableHead className="h-8 text-xs text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(stats.medicinesConsumed).map(([medId, qty]) => {
                            const medicine = medicines.find(m => m.id === medId);
                            return medicine ? (
                              <TableRow key={medId}>
                                <TableCell className="py-2 text-xs font-medium">{medicine.name}</TableCell>
                                <TableCell className="py-2 text-xs">
                                  <Badge variant="outline" className="text-[10px]">{medicine.category}</Badge>
                                </TableCell>
                                <TableCell className="py-2 text-xs text-right">{qty}</TableCell>
                                <TableCell className="py-2 text-xs text-right font-medium">₹{qty * medicine.unitPrice}</TableCell>
                              </TableRow>
                            ) : null;
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>

                  <TabsContent value="doctors" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Doctor</TableHead>
                            <TableHead className="h-8 text-xs">Specialization</TableHead>
                            <TableHead className="h-8 text-xs">Phone</TableHead>
                            <TableHead className="h-8 text-xs text-right">Consultations</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.doctors.map(doctor => {
                            const consultCount = consultations.filter(c => c.campId === camp.id && c.doctorId === doctor.id).length;
                            return (
                              <TableRow key={doctor.id}>
                                <TableCell className="py-2 text-xs font-medium">{doctor.name}</TableCell>
                                <TableCell className="py-2 text-xs">{doctor.specialization}</TableCell>
                                <TableCell className="py-2 text-xs">{doctor.phone}</TableCell>
                                <TableCell className="py-2 text-xs text-right font-medium">{consultCount}</TableCell>
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
                            <TableHead className="h-8 text-xs">Type</TableHead>
                            <TableHead className="h-8 text-xs">Patient</TableHead>
                            <TableHead className="h-8 text-xs">Reason</TableHead>
                            <TableHead className="h-8 text-xs text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {stats.discounts.map(discount => {
                            const patient = patients.find(p => p.id === discount.patientId);
                            return (
                              <TableRow key={discount.id}>
                                <TableCell className="py-2 text-xs font-medium">{discount.name}</TableCell>
                                <TableCell className="py-2 text-xs">
                                  <Badge variant="secondary" className="text-[10px]">
                                    {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                                  </Badge>
                                </TableCell>
                                <TableCell className="py-2 text-xs">{patient?.name}</TableCell>
                                <TableCell className="py-2 text-xs text-muted-foreground">{discount.reason}</TableCell>
                                <TableCell className="py-2 text-xs text-right font-medium text-green-600">
                                  {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}