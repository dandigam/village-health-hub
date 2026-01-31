import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Save, 
  Send, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  CalendarIcon, 
  Search,
  User,
  MapPin,
  Users,
  Stethoscope,
  ClipboardCheck
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { mockDoctors } from '@/data/mockData';

// Mock data for dropdowns
const mockStates = ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu'];
const mockDistricts = ['Guntur', 'Krishna', 'Prakasam', 'Nellore'];
const mockMandals = ['Bapatla', 'Mangalagiri', 'Tenali', 'Narasaraopet'];
const mockCities = ['Bapatla', 'Mangalagiri', 'Vijayawada', 'Guntur'];
const mockVolunteers = [
  { id: '1', name: 'Alice Johnson' },
  { id: '2', name: 'Bob Smith' },
  { id: '3', name: 'Charlie Brown' },
  { id: '4', name: 'David Wilson' },
  { id: '5', name: 'Eva Martinez' },
];

const steps = [
  { id: 1, title: 'Camp Details', icon: User },
  { id: 2, title: 'Location', icon: MapPin },
  { id: 3, title: 'Assign Doctors', icon: Stethoscope },
  { id: 4, title: 'Assign Volunteers', icon: Users },
  { id: 5, title: 'Summary', icon: ClipboardCheck },
];

interface FormData {
  campName: string;
  organizerName: string;
  organizerPhone: string;
  organizerEmail: string;
  planDate: Date | undefined;
  state: string;
  district: string;
  mandal: string;
  city: string;
  address: string;
  pinCode: string;
  selectedDoctors: typeof mockDoctors;
  selectedVolunteers: typeof mockVolunteers;
}

