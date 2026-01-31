import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, DollarSign, Search, Download, Building2, Users, Pill, Stethoscope, Percent } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { mockDiscounts, mockPatients, mockDoctors, mockCamps, mockMedicines, mockPrescriptions } from '@/data/mockData';
import { format } from 'date-fns';

export default function DiscountReports() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState<string | null>(null);

  const filteredDiscounts = mockDiscounts.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.reason?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary stats
  const totalDiscountValue = mockDiscounts.reduce((sum, d) => 
    d.type === 'fixed' ? sum + d.value : sum, 0
  );
  const uniquePatients = [...new Set(mockDiscounts.map(d => d.patientId))].length;
  const uniqueCamps = [...new Set(mockDiscounts.map(d => d.campId))].length;

  const getDiscountDetails = (discountId: string) => {
    const discount = mockDiscounts.find(d => d.id === discountId);
    if (!discount) return null;

    const patient = mockPatients.find(p => p.id === discount.patientId);
    const doctor = mockDoctors.find(d => d.id === discount.appliedBy);
    const camp = mockCamps.find(c => c.id === discount.campId);
    const medicines = discount.medicineIds?.map(id => mockMedicines.find(m => m.id === id)).filter(Boolean) || [];
    const prescription = mockPrescriptions.find(p => p.id === discount.prescriptionId);

    return {
      discount,
      patient,
      doctor,
      camp,
      medicines,
      prescription,
    };
  };

  const discountDetails = selectedDiscount ? getDiscountDetails(selectedDiscount) : null;

  return (
    <DashboardLayout campName="Reports">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/reports')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <Percent className="h-5 w-5 text-primary" />
                Discount-Based Reports
              </h1>
              <p className="text-sm text-muted-foreground">Discount utilization and beneficiary analytics</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">₹{totalDiscountValue}</p>
                  <p className="text-xs text-muted-foreground">Total Discounts</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{uniquePatients}</p>
                  <p className="text-xs text-muted-foreground">Beneficiaries</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{uniqueCamps}</p>
                  <p className="text-xs text-muted-foreground">Camps</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Percent className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xl font-bold">{mockDiscounts.length}</p>
                  <p className="text-xs text-muted-foreground">Total Applied</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by discount name or reason..." 
                className="pl-9 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Discount List */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="h-10 text-xs">Discount Name</TableHead>
                  <TableHead className="h-10 text-xs">Type</TableHead>
                  <TableHead className="h-10 text-xs">Patient</TableHead>
                  <TableHead className="h-10 text-xs">Camp</TableHead>
                  <TableHead className="h-10 text-xs">Applied By</TableHead>
                  <TableHead className="h-10 text-xs">Date</TableHead>
                  <TableHead className="h-10 text-xs text-right">Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts.map(discount => {
                  const patient = mockPatients.find(p => p.id === discount.patientId);
                  const camp = mockCamps.find(c => c.id === discount.campId);
                  const doctor = mockDoctors.find(d => d.id === discount.appliedBy);
                  
                  return (
                    <TableRow 
                      key={discount.id} 
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => setSelectedDiscount(discount.id)}
                    >
                      <TableCell className="py-2 text-xs font-medium">{discount.name}</TableCell>
                      <TableCell className="py-2 text-xs">
                        <Badge variant={discount.type === 'percentage' ? 'default' : 'secondary'}>
                          {discount.type === 'percentage' ? 'Percentage' : 'Fixed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs">{patient?.name}</TableCell>
                      <TableCell className="py-2 text-xs">{camp?.name}</TableCell>
                      <TableCell className="py-2 text-xs">{doctor?.name}</TableCell>
                      <TableCell className="py-2 text-xs">{format(new Date(discount.createdAt), 'dd/MM/yyyy')}</TableCell>
                      <TableCell className="py-2 text-xs text-right font-medium text-green-600">
                        {discount.type === 'percentage' ? `${discount.value}%` : `₹${discount.value}`}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Discount Detail Modal */}
        <Dialog open={!!selectedDiscount} onOpenChange={() => setSelectedDiscount(null)}>
          <DialogContent className="max-w-2xl">
            {discountDetails && discountDetails.discount && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Percent className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold">{discountDetails.discount.name}</p>
                      <p className="text-xs font-normal text-muted-foreground">
                        {discountDetails.discount.type === 'percentage' 
                          ? `${discountDetails.discount.value}% discount` 
                          : `₹${discountDetails.discount.value} off`}
                      </p>
                    </div>
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-4">
                  {/* Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Patient</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Users className="h-4 w-4 text-blue-600" />
                          {discountDetails.patient?.name} {discountDetails.patient?.surname}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Camp</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-purple-600" />
                          {discountDetails.camp?.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applied By</p>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-teal-600" />
                          {discountDetails.doctor?.name}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-muted-foreground">Reason</p>
                        <p className="text-sm">{discountDetails.discount.reason}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Applied On</p>
                        <p className="text-sm">{format(new Date(discountDetails.discount.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Linked Medicines */}
                  {discountDetails.medicines.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Linked Medicines</p>
                      <div className="flex flex-wrap gap-2">
                        {discountDetails.medicines.map(med => med && (
                          <Badge key={med.id} variant="outline" className="text-xs">
                            <Pill className="h-3 w-3 mr-1" />
                            {med.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
