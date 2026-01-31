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
import { mockCamps, mockDoctors } from '@/data/mockData';

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
  const camp = mockCamps.find((c) => c.id === id);

  const [formData, setFormData] = useState({
    name: '',
    village: '',
    district: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'draft' as 'draft' | 'active' | 'closed',
    selectedDoctors: [] as string[],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (camp) {
      setFormData({
        name: camp.name,
        village: camp.village,
        district: camp.district,
        location: camp.location,
        startDate: camp.startDate,
        endDate: camp.endDate,
        description: camp.description || '',
        status: camp.status,
        selectedDoctors: camp.doctorIds,
      });
    }
  }, [camp]);

  if (!camp) {
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

  const toggleDoctor = (doctorId: string) => {
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

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (formData.startDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Camp Updated Successfully!',
      description: `${formData.name} has been updated.`,
    });
    navigate('/camps');
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
                )}
              </div>

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
                  <Label htmlFor="location" className="text-xs font-medium">Address</Label>
                  <Input
                    id="location"
                    placeholder="Enter full address"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
              </div>

              {/* Date Row */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="startDate" className="text-xs font-medium">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                    className={`h-9 text-sm ${errors.startDate ? 'border-destructive' : ''}`}
                  />
                  {errors.startDate && (
                    <p className="text-xs text-destructive">{errors.startDate}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="endDate" className="text-xs font-medium">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateFormData('endDate', e.target.value)}
                    className={`h-9 text-sm ${errors.endDate ? 'border-destructive' : ''}`}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-destructive">{errors.endDate}</p>
                  )}
                </div>
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
                    onClick={() => updateFormData('status', option.value)}
                    className={`w-full px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      formData.status === option.value
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
                {mockDoctors.map((doctor) => (
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
