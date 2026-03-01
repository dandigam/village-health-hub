import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, User, Printer, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { VisitTimeline, type Visit } from '@/components/patients/VisitTimeline';
import { VisitDetailPanel } from '@/components/patients/VisitDetailPanel';
import { usePatients, usePrescriptions, usePayments, useDoctors, useCamps } from '@/hooks/useApiData';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [initialized, setInitialized] = useState(false);

  const { data: patientsRaw = [] } = usePatients();
  const allPatients = Array.isArray((patientsRaw as any).content)
    ? (patientsRaw as any).content
    : Array.isArray(patientsRaw) ? patientsRaw : [];
  const { data: allPrescriptions = [] } = usePrescriptions();
  const { data: allPayments = [] } = usePayments();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allCamps = [] } = useCamps();

  const patient = allPatients.find(p => String(p.id) === String(id));
  const patientPrescriptions = allPrescriptions.filter(p => p.patientId === id);
  const patientPayments = allPayments.filter(p => p.patientId === id);

  const getDoctorName = (doctorId: string) => allDoctors.find(d => d.id === doctorId)?.name || 'Unknown';
  const getCamp = (campId: string) => allCamps.find(c => c.id === campId);

  if (!patient) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Patient not found</p>
          <Button className="mt-4" onClick={() => navigate('/patients')}>Back to Patients</Button>
        </div>
      </div>
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
      vitals: 'No vitals', assessment: '', plan: '',
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

  const patientName = `${patient.name || patient.firstName || ''} ${patient.surname || patient.lastName || ''}`.trim();
  const initials = patientName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Compact header bar */}
      <div className="border-b bg-muted/30 px-5 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-accent/15 text-accent text-xs font-semibold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground leading-tight">{patientName}</p>
            <p className="text-[11px] text-muted-foreground">
              MR#: {patient.patientId}, DOB: {patient.dob || 'N/A'} ({patient.gender?.[0] || 'U'}).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />Print
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate('/encounters')}>
            <FileText className="mr-2 h-4 w-4" />New Encounter
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-1" onClick={() => navigate('/patients')}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block mb-6 px-5 pt-4">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">HealthCamp PRO</h1>
          <p className="text-sm text-muted-foreground">Patient History Report</p>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto p-5">
        {/* Patient summary card */}
        <Card className="mb-5">
          <CardContent className="py-4">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 text-accent" />
              </div>
              <div className="flex-1 grid grid-cols-4 gap-4">
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Full Name</p><p className="text-sm font-semibold">{patientName}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Age / Gender</p><p className="text-sm font-semibold">{patient.age} yrs / {patient.gender}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Phone</p><p className="text-sm font-semibold">{patient.phone || patient.phoneNumber || ''}</p></div>
                <div><p className="text-[10px] text-muted-foreground uppercase tracking-wider">Village</p><p className="text-sm font-semibold">{patient.village || patient.address?.cityVillage || ''}, {patient.district || patient.address?.district || ''}</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline + Detail */}
        <div className="flex gap-5">
          <div className="w-[28%] flex-shrink-0">
            <Card><CardContent className="py-4"><VisitTimeline visits={visits} selectedId={selectedVisit?.id || null} onSelect={setSelectedVisit} /></CardContent></Card>
          </div>
          <div className="flex-1">
            <Card className="sticky top-4"><CardContent className="py-5"><VisitDetailPanel visit={selectedVisit} /></CardContent></Card>
          </div>
        </div>
      </div>
    </div>
  );
}
