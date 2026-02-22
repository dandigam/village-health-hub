import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Truck, Pill } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PatientStepper } from '@/components/patients/PatientStepper';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useStatesHierarchy } from '@/hooks/useApiData';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment'];

interface MedicineEntry {
  id?: number; // Present for existing medicines, undefined for new ones
  name: string;
  type: string;
}

const STEPS = [
  { id: 1, title: 'Supplier Details' },
  { id: 2, title: 'Supplied Medicine' },
];

export default function NewSupplier() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { id: supplierId } = useParams<{ id: string }>();
  const isEditMode = Boolean(supplierId);
  const supplierFromState = location.state?.supplier;
  const { data: statesHierarchy = [] } = useStatesHierarchy();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [stateId, setStateId] = useState('');
  const [districtId, setDistrictId] = useState('');
  const [mandalId, setMandalId] = useState('');
  const [address, setAddress] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [medicineName, setMedicineName] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [medicinesList, setMedicinesList] = useState<MedicineEntry[]>([]);
  const [deleteMedicineIndex, setDeleteMedicineIndex] = useState<number | null>(null);

  // Validation helpers
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidContact = (contact: string) => /^\d{10}$/.test(contact);
  const isValidPinCode = (pinCode: string) => /^\d{6}$/.test(pinCode);

  const handleContactChange = (value: string) => {
    // Only allow digits and max 10 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setContact(digitsOnly);
  };

  const handlePinCodeChange = (value: string) => {
    // Only allow digits and max 6 characters
    const digitsOnly = value.replace(/\D/g, '').slice(0, 6);
    setPinCode(digitsOnly);
  };

  const addMedicine = () => {
    if (!medicineName.trim() || !medicineType) return;
    setMedicinesList(prev => [...prev, { name: medicineName.trim(), type: medicineType }]);
    setMedicineName('');
    setMedicineType('');
  };

  const removeMedicine = async (index: number) => {
    const medicine = medicinesList[index];
    
    // If in edit mode and medicine has an ID, call delete API
    if (isEditMode && medicine.id && supplierId) {
      const warehouseId = authUser?.wareHouse?.id;
      if (!warehouseId) {
        toast({ title: 'Error', description: 'Warehouse not found', variant: 'destructive' });
        return;
      }
      try {
        const result = await api.delete(`/suppliers/warehouse/${warehouseId}/supplier/${supplierId}/medicine/${medicine.id}`);
        if (result === null) throw new Error('Failed to delete medicine');
        toast({ title: 'Medicine Removed', description: `${medicine.name} has been removed.` });
        setMedicinesList(prev => prev.filter((_, i) => i !== index));
      } catch (error: any) {
        toast({ title: 'Error', description: error.message || 'Failed to delete medicine', variant: 'destructive' });
      }
    } else {
      // For new medicines (not yet saved), just remove from local state
      setMedicinesList(prev => prev.filter((_, i) => i !== index));
    }
    setDeleteMedicineIndex(null);
  };

  const handleDeleteMedicineClick = (index: number) => {
    const medicine = medicinesList[index];
    // If existing medicine (has ID), show confirmation
    if (medicine.id) {
      setDeleteMedicineIndex(index);
    } else {
      // New medicine, just remove directly
      setMedicinesList(prev => prev.filter((_, i) => i !== index));
    }
  };

  // Load supplier data from navigation state when in edit mode
  useEffect(() => {
    if (isEditMode && supplierFromState) {
      const data = supplierFromState;
      console.log('Supplier data from state:', data);
      setName(data.name || '');
      setContact(data.contact || '');
      setEmail(data.email || '');
      setStateId(data.stateId ? String(data.stateId) : '');
      setDistrictId(data.districtId ? String(data.districtId) : '');
      setMandalId(data.mandalId ? String(data.mandalId) : '');
      setAddress(data.address || '');
      setPinCode(data.pinCode || '');
      if (data.medicines && Array.isArray(data.medicines)) {
        console.log('Medicines loaded:', data.medicines);
        setMedicinesList(data.medicines.map((m: any) => ({ id: m.id, name: m.name, type: m.type })));
      }
    }
  }, [isEditMode, supplierFromState]);

  const canProceed = name.trim() && contact.trim() && isValidContact(contact) && email.trim() && isValidEmail(email) && stateId && districtId && address.trim() && pinCode.trim() && isValidPinCode(pinCode);
  const canSubmit = canProceed;

  // Derive available districts and mandals from API data
  const availableDistricts = useMemo(() => {
    const selectedState = statesHierarchy.find(s => String(s.id) === stateId);
    return selectedState?.districts ?? [];
  }, [statesHierarchy, stateId]);

  const availableMandals = useMemo(() => {
    const selectedDistrict = availableDistricts.find(d => String(d.id) === districtId);
    return selectedDistrict?.mandals ?? [];
  }, [availableDistricts, districtId]);

  const handleSubmit = async () => {
    try {
      const warehouseId = authUser?.wareHouse?.id;

      if (!warehouseId) {
        toast({
          title: "Error",
          description: "Warehouse not found",
          variant: "destructive",
        });
        return;
      }

      if (isEditMode && supplierId) {
        // For edit: send only NEW medicines (without ID)
        const newMedicines = medicinesList.filter(m => !m.id).map(m => ({ name: m.name, type: m.type }));
        const payload = {
          name,
          contact,
          stateId: Number(stateId),
          districtId: Number(districtId),
          mandalId: mandalId ? Number(mandalId) : null,
          address,
          pinCode,
          status: 'ACTIVE',
          email,
          medicines: newMedicines,
        };
        await api.put(`/suppliers/warehouse/${warehouseId}/supplier/${supplierId}`, payload);
        toast({ title: 'Supplier Updated', description: `${name} has been updated successfully.` });
      } else {
        // For new supplier: send all medicines
        const payload = {
          name,
          contact,
          stateId: Number(stateId),
          districtId: Number(districtId),
          mandalId: mandalId ? Number(mandalId) : null,
          address,
          pinCode,
          status: 'ACTIVE',
          email,
          medicines: medicinesList.map(m => ({ name: m.name, type: m.type })),
        };
        await api.post(`/suppliers/warehouse/${warehouseId}/with-medicines`, payload);
        toast({ title: 'Supplier Added', description: `${name} has been added successfully.` });
      }
      navigate('/suppliers');
    } catch (error) {
      toast({ title: 'Error', description: `Failed to ${isEditMode ? 'update' : 'add'} supplier. Please try again.`, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="page-title">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{isEditMode ? 'Update supplier details and medicines' : 'Fill in the supplier details and assign medicines'}</p>
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
                <Input 
                  placeholder="e.g. 9876543210" 
                  value={contact} 
                  onChange={e => handleContactChange(e.target.value)}
                  maxLength={10}
                />
                {contact && !isValidContact(contact) && (
                  <p className="text-xs text-destructive">Contact must be exactly 10 digits</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email <span className="text-destructive">*</span></Label>
                <Input 
                  type="email"
                  placeholder="e.g. supplier@example.com" 
                  value={email} 
                  onChange={e => setEmail(e.target.value)}
                />
                {email && !isValidEmail(email) && (
                  <p className="text-xs text-destructive">Please enter a valid email address</p>
                )}
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
                  <Select value={stateId} onValueChange={v => { setStateId(v); setDistrictId(''); setMandalId(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {statesHierarchy.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District <span className="text-destructive">*</span></Label>
                  <Select value={districtId} onValueChange={v => { setDistrictId(v); setMandalId(''); }} disabled={!stateId}>
                    <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableDistricts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Mandal</Label>
                  <Select value={mandalId} onValueChange={setMandalId} disabled={!districtId}>
                    <SelectTrigger><SelectValue placeholder="Select mandal" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableMandals.length > 0 ? (
                        availableMandals.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)
                      ) : (
                        <SelectItem value="__none" disabled>No mandals available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Address <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. Guntur" value={address} onChange={e => setAddress(e.target.value)} />
                </div>
              </div>

              <div className="max-w-[200px] space-y-2">
                <Label>PIN Code <span className="text-destructive">*</span></Label>
                <Input 
                  placeholder="e.g. 522001" 
                  value={pinCode} 
                  onChange={e => handlePinCodeChange(e.target.value)}
                  maxLength={6}
                />
                {pinCode && !isValidPinCode(pinCode) && (
                  <p className="text-xs text-destructive">PIN Code must be exactly 6 digits</p>
                )}
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
                          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => handleDeleteMedicineClick(i)}>
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
            <Button onClick={handleSubmit} disabled={!canSubmit}>{isEditMode ? 'Update Supplier' : 'Add Supplier'}</Button>
          </>
        )}
      </div>

      <DeleteConfirmDialog
        open={deleteMedicineIndex !== null}
        onOpenChange={(open) => !open && setDeleteMedicineIndex(null)}
        onConfirm={() => deleteMedicineIndex !== null && removeMedicine(deleteMedicineIndex)}
        title="Delete Medicine"
        description={`Are you sure you want to remove "${deleteMedicineIndex !== null ? medicinesList[deleteMedicineIndex]?.name : ''}"? This action cannot be undone.`}
      />
    </DashboardLayout>
  );
}
