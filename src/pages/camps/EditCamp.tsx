import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, MapPin, Calendar, Users } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/api';

interface FormErrors {
  name?: string;
  village?: string;
  district?: string;
  planDate?: string;
}

const statusOptions = [
  { value: 'draft', label: 'Draft', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'start', label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'closed', label: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' },
];
function EditCamp() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    village: '',
    district: '',
    address: '',
    planDate: '',
    description: '',
    campStatus: 'draft' as 'draft' | 'start' | 'closed',
    selectedDoctors: [] as (string | number)[],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const campRes = await fetch(`${API_BASE_URL}/camps/${id}`);
        if (!campRes.ok) {
          setNotFound(true);
          setLoading(false);
          return;
        }
        const camp = await campRes.json();
        setFormData({
          name: camp.name || '',
          village: camp.village || '',
          district: camp.district || '',
          address: camp.address || '',
          planDate: camp.planDate || '',
          description: camp.description || '',
          campStatus: camp.campStatus || 'draft',
          selectedDoctors: camp.doctorIds || [],
        });
        const doctorsRes = await fetch(`${API_BASE_URL}/doctors`);
        const doctorsData = doctorsRes.ok ? await doctorsRes.json() : [];
        setDoctors(doctorsData);
      } catch (err) {
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Camp not found</p>
          <Button className="mt-4" onClick={() => navigate('/camps')}>
            Back to Camps
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleDoctor = (doctorId: string | number) => {
    if (formData.selectedDoctors.includes(doctorId)) {
      updateFormData(
        'selectedDoctors',
        formData.selectedDoctors.filter((id) => id !== doctorId)
      );
    } else {
      updateFormData('selectedDoctors', [...formData.selectedDoctors, doctorId]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Camp name is required';
    }

    if (!formData.village.trim()) {
      newErrors.village = 'Village is required';
    }

    if (!formData.district.trim()) {
      newErrors.district = 'District is required';
    }

    if (!formData.planDate) {
      newErrors.planDate = 'Plan date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const payload = {
        name: formData.name,
        village: formData.village,
        district: formData.district,
        location: formData.location,
        planDate: formData.planDate,
        description: formData.description,
        campStatus: formData.campStatus,
        doctorIds: formData.selectedDoctors,
      };
      const res = await fetch(`${API_BASE_URL}/camps/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to update camp');
      }
      toast({
        title: 'Camp Updated Successfully!',
        description: `${formData.name} has been updated.`,
      });
      navigate('/camps');
    } catch (err) {
      toast({
        title: 'Update Failed',
        description: 'Could not update camp. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleCancel = () => {
    navigate('/camps');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Edit Camp</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} className="bg-accent hover:bg-accent/90">
              <Save className="h-4 w-4 mr-1" />
              Update Camp
            </Button>
          </div>
        </div>

        <div className="flex gap-4">
          {/* Main Form */}
          <Card className="flex-1 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" />
                Camp Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Camp Name */}
              <div className="space-y-1">
                <Label htmlFor="name" className="text-xs font-medium">
                  Camp Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter camp name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={`h-9 text-sm ${errors.name ? 'border-destructive' : ''}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}</div>

              {/* Location Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="village" className="text-xs font-medium">
                    Village <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="village"
                    placeholder="Enter village"
                    value={formData.village}
                    onChange={(e) => updateFormData('village', e.target.value)}
                    className={`h-9 text-sm ${errors.village ? 'border-destructive' : ''}`}
                  />
                  {errors.village && (
                    <p className="text-xs text-destructive">{errors.village}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="district" className="text-xs font-medium">
                    District <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => updateFormData('district', e.target.value)}
                    className={`h-9 text-sm ${errors.district ? 'border-destructive' : ''}`}
                  />
                  {errors.district && (
                    <p className="text-xs text-destructive">{errors.district}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-xs font-medium">Address</Label>
                  <Input
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Plan Date */}
              <div className="space-y-1">
                <Label htmlFor="planDate" className="text-xs font-medium">
                  Plan Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="planDate"
                  type="date"
                  value={formData.planDate}
                  onChange={(e) => updateFormData('planDate', e.target.value)}
                  className={`h-9 text-sm ${errors.planDate ? 'border-destructive' : ''}`}
                />
                {errors.planDate && (
                  <p className="text-xs text-destructive">{errors.planDate}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter camp description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={2}
                  className="text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card className="w-48 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData('campStatus', option.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.campStatus === option.value
                        ? `${option.color} ring-2 ring-offset-1 ring-accent`
                        : 'bg-white border-border hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Doctor Assignment Card */}
          <Card className="w-64 shrink-0 shadow-sm">
            <CardHeader className="py-3 px-4 border-b bg-muted/30">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-accent" />
                Assign Doctors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {doctors.map((doctor) => (
                  <div
                    key={doctor.id}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                      formData.selectedDoctors.includes(doctor.id)
                        ? 'bg-accent/20 border border-accent'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                    onClick={() => toggleDoctor(doctor.id)}
                  >
                    <div>
                      <p className="font-medium text-sm">{doctor.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doctor.specialization}
                      </p>
                    </div>
                    {formData.selectedDoctors.includes(doctor.id) && (
                      <Badge className="bg-accent text-accent-foreground text-xs">✓</Badge>
                    )}
                  </div>
                ))}
              </div>
              {formData.selectedDoctors.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    {formData.selectedDoctors.length} doctor(s) assigned
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default EditCamp;
