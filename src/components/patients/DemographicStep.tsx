import { useMemo } from 'react';
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
import { useStatesHierarchy } from '@/hooks/useApiData';

interface DemographicData {
  firstName: string;
  lastName: string;
  fatherSpouseName: string;
  gender: string;
  age: string;
  maritalStatus: string;
  phone: string;
  state: string; // stores stateId as string
  district: string; // stores districtId as string
  mandal: string; // stores mandalId as string
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
  const { data: statesHierarchy = [] } = useStatesHierarchy();

  // Derive available districts and mandals from API data
  // Find selected state, district, mandal objects for display
  // Always use stateId, districtId, mandalId for value and lookup
  const selectedState = useMemo(() => statesHierarchy.find(s => String(s.id) === String(data.state)), [statesHierarchy, data.state]);
  const availableDistricts = useMemo(() => selectedState?.districts ?? [], [selectedState]);
  const selectedDistrict = useMemo(() => availableDistricts.find(d => String(d.id) === String(data.district)), [availableDistricts, data.district]);
  const availableMandals = useMemo(() => selectedDistrict?.mandals ?? [], [selectedDistrict]);
  const selectedMandal = useMemo(() => availableMandals.find(m => String(m.id) === String(data.mandal)), [availableMandals, data.mandal]);

  // Reset dependent fields when parent changes
  const handleStateChange = (value: string) => {
    onUpdate('state', value);
    onUpdate('district', '');
    onUpdate('mandal', '');
  };

  const handleDistrictChange = (value: string) => {
    onUpdate('district', value);
    onUpdate('mandal', '');
  };

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
                <Select value={data.state || ''} onValueChange={handleStateChange}>
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select">
                      {selectedState ? selectedState.name : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {statesHierarchy.map(s => (
                      <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="district" className="text-xs font-medium">District</Label>
                <Select
                  value={data.district || ''}
                  onValueChange={handleDistrictChange}
                  disabled={!data.state}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select">
                      {selectedDistrict ? selectedDistrict.name : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableDistricts.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="mandal" className="text-xs font-medium">Mandal</Label>
                <Select 
                  value={data.mandal || ''}
                  onValueChange={(v) => onUpdate('mandal', v)}
                  disabled={!data.district}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder="Select">
                      {selectedMandal ? selectedMandal.name : ''}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {availableMandals.length > 0 ? (
                      availableMandals.map(m => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="__none" disabled>No mandals available</SelectItem>
                    )}
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
