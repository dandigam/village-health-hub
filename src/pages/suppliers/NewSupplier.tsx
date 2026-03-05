import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Truck, Pill, Search, X, MapPin } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { PatientStepper } from '@/components/patients/PatientStepper';
import { DeleteConfirmDialog } from '@/components/stock/DeleteConfirmDialog';
import { toast } from '@/hooks/use-toast';
import { api } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { useStatesHierarchy, useWarehouseInventory } from '@/hooks/useApiData';

const MEDICINE_TYPES = ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Powder', 'Inhaler', 'Ointment'];

interface MedicineEntry {
  id?: number;
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
  const warehouseId = authUser?.context?.warehouseId;
  const { data: inventoryItems = [] } = useWarehouseInventory(warehouseId ? Number(warehouseId) : undefined);
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

  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return inventoryItems
      .filter(item =>
        (item.medicineName?.toLowerCase().includes(q) || item.medicineType?.toLowerCase().includes(q)) &&
        !medicinesList.some(m => m.name.toLowerCase() === item.medicineName?.toLowerCase() && m.type.toLowerCase() === (item.medicineType?.toLowerCase() || ''))
      )
      .slice(0, 10);
  }, [searchQuery, inventoryItems, medicinesList]);

  const addFromSearch = (item: typeof inventoryItems[0]) => {
    setMedicinesList(prev => [...prev, { name: item.medicineName, type: item.medicineType || '' }]);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidContact = (contact: string) => /^\d{10}$/.test(contact);
  const isValidPinCode = (pinCode: string) => /^\d{6}$/.test(pinCode);

  const handleContactChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '').slice(0, 10);
    setContact(digitsOnly);
  };

  const handlePinCodeChange = (value: string) => {
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
    if (isEditMode && medicine.id && supplierId) {
      const warehouseId = authUser?.context?.warehouseId;
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
      setMedicinesList(prev => prev.filter((_, i) => i !== index));
    }
    setDeleteMedicineIndex(null);
  };

  const handleDeleteMedicineClick = (index: number) => {
    const medicine = medicinesList[index];
    if (medicine.id) {
      setDeleteMedicineIndex(index);
    } else {
      setMedicinesList(prev => prev.filter((_, i) => i !== index));
    }
  };

  useEffect(() => {
    if (isEditMode && supplierFromState) {
      const data = supplierFromState;
      setName(data.name || '');
      setContact(data.contact || '');
      setEmail(data.email || '');
      setStateId(data.stateId ? String(data.stateId) : '');
      setDistrictId(data.districtId ? String(data.districtId) : '');
      setMandalId(data.mandalId ? String(data.mandalId) : '');
      setAddress(data.address || '');
      setPinCode(data.pinCode || '');
      if (data.medicines && Array.isArray(data.medicines)) {
        setMedicinesList(data.medicines.map((m: any) => ({ id: m.id, name: m.name, type: m.type })));
      }
    }
  }, [isEditMode, supplierFromState]);

  const canProceed = name.trim() && contact.trim() && isValidContact(contact) && email.trim() && isValidEmail(email) && stateId && districtId && address.trim() && pinCode.trim() && isValidPinCode(pinCode);
  const canSubmit = canProceed;

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
      const warehouseId = authUser?.context?.warehouseId;
      if (!warehouseId) {
        toast({ title: "Error", description: "Warehouse not found", variant: "destructive" });
        return;
      }

      if (isEditMode && supplierId) {
        const newMedicines = medicinesList.filter(m => !m.id).map(m => ({ name: m.name, type: m.type }));
        const payload = {
          name, contact,
          stateId: Number(stateId), districtId: Number(districtId),
          mandalId: mandalId ? Number(mandalId) : null,
          address, pinCode, status: 'ACTIVE', email,
          medicines: newMedicines,
        };
        await api.put(`/suppliers/warehouse/${warehouseId}/supplier/${supplierId}`, payload);
        toast({ title: 'Supplier Updated', description: `${name} has been updated successfully.` });
      } else {
        const payload = {
          name, contact,
          stateId: Number(stateId), districtId: Number(districtId),
          mandalId: mandalId ? Number(mandalId) : null,
          address, pinCode, status: 'ACTIVE', email,
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
      {/* Compact single-row header */}
      <div className="flex items-center justify-between bg-card border rounded-lg px-4 py-2.5 mb-4">
        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/suppliers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 text-primary" />
            <h1 className="text-sm font-semibold">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h1>
          </div>
        </div>
        <div className="flex-1 max-w-[400px] mx-6">
          <PatientStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => navigate('/suppliers')}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {currentStep === 1 && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                <Truck className="h-3.5 w-3.5 text-primary" />
                Supplier Details
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Supplier Name <span className="text-destructive">*</span></Label>
                <Input className="h-9 text-sm" placeholder="e.g. MedPharma Distributors" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Contact Number <span className="text-destructive">*</span></Label>
                <Input className="h-9 text-sm" placeholder="e.g. 9876543210" value={contact} onChange={e => handleContactChange(e.target.value)} maxLength={10} />
                {contact && !isValidContact(contact) && <p className="text-[11px] text-destructive">Must be exactly 10 digits</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Email <span className="text-destructive">*</span></Label>
                <Input className="h-9 text-sm" type="email" placeholder="e.g. supplier@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                {email && !isValidEmail(email) && <p className="text-[11px] text-destructive">Enter a valid email address</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4 pb-4 space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground mb-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Location
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">State <span className="text-destructive">*</span></Label>
                  <Select value={stateId} onValueChange={v => { setStateId(v); setDistrictId(''); setMandalId(''); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {statesHierarchy.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">District <span className="text-destructive">*</span></Label>
                  <Select value={districtId} onValueChange={v => { setDistrictId(v); setMandalId(''); }} disabled={!stateId}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableDistricts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Mandal</Label>
                  <Select value={mandalId} onValueChange={setMandalId} disabled={!districtId}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select mandal" /></SelectTrigger>
                    <SelectContent className="bg-popover z-50">
                      {availableMandals.length > 0 ? (
                        availableMandals.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)
                      ) : (
                        <SelectItem value="__none" disabled>No mandals available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">PIN Code <span className="text-destructive">*</span></Label>
                  <Input className="h-9 text-sm" placeholder="e.g. 522001" value={pinCode} onChange={e => handlePinCodeChange(e.target.value)} maxLength={6} />
                  {pinCode && !isValidPinCode(pinCode) && <p className="text-[11px] text-destructive">Must be exactly 6 digits</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Address <span className="text-destructive">*</span></Label>
                <Input className="h-9 text-sm" placeholder="e.g. Industrial Area, Guntur" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card>
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Pill className="h-3.5 w-3.5 text-primary" />
              Medicines Supplied
              {medicinesList.length > 0 && (
                <Badge variant="secondary" className="text-[10px] h-5 px-1.5">{medicinesList.length}</Badge>
              )}
            </div>

            {/* Search existing medicines from warehouse inventory API */}
            <div className="relative">
              <Label className="text-xs mb-1.5 block">Search Existing Medicines</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by medicine name or type..."
                  className="pl-8 h-9 text-sm"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
              </div>
              {showSearchResults && searchQuery.trim() && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 border rounded-lg bg-popover shadow-lg max-h-48 overflow-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors text-left border-b last:border-b-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addFromSearch(item)}
                      >
                        <div>
                          <p className="text-sm font-medium">{item.medicineName}</p>
                          <p className="text-xs text-muted-foreground">{item.medicineType}</p>
                        </div>
                        <Plus className="h-3.5 w-3.5 text-primary shrink-0" />
                      </button>
                    ))
                  ) : (
                    <div className="px-3 py-3 text-center text-xs text-muted-foreground">
                      No matching medicines found in inventory
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-[11px] text-muted-foreground px-2">or add manually</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Manual medicine entry */}
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs">Medicine Name</Label>
                <Input className="h-9 text-sm" placeholder="Enter medicine name" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
              </div>
              <div className="w-36 space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={medicineType} onValueChange={setMedicineType}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-9 px-3" onClick={addMedicine} disabled={!medicineName.trim() || !medicineType}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Add
              </Button>
            </div>

            {/* Medicines table */}
            {medicinesList.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">#</th>
                      <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">Medicine Name</th>
                      <th className="text-left px-3 py-2 font-medium text-xs text-muted-foreground">Type</th>
                      <th className="text-center px-3 py-2 font-medium text-xs text-muted-foreground w-14"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {medicinesList.map((m, i) => (
                      <tr key={i} className="border-b last:border-b-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                        <td className="px-3 py-2 font-medium text-sm">{m.name}</td>
                        <td className="px-3 py-2 text-sm">
                          <Badge variant="outline" className="text-[11px] font-normal">{m.type}</Badge>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteMedicineClick(i)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border rounded-lg border-dashed p-6 text-center text-muted-foreground text-xs">
                No medicines added yet. Search from inventory or add manually above.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-2 mt-4">
        {currentStep === 1 && (
          <>
            <Button variant="outline" size="sm" onClick={() => navigate('/suppliers')}>Cancel</Button>
            <Button size="sm" onClick={() => setCurrentStep(2)} disabled={!canProceed}>Next</Button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>Back</Button>
            <Button size="sm" onClick={handleSubmit} disabled={!canSubmit}>
              {isEditMode ? 'Update Supplier' : 'Add Supplier'}
            </Button>
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
