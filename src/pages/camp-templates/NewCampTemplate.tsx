import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X, Search, Stethoscope, Users, MapPin, User } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useDoctors, useCampTemplates, useSaveCampTemplate, useStatesHierarchy } from '@/hooks/useApiData';

const mockStaff = [
  { id: '1', name: 'Alice Johnson', role: 'Nurse' },
  { id: '2', name: 'Bob Smith', role: 'Volunteer' },
  { id: '3', name: 'Charlie Brown', role: 'Nurse' },
  { id: '4', name: 'David Wilson', role: 'Pharmacist' },
  { id: '5', name: 'Eva Martinez', role: 'Volunteer' },
];

export default function NewCampTemplate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const { data: allDoctors = [] } = useDoctors();
  const { data: templates = [] } = useCampTemplates();
  const { data: statesHierarchy = [] } = useStatesHierarchy();
  const saveMutation = useSaveCampTemplate();

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  const [form, setForm] = useState({
    name: '',
    organizerName: '',
    organizerPhone: '',
    organizerEmail: '',
    state: '',
    district: '',
    mandal: '',
    city: '',
    address: '',
    pinCode: '',
    selectedDoctors: [] as any[],
    selectedStaff: [] as typeof mockStaff,
    isActive: true,
  });

  // Load existing template for edit
  useEffect(() => {
    if (isEdit) {
      const tpl = templates.find((t) => t.id === id);
      if (tpl) {
        setForm({
          name: tpl.name,
          organizerName: tpl.organizerName,
          organizerPhone: tpl.organizerPhone,
          organizerEmail: tpl.organizerEmail || '',
          state: tpl.state,
          district: tpl.district,
          mandal: tpl.mandal,
          city: tpl.city || '',
          address: tpl.address,
          pinCode: tpl.pinCode || '',
          selectedDoctors: allDoctors.filter((d) => tpl.defaultDoctorIds.includes(d.id)),
          selectedStaff: mockStaff.filter((s) => tpl.defaultStaffIds.includes(s.id)),
          isActive: tpl.status === 'active',
        });
      }
    }
  }, [isEdit, id, templates, allDoctors]);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  const toggleDoctor = (doctor: any) => {
    if (form.selectedDoctors.find((d) => d.id === doctor.id)) {
      update('selectedDoctors', form.selectedDoctors.filter((d) => d.id !== doctor.id));
    } else {
      update('selectedDoctors', [...form.selectedDoctors, doctor]);
    }
  };

  const toggleStaff = (staff: any) => {
    if (form.selectedStaff.find((s) => s.id === staff.id)) {
      update('selectedStaff', form.selectedStaff.filter((s) => s.id !== staff.id));
    } else {
      update('selectedStaff', [...form.selectedStaff, staff]);
    }
  };

  // Dependent dropdowns
  const selectedState = statesHierarchy.find((s) => s.name === form.state);
  const districts = selectedState?.districts || [];
  const selectedDistrict = districts.find((d) => d.name === form.district);
  const mandals = selectedDistrict?.mandals || [];

  const filteredDoctors = allDoctors.filter((d) =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredStaff = mockStaff.filter((s) =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Validation Error', description: 'Camp name is required.', variant: 'destructive' });
      return;
    }
    const payload = {
      ...(isEdit ? { id } : {}),
      name: form.name,
      organizerName: form.organizerName,
      organizerPhone: form.organizerPhone,
      organizerEmail: form.organizerEmail,
      state: form.state,
      district: form.district,
      mandal: form.mandal,
      city: form.city,
      address: form.address,
      pinCode: form.pinCode,
      defaultDoctorIds: form.selectedDoctors.map((d) => d.id),
      defaultStaffIds: form.selectedStaff.map((s) => s.id),
      status: form.isActive ? 'active' : 'inactive',
    };
    try {
      await saveMutation.mutateAsync(payload);
      toast({ title: isEdit ? 'Template Updated' : 'Template Created', description: `${form.name} saved successfully.` });
      navigate('/camp-templates');
    } catch {
      toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/60 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-4 sm:px-6 lg:px-8 py-3 mb-6" style={{ boxShadow: '0 1px 8px hsl(var(--shadow-color) / 0.04)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/camp-templates')}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold text-foreground tracking-tight">
              {isEdit ? 'Edit Camp Template' : 'Create Camp Template'}
            </h1>
          </div>
          <Button onClick={handleSubmit} className="h-9 px-5">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isEdit ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section 1: Basic Info */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Camp Name *</Label>
                <Input placeholder="Enter camp template name" value={form.name} onChange={(e) => update('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organizer Name</Label>
                <Input placeholder="Enter organizer name" value={form.organizerName} onChange={(e) => update('organizerName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organizer Phone</Label>
                <Input type="tel" placeholder="Enter phone" value={form.organizerPhone} onChange={(e) => update('organizerPhone', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Organizer Email</Label>
                <Input type="email" placeholder="Enter email" value={form.organizerEmail} onChange={(e) => update('organizerEmail', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Location */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-4 w-4 text-accent" />
              </div>
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={form.state} onValueChange={(v) => { update('state', v); update('district', ''); update('mandal', ''); }}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {statesHierarchy.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>District</Label>
                <Select value={form.district} onValueChange={(v) => { update('district', v); update('mandal', ''); }} disabled={!form.state}>
                  <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mandal</Label>
                <Select value={form.mandal} onValueChange={(v) => update('mandal', v)} disabled={!form.district}>
                  <SelectTrigger><SelectValue placeholder="Select mandal" /></SelectTrigger>
                  <SelectContent>
                    {mandals.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>City/Village</Label>
                <Input placeholder="Enter city or village" value={form.city} onChange={(e) => update('city', e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Address</Label>
                <Textarea placeholder="Enter full address" value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} />
              </div>
              <div className="space-y-2">
                <Label>PIN Code</Label>
                <Input placeholder="Enter PIN code" value={form.pinCode} onChange={(e) => update('pinCode', e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Section 3: Default Doctors */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--stat-orange))]/20 flex items-center justify-center">
                  <Stethoscope className="h-4 w-4 text-[hsl(var(--stat-orange-text))]" />
                </div>
                Default Doctors ({form.selectedDoctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search doctors..."
                  className="pl-9 h-9"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                />
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto premium-scroll">
                {filteredDoctors.map((doctor) => {
                  const selected = form.selectedDoctors.some((d) => d.id === doctor.id);
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => toggleDoctor(doctor)}
                      className={cn(
                        'flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-all border',
                        selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold',
                          selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                        )}>
                          {doctor.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{doctor.name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.specialization}</p>
                        </div>
                      </div>
                      {selected && <Badge className="bg-primary/10 text-primary text-xs">Selected</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Default Staff */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2.5 text-base">
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--stat-teal))]/20 flex items-center justify-center">
                  <Users className="h-4 w-4 text-[hsl(var(--stat-teal-text))]" />
                </div>
                Default Staff ({form.selectedStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              {/* Selected Staff Badges */}
              {form.selectedStaff.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.selectedStaff.map((s) => (
                    <Badge key={s.id} variant="secondary" className="px-2.5 py-1 text-xs flex items-center gap-1.5">
                      {s.name}
                      <button onClick={() => toggleStaff(s)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}

              <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="mr-2 h-3.5 w-3.5" /> Select Staff Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" /> Select Staff
                    </DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search by name or role..."
                      className="pl-9 h-9"
                      value={staffSearch}
                      onChange={(e) => setStaffSearch(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto premium-scroll">
                    {filteredStaff.map((staff) => {
                      const selected = form.selectedStaff.some((s) => s.id === staff.id);
                      return (
                        <div
                          key={staff.id}
                          onClick={() => toggleStaff(staff)}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all border',
                            selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50'
                          )}
                        >
                          <div>
                            <p className="text-sm font-medium">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                          </div>
                          {selected && <Badge className="bg-primary/10 text-primary text-xs">✓</Badge>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    {form.selectedStaff.length} staff member(s) selected
                  </p>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Status Toggle */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="px-6 py-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Template Status</p>
              <p className="text-xs text-muted-foreground">Active templates can be used to create camp events</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn('text-sm font-medium', form.isActive ? 'text-[hsl(var(--stat-green-text))]' : 'text-muted-foreground')}>
                {form.isActive ? 'Active' : 'Inactive'}
              </span>
              <Switch checked={form.isActive} onCheckedChange={(v) => update('isActive', v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
