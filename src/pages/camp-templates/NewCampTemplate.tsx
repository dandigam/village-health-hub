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
import { useCampTemplate } from '@/hooks/useCampTemplate';

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
  const { data: statesHierarchy = [] } = useStatesHierarchy();
  const { data: editTemplate, isLoading } = useCampTemplate(isEdit ? id : undefined);
  const saveMutation = useSaveCampTemplate();

  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [doctorSearch, setDoctorSearch] = useState('');

  const [form, setForm] = useState({
    campId: '',
    campName: '',
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
    active: true,
  });

  // Load existing template for edit
  useEffect(() => {
    if (isEdit && editTemplate) {
      setForm({
        campName: editTemplate.campName || '',
        organizerName: editTemplate.organizerName || '',
        organizerPhone: editTemplate.organizerPhone || '',
        organizerEmail: editTemplate.organizerEmail || '',
        state: editTemplate.state || '',
        district: editTemplate.district || '',
        mandal: editTemplate.mandal || '',
        city: editTemplate.city || '',
        address: editTemplate.address || '',
        pinCode: editTemplate.pinCode || '',
        selectedDoctors: allDoctors.filter((d) => Array.isArray(editTemplate.doctorsList) && editTemplate.doctorsList.includes(d.id)),
        selectedStaff: mockStaff.filter((s) => Array.isArray(editTemplate.staffList) && editTemplate.staffList.includes(s.id)),
        active: typeof editTemplate.active === 'boolean' ? editTemplate.active : (editTemplate.status === 'active'),
      });
    }
  }, [isEdit, id, editTemplate, allDoctors]);

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
    if (!form.campName.trim()) {
      toast({ title: 'Validation Error', description: 'Camp name is required.', variant: 'destructive' });
      return;
    }
    const payload = {
      ...(isEdit ? { id } : {}),
      campName: form.campName,
      organizerName: form.organizerName,
      organizerPhone: form.organizerPhone,
      organizerEmail: form.organizerEmail,
      state: form.state,
      district: form.district,
      mandal: form.mandal,
      city: form.city,
      address: form.address,
      pinCode: form.pinCode,
      campId: form.campId,
      doctorsList: form.selectedDoctors.map((d) => d.id),
      staffList: form.selectedStaff.map((s) => s.id),
      active: form.active,
    };
    try {
      await saveMutation.mutateAsync(payload);
      toast({ title: isEdit ? 'Template Updated' : 'Template Created', description: `${form.campName} saved successfully.` });
      navigate('/camp-templates');
    } catch {
      toast({ title: 'Error', description: 'Failed to save template.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/60 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-4 sm:px-6 lg:px-8 py-2.5 mb-4" style={{ boxShadow: '0 1px 8px hsl(var(--shadow-color) / 0.04)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/camp-templates')}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold text-foreground tracking-tight">
              {isEdit ? 'Edit Camp Template' : 'Create Camp Template'}
            </h1>
          </div>
          <Button onClick={handleSubmit} className="h-8 px-4 text-xs">
            <Save className="mr-1.5 h-3.5 w-3.5" />
            {isEdit ? 'Update Template' : 'Save Template'}
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {/* Section 1: Basic Info */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-primary" />
              </div>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Camp Name *</Label>
                <Input placeholder="Enter camp template name" value={form.campName} onChange={(e) => update('campName', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Organizer Name</Label>
                <Input placeholder="Enter organizer name" value={form.organizerName} onChange={(e) => update('organizerName', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Organizer Phone</Label>
                <Input type="tel" placeholder="Enter phone" value={form.organizerPhone} onChange={(e) => update('organizerPhone', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Organizer Email</Label>
                <Input type="email" placeholder="Enter email" value={form.organizerEmail} onChange={(e) => update('organizerEmail', e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Section 2: Location */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
                <MapPin className="h-3.5 w-3.5 text-accent" />
              </div>
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-3.5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label className="text-xs">State</Label>
                <Select value={form.state} onValueChange={(v) => { update('state', v); update('district', ''); update('mandal', ''); }}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {statesHierarchy.map((s) => <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">District</Label>
                <Select value={form.district} onValueChange={(v) => { update('district', v); update('mandal', ''); }} disabled={!form.state}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select district" /></SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Mandal</Label>
                <Select value={form.mandal} onValueChange={(v) => update('mandal', v)} disabled={!form.district}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select mandal" /></SelectTrigger>
                  <SelectContent>
                    {mandals.map((m) => <SelectItem key={m.id} value={m.name}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">City/Village</Label>
                <Input placeholder="Enter city or village" value={form.city} onChange={(e) => update('city', e.target.value)} className="h-8 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">PIN Code</Label>
                <Input placeholder="Enter PIN code" value={form.pinCode} onChange={(e) => update('pinCode', e.target.value)} className="h-8 text-sm" />
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Label className="text-xs">Address</Label>
              <Textarea placeholder="Enter full address" value={form.address} onChange={(e) => update('address', e.target.value)} rows={2} className="text-sm" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Section 3: Default Doctors */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-lg bg-[hsl(var(--stat-orange))]/20 flex items-center justify-center">
                  <Stethoscope className="h-3.5 w-3.5 text-[hsl(var(--stat-orange-text))]" />
                </div>
                Default Doctors ({form.selectedDoctors.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-3">
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input placeholder="Search doctors..." className="pl-9 h-8 text-xs" value={doctorSearch} onChange={(e) => setDoctorSearch(e.target.value)} />
              </div>
              <div className="space-y-0.5 max-h-40 overflow-y-auto premium-scroll">
                {filteredDoctors.map((doctor) => {
                  const selected = form.selectedDoctors.some((d) => d.id === doctor.id);
                  return (
                    <div key={doctor.id} onClick={() => toggleDoctor(doctor)} className={cn('flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all border', selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50')}>
                      <div className="flex items-center gap-2">
                        <div className={cn('w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-semibold', selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground')}>
                          {doctor.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-xs font-medium leading-tight">{doctor.name}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{doctor.specialization}</p>
                        </div>
                      </div>
                      {selected && <Badge className="bg-primary/10 text-primary text-[9px] px-1.5 py-0">✓</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Section 4: Default Staff */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-lg bg-[hsl(var(--stat-teal))]/20 flex items-center justify-center">
                  <Users className="h-3.5 w-3.5 text-[hsl(var(--stat-teal-text))]" />
                </div>
                Default Staff ({form.selectedStaff.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-3">
              {form.selectedStaff.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {form.selectedStaff.map((s) => (
                    <Badge key={s.id} variant="secondary" className="px-1.5 py-0.5 text-[10px] flex items-center gap-1">
                      {s.name}
                      <button onClick={() => toggleStaff(s)} className="hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full h-8 text-xs">
                    <Users className="mr-1.5 h-3 w-3" /> Select Staff Members
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Select Staff</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search by name or role..." className="pl-9 h-8" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} />
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto premium-scroll">
                    {filteredStaff.map((staff) => {
                      const selected = form.selectedStaff.some((s) => s.id === staff.id);
                      return (
                        <div key={staff.id} onClick={() => toggleStaff(staff)} className={cn('flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border', selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50')}>
                          <div>
                            <p className="text-sm font-medium">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{staff.role}</p>
                          </div>
                          {selected && <Badge className="bg-primary/10 text-primary text-xs">✓</Badge>}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground text-center mt-1">{form.selectedStaff.length} staff member(s) selected</p>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        {/* Status Toggle */}
        <Card className="border-border/50 shadow-sm">
          <CardContent className="px-5 py-3 flex items-center justify-between">
            <div>
              <p className="font-medium text-xs">Template Status</p>
              <p className="text-[10px] text-muted-foreground">Active templates can be used to create camp events</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={cn('text-xs font-medium', form.active ? 'text-[hsl(var(--stat-green-text))]' : 'text-muted-foreground')}>
                {form.active ? 'Active' : 'Inactive'}
              </span>
              <Switch checked={form.active} onCheckedChange={(v) => update('active', v)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
