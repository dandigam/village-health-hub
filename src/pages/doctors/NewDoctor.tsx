import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Save, User, Camera } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { mockCamps } from '@/data/mockData';

const specializations = [
  'General Physician',
  'Cardiologist',
  'Neurologist',
  'Orthopedist',
  'Pediatrician',
  'Dermatologist',
  'Ophthalmologist',
  'ENT Specialist',
  'Psychiatrist',
  'Gynecologist',
];

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  specialization?: string;
}

export default function NewDoctor() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    phone: '',
    email: '',
    selectedCamps: [] as string[],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleCamp = (campId: string) => {
    if (formData.selectedCamps.includes(campId)) {
      updateFormData(
        'selectedCamps',
        formData.selectedCamps.filter((id) => id !== campId)
      );
    } else {
      updateFormData('selectedCamps', [...formData.selectedCamps, campId]);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Doctor name is required';
    }

    if (!formData.specialization) {
      newErrors.specialization = 'Specialization is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Enter a valid 10-digit phone number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
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
      title: 'Doctor Added Successfully!',
      description: `${formData.name} has been added to the system.`,
    });
    navigate('/doctors');
  };

  const handleCancel = () => {
    navigate('/doctors');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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
              <User className="h-5 w-5 text-accent" />
              Add Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-accent text-accent-foreground text-2xl">
                    {formData.name ? getInitials(formData.name) : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Doctor Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">
                  Specialization <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.specialization}
                  onValueChange={(v) => updateFormData('specialization', v)}
                >
                  <SelectTrigger className={errors.specialization ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select specialization" />
                  </SelectTrigger>
                  <SelectContent>
                    {specializations.map((spec) => (
                      <SelectItem key={spec} value={spec}>
                        {spec}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialization && (
                  <p className="text-sm text-destructive">{errors.specialization}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={errors.phone ? 'border-destructive' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Assign Camps</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select camps to assign this doctor
                </p>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  <div className="space-y-2">
                    {mockCamps.map((camp) => (
                      <div
                        key={camp.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.selectedCamps.includes(camp.id)
                            ? 'bg-accent/20 border border-accent'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => toggleCamp(camp.id)}
                      >
                        <div>
                          <p className="font-medium text-sm">{camp.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {camp.village}, {camp.district}
                          </p>
                        </div>
                        {formData.selectedCamps.includes(camp.id) && (
                          <Badge className="bg-accent text-accent-foreground">Selected</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {formData.selectedCamps.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.selectedCamps.map((campId) => {
                      const camp = mockCamps.find((c) => c.id === campId);
                      return camp ? (
                        <Badge
                          key={campId}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {camp.name}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCamp(campId);
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
                Save Doctor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
