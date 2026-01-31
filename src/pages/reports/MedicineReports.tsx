import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Pill, Search, Download, Building2, Users, Stethoscope, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockMedicines, mockPrescriptions, mockPatients, mockDoctors, mockCamps, mockDiscounts } from '@/data/mockData';

export default function MedicineReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState<string | null>(null);

  const filteredMedicines = mockMedicines.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code.includes(searchTerm) ||
    m.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMedicineStats = (medicineId: string) => {
    const medicine = mockMedicines.find(m => m.id === medicineId);
    
    // Find all prescriptions containing this medicine
    const prescriptionsWithMedicine = mockPrescriptions.filter(rx => 
      rx.items.some(item => item.medicineId === medicineId)
    );

    // Get unique camps, patients, and doctors
    const campIds = [...new Set(prescriptionsWithMedicine.map(rx => rx.campId))];
    const patientIds = [...new Set(prescriptionsWithMedicine.map(rx => rx.patientId))];
    const doctorIds = [...new Set(prescriptionsWithMedicine.map(rx => rx.doctorId))];

    // Calculate total quantity prescribed
    let totalQuantity = 0;
    prescriptionsWithMedicine.forEach(rx => {
      rx.items.forEach(item => {
        if (item.medicineId === medicineId) {
          totalQuantity += item.quantity;
        }
      });
    });

    // Get discounts linked to this medicine
    const relatedDiscounts = mockDiscounts.filter(d => 
      d.medicineIds?.includes(medicineId)
    );

    return {
      medicine,
      totalQuantity,
      totalValue: totalQuantity * (medicine?.unitPrice || 0),
      camps: campIds.map(id => mockCamps.find(c => c.id === id)).filter(Boolean),
      patients: patientIds.map(id => mockPatients.find(p => p.id === id)).filter(Boolean),
      doctors: doctorIds.map(id => mockDoctors.find(d => d.id === id)).filter(Boolean),
      prescriptions: prescriptionsWithMedicine,
      discounts: relatedDiscounts,
    };
  };

  const medicine = selectedMedicine ? getMedicineStats(selectedMedicine) : null;

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
                <Pill className="h-5 w-5 text-primary" />
                Medicine-Based Reports
              </h1>
              <p className="text-sm text-muted-foreground">Medicine distribution and usage analytics</p>
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
                placeholder="Search by medicine name, code, or category..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Medicine List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-10 text-xs">Code</TableHead>
                  <TableHead className="h-10 text-xs">Medicine Name</TableHead>
                  <TableHead className="h-10 text-xs">Category</TableHead>
                  <TableHead className="h-10 text-xs text-right">Unit Price</TableHead>
                  <TableHead className="h-10 text-xs text-center">Camps</TableHead>
                  <TableHead className="h-10 text-xs text-center">Patients</TableHead>
                  <TableHead className="h-10 text-xs text-right">Total Qty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMedicines.map(med => {
                  const stats = getMedicineStats(med.id);
                  return (
                    <TableRow 
                      key={med.id} 
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedMedicine(med.id)}
                    >
                      <TableCell className="py-2 text-xs font-mono">{med.code}</TableCell>
                      <TableCell className="py-2 text-xs font-medium">{med.name}</TableCell>
                      <TableCell className="py-2 text-xs">
                        <Badge variant="outline" className="text-[10px]">{med.category}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right">₹{med.unitPrice}</TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge variant="secondary">{stats.camps.length}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-center">
                        <Badge variant="secondary">{stats.patients.length}</Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-right font-medium">{stats.totalQuantity}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Medicine Detail Modal */}
        <Dialog open={!!selectedMedicine} onOpenChange={() => setSelectedMedicine(null)}>
          <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
            {medicine && medicine.medicine && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Pill className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold">{medicine.medicine.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {medicine.medicine.code} • {medicine.medicine.category}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                {/* Summary Stats */}
                <div className="grid grid-cols-5 gap-3 my-4">
                  <div className="bg-blue-50 rounded-lg p-2 text-center">
                    <Building2 className="h-4 w-4 mx-auto text-blue-600 mb-1" />
                    <p className="text-lg font-bold text-blue-700">{medicine.camps.length}</p>
                    <p className="text-[10px] text-blue-600">Camps</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-2 text-center">
                    <Users className="h-4 w-4 mx-auto text-green-600 mb-1" />
                    <p className="text-lg font-bold text-green-700">{medicine.patients.length}</p>
                    <p className="text-[10px] text-green-600">Patients</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2 text-center">
                    <Stethoscope className="h-4 w-4 mx-auto text-purple-600 mb-1" />
                    <p className="text-lg font-bold text-purple-700">{medicine.doctors.length}</p>
                    <p className="text-[10px] text-purple-600">Doctors</p>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-2 text-center">
                    <Pill className="h-4 w-4 mx-auto text-orange-600 mb-1" />
                    <p className="text-lg font-bold text-orange-700">{medicine.totalQuantity}</p>
                    <p className="text-[10px] text-orange-600">Units</p>
                  </div>
                  <div className="bg-teal-50 rounded-lg p-2 text-center">
                    <DollarSign className="h-4 w-4 mx-auto text-teal-600 mb-1" />
                    <p className="text-lg font-bold text-teal-700">₹{medicine.totalValue}</p>
                    <p className="text-[10px] text-teal-600">Value</p>
                  </div>
                </div>

                <Tabs defaultValue="camps" className="w-full">
                  <TabsList className="h-8 mb-2">
                    <TabsTrigger value="camps" className="text-xs h-7">Camps</TabsTrigger>
                    <TabsTrigger value="patients" className="text-xs h-7">Patients</TabsTrigger>
                    <TabsTrigger value="doctors" className="text-xs h-7">Doctors</TabsTrigger>
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
                          {medicine.camps.map(camp => camp && (
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

                  <TabsContent value="patients" className="mt-0">
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/50">
                            <TableHead className="h-8 text-xs">Patient ID</TableHead>
                            <TableHead className="h-8 text-xs">Name</TableHead>
                            <TableHead className="h-8 text-xs">Age/Gender</TableHead>
                            <TableHead className="h-8 text-xs">Village</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicine.patients.map(patient => patient && (
                            <TableRow key={patient.id}>
                              <TableCell className="py-2 text-xs font-mono">{patient.patientId}</TableCell>
                              <TableCell className="py-2 text-xs font-medium">{patient.name} {patient.surname}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.age}Y / {patient.gender[0]}</TableCell>
                              <TableCell className="py-2 text-xs">{patient.village}</TableCell>
                            </TableRow>
                          ))}
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
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicine.doctors.map(doctor => doctor && (
                            <TableRow key={doctor.id}>
                              <TableCell className="py-2 text-xs font-medium">{doctor.name}</TableCell>
                              <TableCell className="py-2 text-xs">{doctor.specialization}</TableCell>
                              <TableCell className="py-2 text-xs">{doctor.phone}</TableCell>
                            </TableRow>
                          ))}
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
                            <TableHead className="h-8 text-xs">Patient</TableHead>
                            <TableHead className="h-8 text-xs">Reason</TableHead>
                            <TableHead className="h-8 text-xs text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {medicine.discounts.map(discount => {
                            const patient = mockPatients.find(p => p.id === discount.patientId);
                            return (
                              <TableRow key={discount.id}>
                                <TableCell className="py-2 text-xs font-medium">{discount.name}</TableCell>
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
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
