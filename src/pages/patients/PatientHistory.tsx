import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, FileText, Stethoscope, Pill, DollarSign, Calendar, Printer } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { mockPatients, mockSOAPNotes, mockConsultations, mockPrescriptions, mockPayments, mockDoctors } from '@/data/mockData';

export default function PatientHistory() {
  const { id } = useParams();
  const navigate = useNavigate();

  const patient = mockPatients.find(p => p.id === id);
  const patientSOAPs = mockSOAPNotes.filter(s => s.patientId === id);
  const patientConsultations = mockConsultations.filter(c => c.patientId === id);
  const patientPrescriptions = mockPrescriptions.filter(p => p.patientId === id);
  const patientPayments = mockPayments.filter(p => p.patientId === id);

  const getDoctorName = (doctorId: string) => {
    return mockDoctors.find(d => d.id === doctorId)?.name || 'Unknown';
  };

  const handlePrint = () => {
    window.print();
  };

  if (!patient) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient not found</p>
          <Button className="mt-4" onClick={() => navigate('/patients')}>
            Back to Patients
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Build timeline of all events
  const timeline = [
    ...patientSOAPs.map(s => ({
      type: 'soap',
      date: s.createdAt,
      title: 'SOAP Note Created',
      description: s.subjective.substring(0, 100) + '...',
      status: s.status,
      data: s,
    })),
    ...patientConsultations.map(c => ({
      type: 'consultation',
      date: c.createdAt,
      title: 'Doctor Consultation',
      description: `Diagnosis: ${c.diagnosis.join(', ')}`,
      status: c.status,
      data: c,
    })),
    ...patientPrescriptions.map(p => ({
      type: 'prescription',
      date: p.createdAt,
      title: 'Prescription',
      description: `${p.items.length} medicines prescribed`,
      status: p.status,
      data: p,
    })),
    ...patientPayments.map(p => ({
      type: 'payment',
      date: p.createdAt,
      title: 'Payment',
      description: `₹${p.paidAmount} / ₹${p.totalAmount}`,
      status: p.status,
      data: p,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getTimelineIcon = (type: string) => {
    switch (type) {
      case 'soap': return <FileText className="h-4 w-4" />;
      case 'consultation': return <Stethoscope className="h-4 w-4" />;
      case 'prescription': return <Pill className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const getTimelineColor = (type: string) => {
    switch (type) {
      case 'soap': return 'bg-stat-blue text-stat-blue-text';
      case 'consultation': return 'bg-stat-green text-stat-green-text';
      case 'prescription': return 'bg-stat-purple text-stat-purple-text';
      case 'payment': return 'bg-stat-orange text-stat-orange-text';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header no-print">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/patients')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Patient History</h1>
            <p className="text-muted-foreground">{patient.patientId}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={() => navigate('/soap/new')}>
            <FileText className="mr-2 h-4 w-4" />
            New SOAP Note
          </Button>
        </div>
      </div>

      {/* Print Header - Only visible when printing */}
      <div className="hidden print:block mb-6 soap-print-header">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold">Srini FOUNDATION</h1>
          <p className="text-sm text-muted-foreground">Medical Camp - Patient History Report</p>
        </div>
        <div className="text-sm">
          <p><strong>Generated on:</strong> {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Patient Info Card */}
      <Card className="mb-6">
        <CardContent className="py-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
              <User className="h-10 w-10 text-accent" />
            </div>
            <div className="flex-1 grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-semibold">{patient.name} {patient.surname}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Age / Gender</p>
                <p className="font-semibold">{patient.age} yrs / {patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-semibold">{patient.phone}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Village</p>
                <p className="font-semibold">{patient.village}, {patient.district}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Timeline */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="timeline">
            <TabsList className="mb-6 no-print">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="soap">SOAP Notes ({patientSOAPs.length})</TabsTrigger>
              <TabsTrigger value="consultations">Consultations ({patientConsultations.length})</TabsTrigger>
              <TabsTrigger value="prescriptions">Prescriptions ({patientPrescriptions.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline">
              <Card>
                <CardHeader>
                  <CardTitle>Visit History</CardTitle>
                </CardHeader>
                <CardContent>
                  {timeline.length > 0 ? (
                    <div className="space-y-4">
                      {timeline.map((item, index) => (
                        <div key={index} className="flex gap-4 avoid-break">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTimelineColor(item.type)}`}>
                            {getTimelineIcon(item.type)}
                          </div>
                          <div className="flex-1 pb-4 border-b last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">{item.title}</p>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">
                                  {new Date(item.date).toLocaleDateString()}
                                </p>
                                <Badge variant="outline" className="mt-1">{item.status}</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      No history found for this patient.
                    </p>
                  )}
                </CardContent>
              </Card>
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
        </div>

        {/* Right - Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Visit Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Visits</span>
                <span className="font-semibold">{patientSOAPs.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Consultations</span>
                <span className="font-semibold">{patientConsultations.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Prescriptions</span>
                <span className="font-semibold">{patientPrescriptions.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Paid</span>
                <span className="font-semibold text-stat-green-text">
                  ₹{patientPayments.reduce((sum, p) => sum + p.paidAmount, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pending</span>
                <span className="font-semibold text-destructive">
                  ₹{patientPayments.reduce((sum, p) => sum + p.pendingAmount, 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Registration Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Registered On</span>
                <span>{new Date(patient.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Father's Name</span>
                <span>{patient.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span>{patient.address}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
