import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Save, X } from 'lucide-react';
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
import { PhotoUpload } from '@/components/shared/PhotoUpload';
import { toast } from 'sonner';

export default function NewPatient() {
  const navigate = useNavigate();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
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
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Add New Patient</h1>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/patients')}>
              <X className="h-4 w-4 mr-1" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} className="bg-accent hover:bg-accent/90">
              <Save className="h-4 w-4 mr-1" />
              Submit
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4">
            {/* Main Form */}
            <Card className="flex-1 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-muted/30">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4 text-accent" />
                  Patient Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {/* Personal Details Row 1 */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="name" className="text-xs font-medium">
                      Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="surname" className="text-xs font-medium">Surname</Label>
                    <Input
                      id="surname"
                      value={formData.surname}
                      onChange={(e) => updateField('surname', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Last name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fatherName" className="text-xs font-medium">
                      Father Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => updateField('fatherName', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Father's name"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="gender" className="text-xs font-medium">
                      Gender <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.gender} onValueChange={(v) => updateField('gender', v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Personal Details Row 2 */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="maritalStatus" className="text-xs font-medium">Marital Status</Label>
                    <Select
                      value={formData.maritalStatus}
                      onValueChange={(v) => updateField('maritalStatus', v)}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="age" className="text-xs font-medium">
                      Age <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="age"
                      type="number"
                      value={formData.age}
                      onChange={(e) => updateField('age', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Years"
                    />
                  </div>
                  <div className="space-y-1 col-span-2">
                    <Label htmlFor="phone" className="text-xs font-medium">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => updateField('phone', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Mobile number"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">Address</span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-xs font-medium">State</Label>
                      <Select value={formData.state} onValueChange={(v) => updateField('state', v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AP">Andhra Pradesh</SelectItem>
                          <SelectItem value="TS">Telangana</SelectItem>
                          <SelectItem value="KA">Karnataka</SelectItem>
                          <SelectItem value="TN">Tamil Nadu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="district" className="text-xs font-medium">District</Label>
                      <Select
                        value={formData.district}
                        onValueChange={(v) => updateField('district', v)}
                      >
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Guntur">Guntur</SelectItem>
                          <SelectItem value="Krishna">Krishna</SelectItem>
                          <SelectItem value="Prakasam">Prakasam</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="mandal" className="text-xs font-medium">Mandal</Label>
                      <Select value={formData.mandal} onValueChange={(v) => updateField('mandal', v)}>
                        <SelectTrigger className="h-9 text-sm">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bapatla">Bapatla</SelectItem>
                          <SelectItem value="Mangalagiri">Mangalagiri</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="village" className="text-xs font-medium">City / Village</Label>
                      <Input
                        id="village"
                        value={formData.village}
                        onChange={(e) => updateField('village', e.target.value)}
                        className="h-9 text-sm"
                        placeholder="Enter city/village"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="street" className="text-xs font-medium">Street</Label>
                    <Input
                      id="street"
                      value={formData.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      className="h-9 text-sm"
                      placeholder="Street address"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Photo Upload Card */}
            <Card className="w-52 shrink-0 shadow-sm">
              <CardHeader className="py-3 px-4 border-b bg-muted/30">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  Photo
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <PhotoUpload
                  currentPhoto={photoUrl || undefined}
                  onPhotoChange={setPhotoUrl}
                  name={formData.name}
                  size="lg"
                />
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
