import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Truck, MapPin, Pill } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment'];

interface MedicineEntry {
  name: string;
  type: string;
}

const steps = [
  { id: 1, label: 'Supplier Details', icon: Truck },
  { id: 2, label: 'Location', icon: MapPin },
  { id: 3, label: 'Medicines', icon: Pill },
];

export default function NewSupplier() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Step 1
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [address, setAddress] = useState('');

  // Step 2 - Location
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [mandal, setMandal] = useState('');
  const [city, setCity] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Step 3 - Medicines
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

  const canGoNext = () => {
    if (step === 1) return name.trim() && contact.trim() && address.trim();
    if (step === 2) return state.trim() && district.trim() && city.trim() && pinCode.trim();
    return true;
  };

  const handleSubmit = async () => {
    const fullAddress = [address, city, mandal, district, state, pinCode].filter(Boolean).join(', ');
    const payload = {
      name,
      contact,
      address: fullAddress,
      state,
      district,
      mandal,
      city,
      pinCode,
      medicines: medicinesList,
      status: 'active',
    };

    await api.post('/suppliers', payload);
    toast({ title: 'Supplier Added', description: `${name} has been added successfully.` });
    navigate('/suppliers');
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="page-title">Add New Supplier</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { if (s.id < step) setStep(s.id); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors w-full
                ${step === s.id ? 'bg-primary text-primary-foreground shadow-sm' : step > s.id ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
            >
              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
                ${step === s.id ? 'bg-primary-foreground/20' : step > s.id ? 'bg-primary/20' : 'bg-muted-foreground/20'}`}>
                {s.id}
              </span>
              <s.icon className="h-4 w-4 shrink-0" />
              <span className="hidden sm:inline truncate">{s.label}</span>
            </button>
            {i < steps.length - 1 && <div className={`h-px flex-shrink-0 w-8 ${step > s.id ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        ))}
      </div>

      <Card className="max-w-2xl">
        <CardContent className="pt-6">
          {/* Step 1: Supplier Details */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label>Supplier Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. MedPharma Distributors" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Contact Number <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. 9876543210" value={contact} onChange={e => setContact(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Address <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Industrial Area, Guntur" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>State <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Andhra Pradesh" value={state} onChange={e => setState(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>District <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Guntur" value={district} onChange={e => setDistrict(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mandal</Label>
                  <Input placeholder="e.g. Bapatla" value={mandal} onChange={e => setMandal(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Guntur" value={city} onChange={e => setCity(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2 max-w-[200px]">
                <Label>PIN Code <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. 522001" value={pinCode} onChange={e => setPinCode(e.target.value)} />
              </div>
            </div>
          )}

          {/* Step 3: Medicines */}
          {step === 3 && (
            <div className="space-y-5">
              <div className="flex items-end gap-3">
                <div className="flex-1 space-y-2">
                  <Label>Medicine Name</Label>
                  <Input placeholder="Enter medicine name" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
                </div>
                <div className="w-40 space-y-2">
                  <Label>Type</Label>
                  <Select value={medicineType} onValueChange={setMedicineType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
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
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={() => step === 1 ? navigate('/suppliers') : setStep(step - 1)}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            {step < 3 ? (
              <Button onClick={() => setStep(step + 1)} disabled={!canGoNext()}>Next</Button>
            ) : (
              <Button onClick={handleSubmit}>Add Supplier</Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
