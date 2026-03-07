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
      {/* Premium Header */}
      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl shadow-sm px-5 py-3 mb-5">
        <div className="flex items-center gap-3 shrink-0">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9 rounded-full text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all" 
            onClick={() => navigate('/suppliers')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Truck className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-base font-semibold text-slate-800">{isEditMode ? 'Edit Supplier' : 'Add New Supplier'}</h1>
          </div>
        </div>
        <div className="flex-1 max-w-[420px] mx-8">
          <PatientStepper steps={STEPS} currentStep={currentStep} onStepClick={setCurrentStep} />
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" 
          onClick={() => navigate('/suppliers')}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {currentStep === 1 && (
        <div className="grid lg:grid-cols-2 gap-5">
          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Truck className="h-3.5 w-3.5 text-blue-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">Supplier Details</span>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Supplier Name <span className="text-red-500">*</span></Label>
                <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. MedPharma Distributors" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Contact Number <span className="text-red-500">*</span></Label>
                <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 9876543210" value={contact} onChange={e => handleContactChange(e.target.value)} maxLength={10} />
                {contact && !isValidContact(contact) && <p className="text-[11px] text-red-500 mt-1">Must be exactly 10 digits</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email <span className="text-red-500">*</span></Label>
                <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" type="email" placeholder="e.g. supplier@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                {email && !isValidEmail(email) && <p className="text-[11px] text-red-500 mt-1">Enter a valid email address</p>}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-5 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">Location</span>
              </div>
            </div>
            <CardContent className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">State <span className="text-red-500">*</span></Label>
                  <Select value={stateId} onValueChange={v => { setStateId(v); setDistrictId(''); setMandalId(''); }}>
                    <SelectTrigger className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent className="bg-white z-50 shadow-lg border-slate-200">
                      {statesHierarchy.map(s => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">District <span className="text-red-500">*</span></Label>
                  <Select value={districtId} onValueChange={v => { setDistrictId(v); setMandalId(''); }} disabled={!stateId}>
                    <SelectTrigger className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Select district" /></SelectTrigger>
                    <SelectContent className="bg-white z-50 shadow-lg border-slate-200">
                      {availableDistricts.map(d => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Mandal</Label>
                  <Select value={mandalId} onValueChange={setMandalId} disabled={!districtId}>
                    <SelectTrigger className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Select mandal" /></SelectTrigger>
                    <SelectContent className="bg-white z-50 shadow-lg border-slate-200">
                      {availableMandals.length > 0 ? (
                        availableMandals.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)
                      ) : (
                        <SelectItem value="__none" disabled>No mandals available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">PIN Code <span className="text-red-500">*</span></Label>
                  <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. 522001" value={pinCode} onChange={e => handlePinCodeChange(e.target.value)} maxLength={6} />
                  {pinCode && !isValidPinCode(pinCode) && <p className="text-[11px] text-red-500 mt-1">Must be exactly 6 digits</p>}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Address <span className="text-red-500">*</span></Label>
                <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" placeholder="e.g. Industrial Area, Guntur" value={address} onChange={e => setAddress(e.target.value)} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {currentStep === 2 && (
        <Card className="border-0 shadow-sm rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-5 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-purple-100 flex items-center justify-center">
                <Pill className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <span className="text-sm font-semibold text-slate-800">Medicines Supplied</span>
              {medicinesList.length > 0 && (
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{medicinesList.length}</span>
              )}
            </div>
          </div>
          <CardContent className="p-5 space-y-5">
            {/* Search existing medicines from warehouse inventory API */}
            <div className="relative">
              <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 block">Search Existing Medicines</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by medicine name or type..."
                  className="pl-10 h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSearchResults(true); }}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                />
              </div>
              {showSearchResults && searchQuery.trim() && (
                <div className="absolute z-20 top-full left-0 right-0 mt-1 border border-slate-200 rounded-xl bg-white shadow-xl max-h-52 overflow-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-blue-50/50 cursor-pointer transition-colors text-left border-b border-slate-100 last:border-b-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => addFromSearch(item)}
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.medicineName}</p>
                          <p className="text-xs text-slate-500">{item.medicineType}</p>
                        </div>
                        <div className="h-7 w-7 rounded-full bg-blue-100 flex items-center justify-center">
                          <Plus className="h-3.5 w-3.5 text-blue-600" />
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-4 text-center text-sm text-slate-400">
                      No matching medicines found in inventory
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="relative flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs font-medium text-slate-400 px-3">or add manually</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Manual medicine entry */}
            <div className="flex items-end gap-3">
              <div className="flex-1 space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Medicine Name</Label>
                <Input className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20" placeholder="Enter medicine name" value={medicineName} onChange={e => setMedicineName(e.target.value)} />
              </div>
              <div className="w-40 space-y-1.5">
                <Label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Type</Label>
                <Select value={medicineType} onValueChange={setMedicineType}>
                  <SelectTrigger className="h-10 bg-white border-slate-300 text-sm rounded-lg focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent className="bg-white z-50 shadow-lg border-slate-200">
                    {MEDICINE_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="h-10 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-md shadow-blue-500/25 rounded-lg transition-all" 
                onClick={addMedicine} 
                disabled={!medicineName.trim() || !medicineType}
              >
                <Plus className="h-4 w-4 mr-1.5" /> Add
              </Button>
            </div>

            {/* Medicines table */}
            {medicinesList.length > 0 ? (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-50 to-blue-50/30">
                      <th className="text-left px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider">#</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider">Medicine Name</th>
                      <th className="text-left px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider">Type</th>
                      <th className="text-center px-4 py-3 font-semibold text-xs text-slate-600 uppercase tracking-wider w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {medicinesList.map((m, i) => {
                      // Color-coded badge by type
                      const typeColors: Record<string, string> = {
                        'Tablet': 'bg-blue-50 text-blue-700 border-blue-200',
                        'Capsule': 'bg-amber-50 text-amber-700 border-amber-200',
                        'Syrup': 'bg-emerald-50 text-emerald-700 border-emerald-200',
                        'Injection': 'bg-purple-50 text-purple-700 border-purple-200',
                        'Cream': 'bg-pink-50 text-pink-700 border-pink-200',
                        'Drops': 'bg-cyan-50 text-cyan-700 border-cyan-200',
                        'Powder': 'bg-orange-50 text-orange-700 border-orange-200',
                        'Inhaler': 'bg-indigo-50 text-indigo-700 border-indigo-200',
                        'Ointment': 'bg-teal-50 text-teal-700 border-teal-200',
                      };
                      const badgeClass = typeColors[m.type] || 'bg-slate-50 text-slate-700 border-slate-200';
                      return (
                        <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-4 py-3 text-sm text-blue-600 font-medium">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{m.name}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full border ${badgeClass}`}>{m.type}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all" 
                              onClick={() => handleDeleteMedicineClick(i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Pill className="h-6 w-6 text-slate-400" />
                </div>
                <p className="text-slate-500 text-sm">No medicines added yet</p>
                <p className="text-slate-400 text-xs mt-1">Search from inventory or add manually above</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-3 mt-5">
        {currentStep === 1 && (
          <>
            <Button 
              variant="outline" 
              className="h-10 px-5 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg font-medium" 
              onClick={() => navigate('/suppliers')}
            >
              Cancel
            </Button>
            <Button 
              className="h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 rounded-lg transition-all" 
              onClick={() => setCurrentStep(2)} 
              disabled={!canProceed}
            >
              Next
            </Button>
          </>
        )}
        {currentStep === 2 && (
          <>
            <Button 
              variant="outline" 
              className="h-10 px-5 border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg font-medium" 
              onClick={() => setCurrentStep(1)}
            >
              Back
            </Button>
            <Button 
              className="h-10 px-5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium shadow-lg shadow-blue-500/25 rounded-lg transition-all" 
              onClick={handleSubmit} 
              disabled={!canSubmit}
            >
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
