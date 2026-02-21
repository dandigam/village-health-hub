import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Printer, DollarSign } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { usePrescriptions, usePatients, useDoctors, useMedicines, useStockItems } from '@/hooks/useApiData';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export default function DispenseMedicine() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: prescriptions = [] } = usePrescriptions();
  const { data: patients = [] } = usePatients();
  const { data: doctors = [] } = useDoctors();
  const { data: medicines = [] } = useMedicines();
  const { data: stockItems = [] } = useStockItems();
  
  const prescription = prescriptions.find(p => p.id === id);
  const patient = prescription ? patients.find(p => p.id === prescription.patientId) : null;
  const doctor = prescription ? doctors.find(d => d.id === prescription.doctorId) : null;

  const [dispensedQty, setDispensedQty] = useState<Record<string, number>>({});
  const [paymentType, setPaymentType] = useState<'full' | 'partial' | 'pending'>('full');
  const [paidAmount, setPaidAmount] = useState('');
  const [showBillDialog, setShowBillDialog] = useState(false);

  if (!prescription || !patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Prescription not found</p>
          <Button className="mt-4" onClick={() => navigate('/pharmacy')}>Back to Pharmacy</Button>
        </div>
      </DashboardLayout>
    );
  }

  const getStockForMedicine = (medicineId: string) => {
    const stock = stockItems.find(s => s.medicineId === medicineId);
    return stock?.quantity || 0;
  };

  const getMedicinePrice = (medicineId: string) => {
    const medicine = medicines.find(m => m.id === medicineId);
    return medicine?.unitPrice || 0;
  };

  const calculateTotal = () => {
    return prescription.items.reduce((sum, item) => {
      const qty = dispensedQty[item.medicineId] !== undefined ? dispensedQty[item.medicineId] : item.quantity;
      return sum + (qty * getMedicinePrice(item.medicineId));
    }, 0);
  };

  const totalAmount = calculateTotal();
  const pendingAmount = paymentType === 'full' ? 0 : 
    paymentType === 'pending' ? totalAmount : 
    Math.max(0, totalAmount - (parseInt(paidAmount) || 0));

  const handleDispense = () => { setShowBillDialog(true); };
  const handlePrint = () => { window.print(); };
  const handlePrintBill = () => { window.print(); setShowBillDialog(false); navigate('/pharmacy'); };

  return (
    <DashboardLayout>
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/pharmacy')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="page-title">Dispense Medicine</h1>
            <p className="text-muted-foreground">{patient.name} {patient.surname} • {patient.patientId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}><Printer className="mr-2 h-4 w-4" /> Print</Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleDispense}><CheckCircle className="mr-2 h-4 w-4" /> Dispense & Generate Bill</Button>
        </div>
      </div>

      <div className="hidden print:block mb-6 soap-print-header">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">HealthCamp PRO</h1>
          <p className="text-sm text-muted-foreground">Medical Camp - Prescription Bill</p>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Patient:</strong> {patient.name} {patient.surname}</p>
            <p><strong>Patient ID:</strong> {patient.patientId}</p>
            <p><strong>Age/Gender:</strong> {patient.age} yrs / {patient.gender}</p>
          </div>
          <div className="text-right">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Doctor:</strong> {doctor?.name}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="no-print">
              <CardTitle>Prescription Items</CardTitle>
              <p className="text-sm text-muted-foreground">Prescribed by {doctor?.name} on {new Date(prescription.createdAt).toLocaleDateString()}</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-3 text-left">Medicine</th>
                      <th className="p-3 text-center">Dosage</th>
                      <th className="p-3 text-center">Prescribed Qty</th>
                      <th className="p-3 text-center no-print">Stock</th>
                      <th className="p-3 text-center no-print">Dispense Qty</th>
                      <th className="p-3 text-right">Price</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescription.items.map((item, index) => {
                      const stock = getStockForMedicine(item.medicineId);
                      const price = getMedicinePrice(item.medicineId);
                      const dispenseQty = dispensedQty[item.medicineId] !== undefined ? dispensedQty[item.medicineId] : item.quantity;
                      const isLowStock = stock < item.quantity;
                      return (
                        <tr key={index} className="border-t">
                          <td className="p-3"><p className="font-medium">{item.medicineName}</p></td>
                          <td className="p-3 text-center text-muted-foreground">{item.morning}-{item.afternoon}-{item.night} × {item.days} days</td>
                          <td className="p-3 text-center">{item.quantity}</td>
                          <td className="p-3 text-center no-print"><Badge variant={isLowStock ? "destructive" : "secondary"}>{stock}</Badge></td>
                          <td className="p-3 no-print">
                            <Input type="number" min="0" max={Math.min(item.quantity, stock)} className="h-8 w-20 text-center mx-auto" value={dispenseQty} onChange={(e) => setDispensedQty({ ...dispensedQty, [item.medicineId]: parseInt(e.target.value) || 0 })} />
                          </td>
                          <td className="p-3 text-right">₹{price}</td>
                          <td className="p-3 text-right font-medium">₹{dispenseQty * price}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot className="bg-muted/50">
                    <tr>
                      <td colSpan={6} className="p-3 text-right font-semibold">Total Amount:</td>
                      <td className="p-3 text-right font-bold text-lg">₹{totalAmount}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 no-print">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5" /> Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-3xl font-bold">₹{totalAmount}</p>
              </div>
              <Separator />
              <div>
                <Label className="mb-3 block">Payment Type</Label>
                <RadioGroup value={paymentType} onValueChange={(v: 'full' | 'partial' | 'pending') => setPaymentType(v)}>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg">
                    <RadioGroupItem value="full" id="full" />
                    <Label htmlFor="full" className="flex-1 cursor-pointer">Full Payment</Label>
                    <Badge className="bg-stat-green text-stat-green-text">₹{totalAmount}</Badge>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="partial" id="partial" />
                    <Label htmlFor="partial" className="flex-1 cursor-pointer">Partial Payment</Label>
                  </div>
                  <div className="flex items-center space-x-2 p-3 border rounded-lg mt-2">
                    <RadioGroupItem value="pending" id="pending" />
                    <Label htmlFor="pending" className="flex-1 cursor-pointer">Payment Pending</Label>
                    <Badge className="bg-destructive/10 text-destructive">₹{totalAmount}</Badge>
                  </div>
                </RadioGroup>
              </div>
              {paymentType === 'partial' && (
                <div>
                  <Label htmlFor="paidAmount">Amount Paid</Label>
                  <Input id="paidAmount" type="number" placeholder="Enter amount..." className="mt-2" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} />
                </div>
              )}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-medium">₹{totalAmount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Paid</span><span className="font-medium text-stat-green-text">₹{paymentType === 'full' ? totalAmount : paymentType === 'pending' ? 0 : parseInt(paidAmount) || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Pending</span><span className="font-medium text-destructive">₹{pendingAmount}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={showBillDialog} onOpenChange={setShowBillDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Bill Generated</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-stat-green rounded-lg">
              <CheckCircle className="h-12 w-12 text-stat-green-text mx-auto mb-2" />
              <p className="font-semibold text-stat-green-text">Medicines Dispensed Successfully!</p>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Patient:</span><span className="font-medium">{patient.name} {patient.surname}</span></div>
              <div className="flex justify-between"><span>Total Amount:</span><span className="font-medium">₹{totalAmount}</span></div>
              <div className="flex justify-between"><span>Paid:</span><span className="font-medium text-stat-green-text">₹{paymentType === 'full' ? totalAmount : paymentType === 'pending' ? 0 : parseInt(paidAmount) || 0}</span></div>
              <div className="flex justify-between"><span>Pending:</span><span className="font-medium text-destructive">₹{pendingAmount}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowBillDialog(false); navigate('/pharmacy'); }}>Close</Button>
            <Button onClick={handlePrintBill}><Printer className="mr-2 h-4 w-4" /> Print Bill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
