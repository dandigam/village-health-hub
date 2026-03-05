import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStatesHierarchy } from '@/hooks/useApiData';
  const { data: statesHierarchy = [] } = useStatesHierarchy();
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, MapPin, Calendar, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { useCamps, useDoctors } from '@/hooks/useApiData';

interface FormErrors {
  name?: string;
  village?: string;
  district?: string;
  startDate?: string;
  endDate?: string;
}

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'active', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];

export default function EditCamp() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: allCamps = [] } = useCamps();
  const { data: allDoctors = [] } = useDoctors();
  const camp = allCamps.find((c) => String(c.id) === String(id));

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    location: '',
    village: '',
    city: '',
    state: '',
    stateId: 0 as number,
    district: '',
    districtId: 0 as number,
    mandal: '',
    mandalId: 0 as number,
    startDate: '',
    endDate: '',
    status: 'draft' as 'draft' | 'active' | 'closed',
    description: '',
    doctorIds: [] as string[],
    pharmacyIds: [] as string[],
    staffIds: [] as string[],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (camp) {
      setFormData({
        id: camp.id,
        name: camp.name || camp.campName || '',
        location: camp.location || '',
        village: camp.village || camp.city || '',
        city: camp.city || '',
        district: camp.district || '',
        startDate: camp.startDate || '',
        endDate: camp.endDate || '',
        status: camp.status,
        description: camp.description || '',
        doctorIds: camp.doctorIds ? [...camp.doctorIds] : [],
        pharmacyIds: camp.pharmacyIds || [],
        staffIds: camp.staffIds || [],
      });
    }
  }, [camp]);

  if (!camp) {
    return (<DashboardLayout><div className="text-center py-12"><p className="text-muted-foreground">Camp not found</p><Button className="mt-4" onClick={() => navigate('/camps')}>Back to Camps</Button></div></DashboardLayout>);
  }

  const updateFormData = <T extends keyof typeof formData>(field: T, value: typeof formData[T]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleDoctor = (doctorId: string) => {
    if (formData.doctorIds && formData.doctorIds.includes(doctorId)) {
      updateFormData('doctorIds', formData.doctorIds.filter((id) => id !== doctorId));
    } else {
      updateFormData('doctorIds', [...(formData.doctorIds || []), doctorId]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Camp name is required';
    if (!formData.village.trim()) newErrors.village = 'Village is required';
    if (!formData.district.trim()) newErrors.district = 'District is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) newErrors.endDate = 'End date must be after start date';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) { toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' }); return; }
    // Call update API with id
    // Example: updateCamp.mutateAsync(formData)
    toast({ title: 'Camp Updated Successfully!', description: `${formData.name} has been updated.` });
    navigate('/camps');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Edit Camp</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/camps')}><X className="h-4 w-4 mr-1" />Cancel</Button>
            <Button size="sm" onClick={handleSubmit} className="bg-accent hover:bg-accent/90"><Save className="h-4 w-4 mr-1" />Update Camp</Button>
          </div>
        </div>

        <div className="flex gap-4">
          <Card className="flex-1 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30"><CardTitle className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" />Camp Information</CardTitle></CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium">Camp Name <span className="text-destructive">*</span></Label>
                <Input id="name" placeholder="Enter camp name" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} className={`h-9 text-sm ${errors.name ? 'border-destructive' : ''}`} />
                {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="stateId" className="text-xs font-medium">State <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.stateId ? String(formData.stateId) : ''}
                    onValueChange={(v) => {
                      const stateObj = statesHierarchy.find(s => String(s.id) === v);
                      updateFormData('stateId', stateObj?.id || 0);
                      updateFormData('state', stateObj?.name || '');
                      updateFormData('districtId', 0);
                      updateFormData('district', '');
                      updateFormData('mandalId', 0);
                      updateFormData('mandal', '');
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesHierarchy.map((state) => (
                        <SelectItem key={state.id} value={String(state.id)}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="districtId" className="text-xs font-medium">District <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.districtId ? String(formData.districtId) : ''}
                    onValueChange={(v) => {
                      const stateObj = statesHierarchy.find(s => s.id === formData.stateId);
                      const districtObj = stateObj?.districts.find(d => String(d.id) === v);
                      updateFormData('districtId', districtObj?.id || 0);
                      updateFormData('district', districtObj?.name || '');
                      updateFormData('mandalId', 0);
                      updateFormData('mandal', '');
                    }}
                    disabled={!formData.stateId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesHierarchy
                        .find(s => s.id === formData.stateId)?.districts.map((district) => (
                          <SelectItem key={district.id} value={String(district.id)}>
                            {district.name}
                          </SelectItem>
                        )) || []}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="mandalId" className="text-xs font-medium">Mandal <span className="text-destructive">*</span></Label>
                  <Select
                    value={formData.mandalId ? String(formData.mandalId) : ''}
                    onValueChange={(v) => {
                      const stateObj = statesHierarchy.find(s => s.id === formData.stateId);
                      const districtObj = stateObj?.districts.find(d => d.id === formData.districtId);
                      const mandalObj = districtObj?.mandals.find(m => String(m.id) === v);
                      updateFormData('mandalId', mandalObj?.id || 0);
                      updateFormData('mandal', mandalObj?.name || '');
                    }}
                    disabled={!formData.districtId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mandal" />
                    </SelectTrigger>
                    <SelectContent>
                      {statesHierarchy
                        .find(s => s.id === formData.stateId)?.districts
                        .find(d => d.id === formData.districtId)?.mandals.map((mandal) => (
                          <SelectItem key={mandal.id} value={String(mandal.id)}>
                            {mandal.name}
                          </SelectItem>
                        )) || []}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label htmlFor="startDate" className="text-xs font-medium">Start Date <span className="text-destructive">*</span></Label><Input id="startDate" type="date" value={formData.startDate} onChange={(e) => updateFormData('startDate', e.target.value)} className={`h-9 text-sm ${errors.startDate ? 'border-destructive' : ''}`} />{errors.startDate && <p className="text-xs text-destructive">{errors.startDate}</p>}</div>
                <div className="space-y-1"><Label htmlFor="endDate" className="text-xs font-medium">End Date <span className="text-destructive">*</span></Label><Input id="endDate" type="date" value={formData.endDate} onChange={(e) => updateFormData('endDate', e.target.value)} className={`h-9 text-sm ${errors.endDate ? 'border-destructive' : ''}`} />{errors.endDate && <p className="text-xs text-destructive">{errors.endDate}</p>}</div>
              </div>
              <div className="space-y-1"><Label htmlFor="description" className="text-xs font-medium">Description</Label><Textarea id="description" placeholder="Enter camp description" value={formData.description} onChange={(e) => updateFormData('description', e.target.value)} rows={2} className="text-sm" /></div>
            </CardContent>
          </Card>

          <Card className="w-48 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30"><CardTitle className="text-sm font-medium flex items-center gap-2"><Calendar className="h-4 w-4 text-accent" />Status</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <button key={option.value} onClick={() => updateFormData('status', option.value as typeof formData.status)} className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.status === option.value ? `${option.color} ring-2 ring-offset-1 ring-accent` : 'bg-white border-border hover:bg-muted'}`}>{option.label}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="w-64 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30"><CardTitle className="text-sm font-medium flex items-center gap-2"><Users className="h-4 w-4 text-accent" />Assign Doctors</CardTitle></CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {allDoctors.map((doctor) => (
                  <div key={doctor.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${formData.doctorIds && formData.doctorIds.includes(String(doctor.id)) ? 'bg-accent/20 border border-accent' : 'hover:bg-muted border border-transparent'}`} onClick={() => toggleDoctor(String(doctor.id))}>
                    <div><p className="font-medium text-sm">{doctor.name}</p><p className="text-xs text-muted-foreground">{doctor.specialization}</p></div>
                    {formData.doctorIds && formData.doctorIds.includes(String(doctor.id)) && <Badge className="bg-accent text-accent-foreground text-xs">✓</Badge>}
                  </div>
                ))}
              </div>
              {formData.doctorIds && formData.doctorIds.length > 0 && <div className="mt-3 pt-3 border-t"><p className="text-xs text-muted-foreground">{formData.doctorIds.length} doctor(s) assigned</p></div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}