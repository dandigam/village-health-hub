import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { VisitTimeline, type Visit } from '@/components/patients/VisitTimeline';
import { VisitDetailPanel } from '@/components/patients/VisitDetailPanel';
import { mockPatients, mockSOAPNotes, mockConsultations, mockPrescriptions, mockPayments, mockDoctors, mockCamps } from '@/data/mockData';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);

  const patient = mockPatients.find(p => p.id === id);
  const patientSOAPs = mockSOAPNotes.filter(s => s.patientId === id);
  const patientConsultations = mockConsultations.filter(c => c.patientId === id);
  const patientPrescriptions = mockPrescriptions.filter(p => p.patientId === id);
  const patientPayments = mockPayments.filter(p => p.patientId === id);

  const getDoctorName = (doctorId: string) => mockDoctors.find(d => d.id === doctorId)?.name || 'Unknown';
  const getCamp = (campId: string) => mockCamps.find(c => c.id === campId);

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

  // Build visits
  const visits: Visit[] = patientSOAPs.map((soap, index) => {
    const camp = getCamp(soap.campId);
    const consultation = patientConsultations.find(c => c.soapNoteId === soap.id);
    const prescription = consultation ? patientPrescriptions.find(p => p.consultationId === consultation.id) : null;
    const payment = prescription ? patientPayments.find(pay => pay.prescriptionId === prescription.id) : null;

    const vitalsStr = [
      soap.objective.bp && `BP: ${soap.objective.bp}`,
      soap.objective.pulse && `Pulse: ${soap.objective.pulse}`,
      soap.objective.spo2 && `SpO2: ${soap.objective.spo2}%`,
    ].filter(Boolean).join(', ') || 'No vitals';

    return {
      id: soap.id,
      visitNumber: 0,
      date: soap.createdAt,
      campName: camp?.name || 'Unknown Camp',
      amount: {
        paid: payment?.paidAmount || 0,
        pending: payment?.pendingAmount || 0,
      },
      chiefComplaint: consultation?.chiefComplaint || soap.subjective,
      vitals: vitalsStr,
      assessment: consultation?.diagnosis?.join(', ') || soap.assessment,
      plan: soap.plan,
      fullDetails: {
        campId: soap.campId,
        campName: camp?.name || 'Unknown Camp',
        campLocation: camp?.location || 'Unknown',
        visitDate: soap.createdAt,
        paymentType: payment ? (payment.pendingAmount === 0 && payment.paidAmount === 0 ? 'Free' : 'Paid') : 'Free',
        totalAmount: payment?.totalAmount || 0,
        paidAmount: payment?.paidAmount || 0,
        pendingAmount: payment?.pendingAmount || 0,
        discountAmount: payment?.discountAmount || 0,
        chiefComplaint: consultation?.chiefComplaint || soap.subjective,
        vitals: soap.objective,
        labs: consultation?.labTests || [],
        assessment: consultation?.diagnosis?.join(', ') || soap.assessment,
        plan: soap.plan,
        soapNote: {
          subjective: soap.subjective,
          objective: soap.objective.notes || 'No notes',
          assessment: soap.assessment,
          plan: soap.plan,
        },
        prescription: prescription ? {
          items: prescription.items.map(item => ({
            medicineName: item.medicineName,
            dosage: `${item.morning}-${item.afternoon}-${item.night}`,
            quantity: item.quantity,
            days: item.days,
          })),
        } : undefined,
      },
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  visits.forEach((visit, index) => {
    visit.visitNumber = visits.length - index;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Patient History</h1>
            <p className="text-muted-foreground text-sm">{patient.patientId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={() => navigate('/soap/new')}>
            <FileText className="mr-2 h-4 w-4" />
            New SOAP Note
          </Button>
        </div>
      </div>

      {/* Print Header */}
      <div className="hidden print:block mb-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Srini FOUNDATION</h1>
          <p className="text-sm text-muted-foreground">Medical Camp - Patient History Report</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardContent className="py-5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <User className="h-7 w-7 text-accent" />
            </div>
            <div className="flex-1 grid grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="text-sm font-semibold">{patient.name} {patient.surname}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Age / Gender</p>
                <p className="text-sm font-semibold">{patient.age} yrs / {patient.gender}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-semibold">{patient.phone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Village</p>
                <p className="text-sm font-semibold">{patient.village}, {patient.district}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="timeline">
        <TabsList className="mb-6 no-print">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="soap">SOAP Notes ({patientSOAPs.length})</TabsTrigger>
          <TabsTrigger value="consultations">Consultations ({patientConsultations.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions ({patientPrescriptions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline">
          {/* Split view: Timeline left, Detail panel right */}
          <div className="flex gap-5">
            <div className="w-[28%] flex-shrink-0">
              <Card>
                <CardContent className="py-4">
                  <VisitTimeline
                    visits={visits}
                    selectedId={selectedVisit?.id || null}
                    onSelect={setSelectedVisit}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="flex-1">
              <Card className="sticky top-4">
                <CardContent className="py-5">
                  <VisitDetailPanel visit={selectedVisit} />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="soap">
          <div className="space-y-4">
            {patientSOAPs.map(soap => (
              <Card key={soap.id} className="avoid-break">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">SOAP Note</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(soap.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{soap.status}</Badge>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-accent">Subjective</p>
                      <p className="text-muted-foreground">{soap.subjective}</p>
                    </div>
                    <div>
                      <p className="font-medium text-accent">Assessment</p>
                      <p className="text-muted-foreground">{soap.assessment}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {patientSOAPs.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No SOAP notes found.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="consultations">
          <div className="space-y-4">
            {patientConsultations.map(c => (
              <Card key={c.id} className="avoid-break">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Consultation with {getDoctorName(c.doctorId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className="bg-stat-green text-stat-green-text">{c.status}</Badge>
                  </div>
                  <Separator className="my-3" />
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">Chief Complaint:</span> {c.chiefComplaint}</p>
                    <p><span className="font-medium">Diagnosis:</span> {c.diagnosis.join(', ')}</p>
                    {c.labTests && c.labTests.length > 0 && (
                      <p><span className="font-medium">Lab Tests:</span> {c.labTests.join(', ')}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {patientConsultations.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No consultations found.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions">
          <div className="space-y-4">
            {patientPrescriptions.map(p => (
              <Card key={p.id} className="avoid-break">
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium">Prescription by {getDoctorName(p.doctorId)}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={p.status === 'dispensed' ? 'bg-stat-green text-stat-green-text' : 'bg-stat-orange text-stat-orange-text'}>
                      {p.status}
                    </Badge>
                  </div>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-muted">
                        <tr>
                          <th className="p-2 text-left">Medicine</th>
                          <th className="p-2 text-center">Dosage</th>
                          <th className="p-2 text-center">Qty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {p.items.map((item, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">{item.medicineName}</td>
                            <td className="p-2 text-center">{item.morning}-{item.afternoon}-{item.night}</td>
                            <td className="p-2 text-center">{item.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ))}
            {patientPrescriptions.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No prescriptions found.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
