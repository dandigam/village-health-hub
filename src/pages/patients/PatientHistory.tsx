import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VisitTimeline, type Visit } from '@/components/patients/VisitTimeline';
import { VisitDetailPanel } from '@/components/patients/VisitDetailPanel';
import { usePatients, usePrescriptions, usePayments, useDoctors, useCamps } from '@/hooks/useApiData';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: allPatients = [] } = usePatients();
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: allPayments = [] } = usePayments();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allCamps = [] } = useCamps();

  const patient = allPatients.find(p => p.id === id);
  const patientPrescriptions = allPrescriptions.filter(p => p.patientId === id);
  const patientPayments = allPayments.filter(p => p.patientId === id);

  const getDoctorName = (doctorId: string) => allDoctors.find(d => d.id === doctorId)?.name || 'Unknown';
  const getCamp = (campId: string) => allCamps.find(c => c.id === campId);

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient not found</p>
          <Button className="mt-4" onClick={() => navigate('/patients')}>Back to Patients</Button>
        </div>
      </DashboardLayout>
    );
  }

  const visits: Visit[] = patientPrescriptions.map((prescription) => {
    const camp = getCamp(prescription.campId);
    const payment = patientPayments.find(pay => pay.prescriptionId === prescription.id);
    const doctorName = getDoctorName(prescription.doctorId);

    return {
      id: prescription.id, visitNumber: 0, date: prescription.createdAt,
      campName: camp?.name || 'Unknown Camp',
      amount: { paid: payment?.paidAmount || 0, pending: payment?.pendingAmount || 0 },
      chiefComplaint: `Visit with ${doctorName}`,
      vitals: 'No vitals',
      assessment: '',
      plan: '',
      fullDetails: {
        campId: prescription.campId, campName: camp?.name || 'Unknown Camp', campLocation: camp?.location || 'Unknown',
        visitDate: prescription.createdAt,
        paymentType: payment ? (payment.pendingAmount === 0 && payment.paidAmount === 0 ? 'Free' : 'Paid') : 'Free',
        totalAmount: payment?.totalAmount || 0, paidAmount: payment?.paidAmount || 0,
        pendingAmount: payment?.pendingAmount || 0, discountAmount: payment?.discountAmount || 0,
        chiefComplaint: `Visit with ${doctorName}`,
        vitals: {}, labs: [],
        assessment: '', plan: '',
        soapNote: { subjective: '', objective: '', assessment: '', plan: '' },
        prescription: {
          items: prescription.items.map(item => ({
            medicineName: item.medicineName, dosage: `${item.morning}-${item.afternoon}-${item.night}`,
            quantity: item.quantity, days: item.days,
          })),
        },
      },
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  visits.forEach((visit, index) => { visit.visitNumber = visits.length - index; });

  if (!initialized && visits.length > 0 && !selectedVisit) {
    setSelectedVisit(visits[0]);
    setInitialized(true);
  }

  return (
    <DashboardLayout>
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}><ArrowLeft className="h-5 w-5" /></Button>
          <div><h1 className="page-title">Patient History</h1><p className="text-muted-foreground text-sm">{patient.patientId}</p></div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="mr-2 h-4 w-4" />Print</Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate('/encounters')}><FileText className="mr-2 h-4 w-4" />New Encounter</Button>
        </div>
      </div>
      <div className="hidden print:block mb-6">
        <div className="text-center mb-4"><h1 className="text-2xl font-bold">HealthCamp PRO</h1><p className="text-sm text-muted-foreground">Medical Camp - Patient History Report</p></div>
      </div>
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0"><User className="h-7 w-7 text-accent" /></div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div><p className="text-xs text-muted-foreground">Full Name</p><p className="text-sm font-semibold">{patient.name} {patient.surname}</p></div>
              <div><p className="text-xs text-muted-foreground">Age / Gender</p><p className="text-sm font-semibold">{patient.age} yrs / {patient.gender}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="text-sm font-semibold">{patient.phone}</p></div>
              <div><p className="text-xs text-muted-foreground">Village</p><p className="text-sm font-semibold">{patient.village}, {patient.district}</p></div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="flex gap-5">
        <div className="w-[28%] flex-shrink-0">
          <Card><CardContent className="py-4"><VisitTimeline visits={visits} selectedId={selectedVisit?.id || null} onSelect={setSelectedVisit} /></CardContent></Card>
        </div>
        <div className="flex-1">
          <Card className="sticky top-4"><CardContent className="py-5"><VisitDetailPanel visit={selectedVisit} /></CardContent></Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
