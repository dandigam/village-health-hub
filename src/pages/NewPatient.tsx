import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function NewPatient() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    fatherName: '',
    gender: '',
    maritalStatus: '',
    age: '',
    phone: '',
    state: '',
    district: '',
    mandal: '',
    village: '',
    street: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validation
    if (!formData.name || !formData.fatherName || !formData.gender || !formData.age) {
      toast.error('Please fill in all required fields');
      return;
    }
    toast.success('Patient registered successfully!');
    navigate('/patients');
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <DashboardLayout campName="Bapatla">
      <div className="max-w-4xl">
        <div className="page-header">
          <h1 className="page-title">Add New Patient</h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-6">
            {/* Form Fields */}
            <Card className="flex-1">
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="surname">Surname</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => updateField('surname', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatherName">
                      Father Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(v) => updateField('maritalStatus', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Marital Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                    />
                  </div>
                </div>

                {/* Address Section */}
                <h3 className="font-semibold mb-4">Address</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AP">Andhra Pradesh</SelectItem>
                        <SelectItem value="TS">Telangana</SelectItem>
                        <SelectItem value="KA">Karnataka</SelectItem>
                        <SelectItem value="TN">Tamil Nadu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <Select
                      value={formData.district}
                      onValueChange={(v) => updateField('district', v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Guntur">Guntur</SelectItem>
                        <SelectItem value="Krishna">Krishna</SelectItem>
                        <SelectItem value="Prakasam">Prakasam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mandal">Mandal</Label>
                    <Select value={formData.mandal} onValueChange={(v) => updateField('mandal', v)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Mandal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Bapatla">Bapatla</SelectItem>
                        <SelectItem value="Mangalagiri">Mangalagiri</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="village">City / Village</Label>
                    <Input
                      id="village"
                      value={formData.village}
                      onChange={(e) => updateField('village', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <Label htmlFor="street">Street</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => updateField('street', e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4">
                  <Button type="button" variant="outline" onClick={() => navigate('/patients')}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-accent hover:bg-accent/90">
                    Submit
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload */}
            <Card className="w-64 shrink-0">
              <CardContent className="pt-6">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4">
                  <Camera className="h-16 w-16 text-muted-foreground" />
                </div>
                <Button variant="secondary" className="w-full">
                  Take Picture
                </Button>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
