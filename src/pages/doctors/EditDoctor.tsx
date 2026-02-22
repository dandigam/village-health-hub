import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, User, Stethoscope, Building } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PhotoUpload } from '@/components/shared/PhotoUpload';
import { toast } from '@/hooks/use-toast';
import { useCamps, useDoctors, useSaveDoctor } from '@/hooks/useApiData';

const specializations = [
  'General Physician', 'Cardiologist', 'Neurologist', 'Orthopedist', 'Pediatrician',
  'Dermatologist', 'Ophthalmologist', 'ENT Specialist', 'Psychiatrist', 'Gynecologist',
];

interface FormErrors { name?: string; phone?: string; email?: string; specialization?: string; }

export default function EditDoctor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: doctors = [] } = useDoctors();
  const { data: camps = [] } = useCamps();
  const doctor = doctors.find((d) => String(d.id) === String(id));

  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', specialization: '', phone: '', email: '', isActive: true, selectedCamps: [] as string[],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (doctor) {
      const assignedCamps = camps.filter((c) => c.doctorIds.includes(doctor.id)).map((c) => c.id);
      setFormData({
        name: doctor.name,
        specialization: doctor.specialization,
        phone: doctor.phoneNumber ?? doctor.phone ?? '',
        email: doctor.email || '',
        isActive: true,
        selectedCamps: assignedCamps,
      });
      setPhotoUrl(doctor.photoUrl || null);
    }
  }, [doctor, camps]);

  if (!doctor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Doctor not found</p>
          <Button className="mt-4" onClick={() => navigate('/doctors')}>Back to Doctors</Button>
        </div>
      </DashboardLayout>
    );
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const toggleCamp = (campId: string) => {
    if (formData.selectedCamps.includes(campId)) {
      updateFormData('selectedCamps', formData.selectedCamps.filter((id) => id !== campId));
    } else {
      updateFormData('selectedCamps', [...formData.selectedCamps, campId]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Doctor name is required';
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) newErrors.phone = 'Enter a valid 10-digit phone number';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Enter a valid email address';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveDoctor = useSaveDoctor();

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form.', variant: 'destructive' });
      return;
    }
    // Map doctorCamps to request format
    const doctorCamps = formData.selectedCamps.map((campId) => ({
      doctor: formData.name,
      camp: campId,
    }));
    const payload = {
      id,
      name: formData.name,
      specialization: formData.specialization,
      phoneNumber: formData.phone,
      email: formData.email,
      doctorCamps,
    };
    try {
      await saveDoctor.mutateAsync(payload);
      toast({ title: 'Doctor Updated Successfully!', description: `${formData.name}'s details have been updated.` });
      navigate('/doctors');
    } catch (e) {
      toast({ title: 'API Error', description: 'Failed to update doctor.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Edit Doctor</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/doctors')}><X className="h-4 w-4 mr-1" />Cancel</Button>
            <Button size="sm" onClick={handleSubmit} className="bg-accent hover:bg-accent/90"><Save className="h-4 w-4 mr-1" />Update Doctor</Button>
          </div>
        </div>
        <div className="flex gap-4">
          <Card className="flex-1 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><User className="h-4 w-4 text-accent" />Doctor Information</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <Label htmlFor="active-toggle" className="text-sm font-medium">Doctor Status</Label>
                  <p className="text-xs text-muted-foreground">{formData.isActive ? 'Currently active' : 'Currently inactive'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge className={formData.isActive ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>{formData.isActive ? 'Active' : 'Inactive'}</Badge>
                  <Switch id="active-toggle" checked={formData.isActive} onCheckedChange={(checked) => updateFormData('isActive', checked)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xs font-medium">Doctor Name <span className="text-destructive">*</span></Label>
                  <Input id="name" placeholder="Enter full name" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} className={`h-9 text-sm ${errors.name ? 'border-destructive' : ''}`} />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="specialization" className="text-xs font-medium">Specialization <span className="text-destructive">*</span></Label>
                  <Select value={formData.specialization} onValueChange={(v) => updateFormData('specialization', v)}>
                    <SelectTrigger className={`h-9 text-sm ${errors.specialization ? 'border-destructive' : ''}`}><SelectValue placeholder="Select specialization" /></SelectTrigger>
                    <SelectContent>{specializations.map((spec) => (<SelectItem key={spec} value={spec}>{spec}</SelectItem>))}</SelectContent>
                  </Select>
                  {errors.specialization && <p className="text-xs text-destructive">{errors.specialization}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-medium">Phone Number <span className="text-destructive">*</span></Label>
                  <Input id="phone" type="tel" placeholder="Enter phone number" value={formData.phone} onChange={(e) => updateFormData('phone', e.target.value)} className={`h-9 text-sm ${errors.phone ? 'border-destructive' : ''}`} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-medium">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter email address" value={formData.email} onChange={(e) => updateFormData('email', e.target.value)} className={`h-9 text-sm ${errors.email ? 'border-destructive' : ''}`} />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="w-52 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Stethoscope className="h-4 w-4 text-accent" />Photo</CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex flex-col items-center justify-center">
              <PhotoUpload currentPhoto={photoUrl || undefined} onPhotoChange={setPhotoUrl} name={formData.name} size="lg" />
            </CardContent>
          </Card>
          <Card className="w-64 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2"><Building className="h-4 w-4 text-accent" />Assign Camps</CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {camps.map((camp) => (
                  <div key={camp.id} className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${formData.selectedCamps.includes(camp.id) ? 'bg-accent/20 border border-accent' : 'hover:bg-muted border border-transparent'}`} onClick={() => toggleCamp(camp.id)}>
                    <div><p className="font-medium text-sm">{camp.name}</p><p className="text-xs text-muted-foreground">{camp.village}</p></div>
                    {formData.selectedCamps.includes(camp.id) && <Badge className="bg-accent text-accent-foreground text-xs">✓</Badge>}
                  </div>
                ))}
              </div>
              {formData.selectedCamps.length > 0 && (
                <div className="mt-3 pt-3 border-t"><p className="text-xs text-muted-foreground mb-2">{formData.selectedCamps.length} camp(s) selected</p></div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
