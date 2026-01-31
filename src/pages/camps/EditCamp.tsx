import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Save, MapPin, Calendar } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

  const getStatusColor = (status: string) => {
    return statusOptions.find((s) => s.value === status)?.color || '';
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="relative pb-2">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4"
              onClick={handleCancel}
            >
              <X className="h-5 w-5" />
            </Button>
            <CardTitle className="text-xl flex items-center gap-2">
              <MapPin className="h-5 w-5 text-accent" />
              Edit Camp
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status Toggle */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <Label className="font-medium mb-3 block">Camp Status</Label>
              <div className="flex gap-2">
                {statusOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => updateFormData('status', option.value)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.status === option.value
                        ? `${option.color} ring-2 ring-offset-2 ring-accent`
                        : 'bg-white border-border hover:bg-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Camp Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter camp name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="village">
                    Village <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="village"
                    placeholder="Enter village"
                    value={formData.village}
                    onChange={(e) => updateFormData('village', e.target.value)}
                    className={errors.village ? 'border-destructive' : ''}
                  />
                  {errors.village && (
                    <p className="text-sm text-destructive">{errors.village}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="district">
                    District <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="district"
                    placeholder="Enter district"
                    value={formData.district}
                    onChange={(e) => updateFormData('district', e.target.value)}
                    className={errors.district ? 'border-destructive' : ''}
                  />
                  {errors.district && (
                    <p className="text-sm text-destructive">{errors.district}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location / Address</Label>
                <Input
                  id="location"
                  placeholder="Enter full address"
                  value={formData.location}
                  onChange={(e) => updateFormData('location', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">
                    Start Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                    className={errors.startDate ? 'border-destructive' : ''}
                  />
                  {errors.startDate && (
                    <p className="text-sm text-destructive">{errors.startDate}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">
                    End Date <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => updateFormData('endDate', e.target.value)}
                    className={errors.endDate ? 'border-destructive' : ''}
                  />
                  {errors.endDate && (
                    <p className="text-sm text-destructive">{errors.endDate}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter camp description"
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Assign Doctors</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select doctors to assign to this camp
                </p>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {mockDoctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.selectedDoctors.includes(doctor.id)
                            ? 'bg-accent/20 border border-accent'
                            : 'hover:bg-muted'
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
                          <Badge className="bg-accent text-accent-foreground">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {formData.selectedDoctors.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.selectedDoctors.map((doctorId) => {
                      const doctor = mockDoctors.find((d) => d.id === doctorId);
                      return doctor ? (
                        <Badge
                          key={doctorId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {doctor.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDoctor(doctorId);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4 border-t">
              <Button variant="outline" className="flex-1" onClick={handleCancel}>
                Cancel
              </Button>
              <Button className="flex-1 bg-accent hover:bg-accent/90" onClick={handleSubmit}>
                <Save className="mr-2 h-4 w-4" />
                Update Camp
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}