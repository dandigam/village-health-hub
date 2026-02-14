import { User, MapPin } from 'lucide-react';
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

interface DemographicData {
  firstName: string;
  lastName: string;
  fatherSpouseName: string;
  gender: string;
  age: string;
  maritalStatus: string;
  phone: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  street: string;
}

interface DemographicStepProps {
  data: DemographicData;
  photoUrl: string | null;
  onUpdate: (field: keyof DemographicData, value: string) => void;
  onPhotoChange: (url: string | null) => void;
}

export function DemographicStep({ data, photoUrl, onUpdate, onPhotoChange }: DemographicStepProps) {
  return (
    <div className="flex gap-4">
      {/* Main Form */}
      <Card className="flex-1 shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            Demographic Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {/* Personal Details Row 1 */}
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-1">
              <Label htmlFor="firstName" className="text-xs font-medium">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                value={data.firstName}
                onChange={(e) => onUpdate('firstName', e.target.value)}
                className="h-9 text-sm"
                placeholder="First name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="lastName" className="text-xs font-medium">Last Name</Label>
              <Input
                id="lastName"
                value={data.lastName}
                onChange={(e) => onUpdate('lastName', e.target.value)}
                className="h-9 text-sm"
                placeholder="Last name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="fatherSpouseName" className="text-xs font-medium">
                Father / Spouse Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="fatherSpouseName"
                value={data.fatherSpouseName}
                onChange={(e) => onUpdate('fatherSpouseName', e.target.value)}
                className="h-9 text-sm"
                placeholder="Father/Spouse name"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender" className="text-xs font-medium">
                Gender <span className="text-destructive">*</span>
              </Label>
              <Select value={data.gender} onValueChange={(v) => onUpdate('gender', v)}>
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
              <Label htmlFor="age" className="text-xs font-medium">
                Age (Years) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="age"
                type="number"
                value={data.age}
                onChange={(e) => onUpdate('age', e.target.value)}
                className="h-9 text-sm"
                placeholder="Years"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="maritalStatus" className="text-xs font-medium">Marital Status</Label>
              <Select
                value={data.maritalStatus}
                onValueChange={(v) => onUpdate('maritalStatus', v)}
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
            <div className="space-y-1 col-span-2">
              <Label htmlFor="phone" className="text-xs font-medium">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={data.phone}
                onChange={(e) => onUpdate('phone', e.target.value)}
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
                <Select value={data.state} onValueChange={(v) => onUpdate('state', v)}>
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
                  value={data.district}
                  onValueChange={(v) => onUpdate('district', v)}
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
                <Select value={data.mandal} onValueChange={(v) => onUpdate('mandal', v)}>
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
                  value={data.village}
                  onChange={(e) => onUpdate('village', e.target.value)}
                  className="h-9 text-sm"
                  placeholder="Enter city/village"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="street" className="text-xs font-medium">Street Address</Label>
              <Input
                id="street"
                value={data.street}
                onChange={(e) => onUpdate('street', e.target.value)}
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
            Patient Photo
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 flex flex-col items-center justify-center">
          <PhotoUpload
            currentPhoto={photoUrl || undefined}
            onPhotoChange={onPhotoChange}
            name={data.firstName}
            size="lg"
          />
        </CardContent>
      </Card>
    </div>
  );
}