export default function NewCamp() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [volunteerSearch, setVolunteerSearch] = useState('');
  const [formData, setFormData] = useState<FormData>({
    campName: '',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    planDate: undefined,
    state: '',
    district: '',
    mandal: '',
    city: '',
    address: '',
    pinCode: '',
    selectedDoctors: [],
    selectedVolunteers: [],
  });

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSaveDraft = () => {
    toast({
      title: 'Draft Saved',
      description: 'Your camp draft has been saved successfully.',
    });
  };

  const handleSubmit = () => {
    toast({
      title: 'Camp Created Successfully!',
      description: `${formData.campName} has been created and is ready for activation.`,
    });
    navigate('/camps');
  };

  const addDoctor = (doctor: (typeof mockDoctors)[0]) => {
    if (!formData.selectedDoctors.find((d) => d.id === doctor.id)) {
      updateFormData('selectedDoctors', [...formData.selectedDoctors, doctor]);
    }
    setDoctorSearch('');
  };

  const removeDoctor = (doctorId: string) => {
    updateFormData(
      'selectedDoctors',
      formData.selectedDoctors.filter((d) => d.id !== doctorId)
    );
  };

  const addVolunteer = (volunteer: (typeof mockVolunteers)[0]) => {
    if (!formData.selectedVolunteers.find((v) => v.id === volunteer.id)) {
      updateFormData('selectedVolunteers', [...formData.selectedVolunteers, volunteer]);
    }
    setVolunteerSearch('');
  };

  const removeVolunteer = (volunteerId: string) => {
    updateFormData(
      'selectedVolunteers',
      formData.selectedVolunteers.filter((v) => v.id !== volunteerId)
    );
  };

  const filteredDoctors = mockDoctors.filter(
    (d) =>
      d.name.toLowerCase().includes(doctorSearch.toLowerCase()) &&
      !formData.selectedDoctors.find((sd) => sd.id === d.id)
  );

  const filteredVolunteers = mockVolunteers.filter(
    (v) =>
      v.name.toLowerCase().includes(volunteerSearch.toLowerCase()) &&
      !formData.selectedVolunteers.find((sv) => sv.id === v.id)
  );

  return (
    <DashboardLayout>
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-background border-b -mx-6 -mt-6 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/camps')}>
              <X className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">Create New Camp</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handleSubmit}>
              <Send className="mr-2 h-4 w-4" />
              Submit
            </Button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center transition-colors cursor-pointer',
                    currentStep === step.id
                      ? 'bg-accent text-accent-foreground'
                      : currentStep > step.id
                      ? 'bg-green-500 text-white'
                      : 'bg-muted text-muted-foreground'
                  )}
                  onClick={() => setCurrentStep(step.id)}
                >
                  {currentStep > step.id ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={cn(
                    'text-xs mt-2 text-center',
                    currentStep === step.id ? 'text-accent font-medium' : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    currentStep > step.id ? 'bg-green-500' : 'bg-muted'
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {(() => {
              const StepIcon = steps[currentStep - 1].icon;
              return StepIcon ? <StepIcon className="h-5 w-5 text-accent" /> : null;
            })()}
            {steps[currentStep - 1].title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Camp Details */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="campName">Camp Name *</Label>
                  <Input
                    id="campName"
                    placeholder="Enter camp name"
                    value={formData.campName}
                    onChange={(e) => updateFormData('campName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizerName">Organizer Name *</Label>
                  <Input
                    id="organizerName"
                    placeholder="Enter organizer name"
                    value={formData.organizerName}
                    onChange={(e) => updateFormData('organizerName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizerPhone">Organizer Phone No *</Label>
                  <Input
                    id="organizerPhone"
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.organizerPhone}
                    onChange={(e) => updateFormData('organizerPhone', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organizerEmail">Organizer Email</Label>
                  <Input
                    id="organizerEmail"
                    type="email"
                    placeholder="Enter email address"
                    value={formData.organizerEmail}
                    onChange={(e) => updateFormData('organizerEmail', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !formData.planDate && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.planDate ? format(formData.planDate, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.planDate}
                        onSelect={(date) => updateFormData('planDate', date)}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>State</Label>
                  <Select value={formData.state} onValueChange={(v) => updateFormData('state', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStates.map((state) => (
                        <SelectItem key={state} value={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>District *</Label>
                  <Select
                    value={formData.district}
                    onValueChange={(v) => updateFormData('district', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select district" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockDistricts.map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Mandal *</Label>
                  <Select
                    value={formData.mandal}
                    onValueChange={(v) => updateFormData('mandal', v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select mandal" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockMandals.map((mandal) => (
                        <SelectItem key={mandal} value={mandal}>
                          {mandal}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>City *</Label>
                  <Select value={formData.city} onValueChange={(v) => updateFormData('city', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter full address"
                    value={formData.address}
                    onChange={(e) => updateFormData('address', e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pinCode">PIN Code</Label>
                  <Input
                    id="pinCode"
                    type="text"
                    placeholder="Enter PIN code"
                    value={formData.pinCode}
                    onChange={(e) => updateFormData('pinCode', e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Assign Doctors */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Search and Add Doctors</Label>
                <Command className="rounded-lg border">
                  <CommandInput
                    placeholder="Search doctors..."
                    value={doctorSearch}
                    onValueChange={setDoctorSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No doctors found.</CommandEmpty>
                    <CommandGroup>
                      {filteredDoctors.map((doctor) => (
                        <CommandItem
                          key={doctor.id}
                          onSelect={() => addDoctor(doctor)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xs font-medium">
                              {doctor.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <p className="font-medium">{doctor.name}</p>
                              <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              {formData.selectedDoctors.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Doctors ({formData.selectedDoctors.length})</Label>
                  <div className="flex flex-wrap gap-3">
                    {formData.selectedDoctors.map((doctor) => (
                      <Card key={doctor.id} className="p-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-medium">
                          {doctor.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-2"
                          onClick={() => removeDoctor(doctor.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Assign Volunteers */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label>Search and Add Volunteers</Label>
                <Command className="rounded-lg border">
                  <CommandInput
                    placeholder="Search volunteers..."
                    value={volunteerSearch}
                    onValueChange={setVolunteerSearch}
                  />
                  <CommandList>
                    <CommandEmpty>No volunteers found.</CommandEmpty>
                    <CommandGroup>
                      {filteredVolunteers.map((volunteer) => (
                        <CommandItem
                          key={volunteer.id}
                          onSelect={() => addVolunteer(volunteer)}
                          className="cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">
                              {volunteer.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <p className="font-medium">{volunteer.name}</p>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>

              {formData.selectedVolunteers.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Volunteers ({formData.selectedVolunteers.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedVolunteers.map((volunteer) => (
                      <Badge
                        key={volunteer.id}
                        variant="secondary"
                        className="px-3 py-2 text-sm flex items-center gap-2"
                      >
                        {volunteer.name}
                        <button
                          className="hover:text-destructive"
                          onClick={() => removeVolunteer(volunteer.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Summary */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Camp Details Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4 text-accent" />
                    Camp Details
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(1)}>
                    Edit
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Camp Name:</span>{' '}
                    <span className="font-medium">{formData.campName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Organizer:</span>{' '}
                    <span className="font-medium">{formData.organizerName || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Phone:</span>{' '}
                    <span className="font-medium">{formData.organizerPhone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>{' '}
                    <span className="font-medium">{formData.organizerEmail || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Plan Date:</span>{' '}
                    <span className="font-medium">
                      {formData.planDate ? format(formData.planDate, 'PPP') : '-'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Location Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    Location
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(2)}>
                    Edit
                  </Button>
                </div>
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">State:</span>{' '}
                    <span className="font-medium">{formData.state || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">District:</span>{' '}
                    <span className="font-medium">{formData.district || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Mandal:</span>{' '}
                    <span className="font-medium">{formData.mandal || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>{' '}
                    <span className="font-medium">{formData.city || '-'}</span>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-muted-foreground">Address:</span>{' '}
                    <span className="font-medium">{formData.address || '-'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">PIN Code:</span>{' '}
                    <span className="font-medium">{formData.pinCode || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Doctors Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-accent" />
                    Assigned Doctors ({formData.selectedDoctors.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(3)}>
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedDoctors.length > 0 ? (
                    formData.selectedDoctors.map((doctor) => (
                      <Badge key={doctor.id} variant="secondary">
                        {doctor.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No doctors assigned</span>
                  )}
                </div>
              </div>

              {/* Volunteers Summary */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Users className="h-4 w-4 text-accent" />
                    Assigned Volunteers ({formData.selectedVolunteers.length})
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setCurrentStep(4)}>
                    Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.selectedVolunteers.length > 0 ? (
                    formData.selectedVolunteers.map((volunteer) => (
                      <Badge key={volunteer.id} variant="secondary">
                        {volunteer.name}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No volunteers assigned</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <Button variant="outline" onClick={handlePrev} disabled={currentStep === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button className="bg-accent hover:bg-accent/90" onClick={handleSubmit}>
                <Check className="mr-2 h-4 w-4" />
                Create Camp
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
