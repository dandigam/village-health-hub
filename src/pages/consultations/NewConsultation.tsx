import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Plus, X, Pill, FlaskConical, Scissors } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockSOAPNotes, mockPatients, mockMedicines } from '@/data/mockData';

interface PrescriptionItem {
  medicineId: string;
  medicineName: string;
  quantity: number;
  morning: number;
  afternoon: number;
  night: number;
  days: number;
}

export default function NewConsultation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const soapId = searchParams.get('soapId');
  const patientId = searchParams.get('patientId');

  const soapNote = mockSOAPNotes.find(n => n.id === soapId);
  const patient = mockPatients.find(p => p.id === patientId);

  const [chiefComplaint, setChiefComplaint] = useState(soapNote?.subjective || '');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [diagnosis, setDiagnosis] = useState<string[]>([]);
  const [newDiagnosis, setNewDiagnosis] = useState('');
  const [labTests, setLabTests] = useState<string[]>([]);
  const [newLabTest, setNewLabTest] = useState('');
  const [suggestedOperations, setSuggestedOperations] = useState<string[]>([]);
  const [newOperation, setNewOperation] = useState('');
  const [notes, setNotes] = useState('');
  
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState('');

  const addDiagnosis = () => {
    if (newDiagnosis.trim()) {
      setDiagnosis([...diagnosis, newDiagnosis.trim()]);
      setNewDiagnosis('');
    }
  };

  const addLabTest = () => {
    if (newLabTest.trim()) {
      setLabTests([...labTests, newLabTest.trim()]);
      setNewLabTest('');
    }
  };

  const addOperation = () => {
    if (newOperation.trim()) {
      setSuggestedOperations([...suggestedOperations, newOperation.trim()]);
      setNewOperation('');
    }
  };

  const addMedicine = () => {
    if (selectedMedicine) {
      const medicine = mockMedicines.find(m => m.id === selectedMedicine);
      if (medicine && !prescriptionItems.find(p => p.medicineId === medicine.id)) {
        setPrescriptionItems([...prescriptionItems, {
          medicineId: medicine.id,
          medicineName: medicine.name,
          quantity: 0,
          morning: 0,
          afternoon: 0,
          night: 0,
          days: 5,
        }]);
      }
      setSelectedMedicine('');
    }
  };

  const updatePrescriptionItem = (index: number, field: keyof PrescriptionItem, value: number) => {
    const updated = [...prescriptionItems];
    updated[index] = { ...updated[index], [field]: value };
    // Auto-calculate quantity
    const item = updated[index];
    updated[index].quantity = (item.morning + item.afternoon + item.night) * item.days;
    setPrescriptionItems(updated);
  };

  const removePrescriptionItem = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    console.log('Saving consultation...');
    navigate('/consultations');
  };

  const handleSendToPharmacy = () => {
    console.log('Sending to pharmacy...');
    navigate('/consultations');
  };

  if (!patient || !soapNote) {
    return (
      <DashboardLayout campName="Bapatla">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Patient or SOAP Note not found</p>
          <Button className="mt-4" onClick={() => navigate('/consultations')}>
            Back to Consultations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout campName="Bapatla">
      <div className="page-header">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/consultations')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Doctor Consultation</h1>
            <p className="text-muted-foreground">
              {patient.name} {patient.surname} • {patient.patientId}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button className="bg-accent hover:bg-accent/90" onClick={handleSendToPharmacy}>
            <Send className="mr-2 h-4 w-4" />
            Complete & Send to Pharmacy
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - SOAP Summary & Patient Info */}
        <div className="space-y-6">
          {/* Patient Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{patient.name} {patient.surname}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Age / Gender</span>
                <span>{patient.age} yrs / {patient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Village</span>
                <span>{patient.village}</span>
              </div>
            </CardContent>
          </Card>

          {/* SOAP Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">SOAP Note Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-accent">Subjective</p>
                <p className="text-sm">{soapNote.subjective}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-accent">Vitals</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span>BP: {soapNote.objective.bp}</span>
                  <span>Pulse: {soapNote.objective.pulse}</span>
                  <span>Temp: {soapNote.objective.temp}°F</span>
                  <span>SpO2: {soapNote.objective.spo2}%</span>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium text-accent">Assessment</p>
                <p className="text-sm">{soapNote.assessment}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Consultation Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chief Complaint & History */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Complaints & History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Chief Complaint (Detailed)</Label>
                <Textarea
                  className="mt-2 min-h-[100px]"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  placeholder="Enter detailed patient complaints..."
                />
              </div>
              <div>
                <Label>Medical History</Label>
                <Textarea
                  className="mt-2 min-h-[80px]"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Enter past medical history, allergies, ongoing medications..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle>Diagnosis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder="Add diagnosis..."
                  value={newDiagnosis}
                  onChange={(e) => setNewDiagnosis(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addDiagnosis()}
                />
                <Button onClick={addDiagnosis} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {diagnosis.map((d, i) => (
                  <Badge key={i} variant="secondary" className="flex items-center gap-1">
                    {d}
                    <X className="h-3 w-3 cursor-pointer" onClick={() => setDiagnosis(diagnosis.filter((_, idx) => idx !== i))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lab Tests & Operations */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Lab Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add lab test..."
                    value={newLabTest}
                    onChange={(e) => setNewLabTest(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addLabTest()}
                  />
                  <Button onClick={addLabTest} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {labTests.map((t, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1">
                      {t}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setLabTests(labTests.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scissors className="h-5 w-5" />
                  Suggested Operations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Add operation..."
                    value={newOperation}
                    onChange={(e) => setNewOperation(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addOperation()}
                  />
                  <Button onClick={addOperation} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestedOperations.map((o, i) => (
                    <Badge key={i} variant="outline" className="flex items-center gap-1 bg-red-50 text-red-700 border-red-200">
                      {o}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSuggestedOperations(suggestedOperations.filter((_, idx) => idx !== i))} />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prescription */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pill className="h-5 w-5" />
                Prescription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Select value={selectedMedicine} onValueChange={setSelectedMedicine}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select medicine to add..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mockMedicines.map(m => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.name} - {m.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addMedicine}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {prescriptionItems.length > 0 && (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Medicine</th>
                        <th className="p-2 text-center w-16">M</th>
                        <th className="p-2 text-center w-16">A</th>
                        <th className="p-2 text-center w-16">N</th>
                        <th className="p-2 text-center w-20">Days</th>
                        <th className="p-2 text-center w-16">Qty</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {prescriptionItems.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2 font-medium">{item.medicineName}</td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center"
                              value={item.morning}
                              onChange={(e) => updatePrescriptionItem(index, 'morning', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center"
                              value={item.afternoon}
                              onChange={(e) => updatePrescriptionItem(index, 'afternoon', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="0"
                              max="3"
                              className="h-8 text-center"
                              value={item.night}
                              onChange={(e) => updatePrescriptionItem(index, 'night', parseInt(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              min="1"
                              className="h-8 text-center"
                              value={item.days}
                              onChange={(e) => updatePrescriptionItem(index, 'days', parseInt(e.target.value) || 1)}
                            />
                          </td>
                          <td className="p-2 text-center font-medium">{item.quantity}</td>
                          <td className="p-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500"
                              onClick={() => removePrescriptionItem(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                className="min-h-[80px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional notes or instructions for the patient..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
