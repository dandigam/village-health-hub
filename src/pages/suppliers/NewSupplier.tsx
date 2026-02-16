import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Truck, Pill } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientStepper } from '@/components/patients/PatientStepper';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment'];

const AP_STATES = ['Andhra Pradesh', 'Telangana', 'Tamil Nadu', 'Karnataka', 'Kerala', 'Maharashtra', 'Odisha'];

const DISTRICTS: Record<string, string[]> = {
  'Andhra Pradesh': ['Guntur', 'Krishna', 'Prakasam', 'Nellore', 'Kurnool', 'Anantapur', 'Chittoor', 'Kadapa', 'Visakhapatnam', 'East Godavari', 'West Godavari', 'Srikakulam', 'Vizianagaram'],
  'Telangana': ['Hyderabad', 'Rangareddy', 'Warangal', 'Karimnagar', 'Nizamabad', 'Khammam', 'Medak', 'Nalgonda'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Salem', 'Tiruchirappalli', 'Tirunelveli'],
  'Karnataka': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru', 'Belagavi'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Puri', 'Berhampur'],
};

const MANDALS: Record<string, string[]> = {
  'Guntur': ['Bapatla', 'Tenali', 'Mangalagiri', 'Ponnur', 'Sattenapalli', 'Narasaraopet', 'Macherla', 'Vinukonda', 'Piduguralla', 'Repalle'],
  'Krishna': ['Vijayawada', 'Machilipatnam', 'Gudivada', 'Nuzvid', 'Jaggaiahpet', 'Nandigama'],
  'Prakasam': ['Ongole', 'Markapur', 'Chirala', 'Kanigiri', 'Darsi'],
  'Hyderabad': ['Secunderabad', 'Charminar', 'Ameerpet', 'Kukatpally', 'Begumpet'],
};

interface MedicineEntry {
  name: string;
  type: string;
}

const STEPS = [
  { id: 1, title: 'Supplier Details' },
  { id: 2, title: 'Supplied Medicine' },
];

export default function NewSupplier() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [medicinesList, setMedicinesList] = useState<MedicineEntry[]>([]);

  const addMedicine = () => {
    if (!medicineName.trim() || !medicineType) return;
    setMedicinesList(prev => [...prev, { name: medicineName.trim(), type: medicineType }]);
    setMedicineName('');
    setMedicineType('');
  };

  const removeMedicine = (index: number) => {
    setMedicinesList(prev => prev.filter((_, i) => i !== index));
  };

  const canProceed = name.trim() && contact.trim() && state && district && city.trim() && pinCode.trim();
  const canSubmit = canProceed;

  const handleSubmit = async () => {
    const location = [city, mandal, district, state, pinCode].filter(Boolean).join(', ');
    const payload = {
      name, contact, address: location, state, district, mandal, city, pinCode,
      medicines: medicinesList, status: 'active',
    };
    await api.post('/suppliers', payload);
    toast({ title: 'Supplier Added', description: `${name} has been added successfully.` });
    navigate('/suppliers');
  };

  const availableDistricts = DISTRICTS[state] || [];
  const availableMandals = MANDALS[district] || [];

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">Add New Supplier</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Fill in the supplier details and assign medicines</p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="py-4">
          <PatientStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />
        </CardContent>
      </Card>

      {currentStep === 1 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Left Card: Supplier Details */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                Supplier Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label>Supplier Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. MedPharma Distributors" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Number <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. 9876543210" value={contact} onChange={e => setContact(e.target.value)} />
              </div>
            </CardContent>
          </Card>

          {/* Right Card: Location */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State <span className="text-destructive">*</span></Label>
                  <Select value={state} onValueChange={v => { setState(v); setDistrict(''); setMandal(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {AP_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District <span className="text-destructive">*</span></Label>
                  <Select value={district} onValueChange={v => { setDistrict(v); setMandal(''); }} disabled={!state}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableDistricts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mandal</Label>
                  <Select value={mandal} onValueChange={setMandal} disabled={!district}>
                    <SelectTrigger><SelectValue placeholder="Select mandal" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableMandals.length > 0 ? (
                        availableMandals.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)
                      ) : (
                        <SelectItem value="__none" disabled>No mandals available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Guntur" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>

              <div className="max-w-[200px] space-y-2">
                <Label>PIN Code <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. 522001" value={pinCode} onChange={e => setPinCode(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4 text-primary" />
              Medicines Supplied
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-2">
                <Label>Medicine Name</Label>
                <Input placeholder="Enter medicine name" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
              </div>
              <div className="w-40 space-y-2">
                <Label>Type</Label>
                <Select value={medicineType} onValueChange={setMedicineType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="icon" onClick={addMedicine} disabled={!medicineName.trim() || !medicineType} className="shrink-0">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {medicinesList.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left p-3 font-medium">Medicine Name</th>
                      <th className="text-left p-3 font-medium">Type</th>
                      <th className="text-center p-3 font-medium w-16">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicinesList.map((m, i) => (
                      <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30">
                        <td className="p-3 font-medium">{m.name}</td>
                        <td className="p-3">{m.type}</td>
                        <td className="p-3 text-center">
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => removeMedicine(i)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border rounded-lg p-8 text-center text-muted-foreground text-sm">
                No medicines added yet. Add medicines supplied by this supplier.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex justify-end gap-3 mt-6">
        {currentStep === 1 && (
          <>
            <Button variant="outline" onClick={() => navigate('/suppliers')}>Cancel</Button>
            <Button onClick={() => setCurrentStep(2)} disabled={!canProceed}>Next</Button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <Button variant="outline" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button onClick={handleSubmit} disabled={!canSubmit}>Add Supplier</Button>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
