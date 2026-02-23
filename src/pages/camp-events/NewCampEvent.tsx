import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Save, X, CalendarIcon, Search, Stethoscope, Users, Tent } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useCampTemplates, useDoctors, useSaveCampEvent } from '@/hooks/useApiData';

const mockStaff = [
  { id: '1', name: 'Alice Johnson', role: 'Nurse' },
  { id: '2', name: 'Bob Smith', role: 'Volunteer' },
  { id: '3', name: 'Charlie Brown', role: 'Nurse' },
  { id: '4', name: 'David Wilson', role: 'Pharmacist' },
  { id: '5', name: 'Eva Martinez', role: 'Volunteer' },
];

export default function NewCampEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedTemplateId = searchParams.get('templateId');
  const { data: templates = [] } = useCampTemplates();
  const { data: allDoctors = [] } = useDoctors();
  const saveMutation = useSaveCampEvent();

  const activeTemplates = templates.filter((t) => t.status === 'active');

  const [templateSearch, setTemplateSearch] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');

  const [form, setForm] = useState({
    templateId: preselectedTemplateId || '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    selectedDoctors: [] as any[],
    selectedStaff: [] as typeof mockStaff,
    // Auto-filled from template
    location: '',
    state: '',
    district: '',
    mandal: '',
    city: '',
    address: '',
  });

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  // Auto-fill when template selected
  useEffect(() => {
    if (form.templateId) {
      const tpl = templates.find((t) => t.id === form.templateId);
      if (tpl) {
        const defaultDoctors = allDoctors.filter((d) => tpl.defaultDoctorIds?.includes(d.id));
        const defaultStaff = mockStaff.filter((s) => tpl.defaultStaffIds?.includes(s.id));
        setForm((prev) => ({
          ...prev,
          state: tpl.state,
          district: tpl.district,
          mandal: tpl.mandal,
          city: tpl.city || '',
          address: tpl.address,
          location: `${tpl.mandal}, ${tpl.district}`,
          selectedDoctors: defaultDoctors,
          selectedStaff: defaultStaff,
        }));
      }
    }
  }, [form.templateId, templates, allDoctors]);

  const selectedTemplate = templates.find((t) => t.id === form.templateId);

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

  const filteredStaff = mockStaff.filter((s) =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.templateId) {
      toast({ title: 'Validation Error', description: 'Please select a camp template.', variant: 'destructive' });
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast({ title: 'Validation Error', description: 'Start and End dates are required.', variant: 'destructive' });
      return;
    }
    if (form.endDate < form.startDate) {
      toast({ title: 'Validation Error', description: 'End date must be after start date.', variant: 'destructive' });
      return;
    }

    const payload = {
      templateId: form.templateId,
      templateName: selectedTemplate?.name,
      location: form.location,
      state: form.state,
      district: form.district,
      mandal: form.mandal,
      city: form.city,
      address: form.address,
      startDate: format(form.startDate, 'yyyy-MM-dd'),
      endDate: format(form.endDate, 'yyyy-MM-dd'),
      doctorIds: form.selectedDoctors.map((d) => d.id),
      staffIds: form.selectedStaff.map((s) => s.id),
      status: 'planned',
    };

    try {
      await saveMutation.mutateAsync(payload);
      toast({ title: 'Camp Event Created', description: `Event for ${selectedTemplate?.name} created successfully.` });
      navigate('/camp-events');
    } catch {
      toast({ title: 'Error', description: 'Failed to create camp event.', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/60 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-4 sm:px-6 lg:px-8 py-3 mb-6" style={{ boxShadow: '0 1px 8px hsl(var(--shadow-color) / 0.04)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/camp-events')}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-bold text-foreground tracking-tight">Create Camp Event</h1>
          </div>
          <Button onClick={handleSubmit} className="h-9 px-5">
            <Save className="mr-1.5 h-3.5 w-3.5" /> Create Event
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Template Selection */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Tent className="h-4 w-4 text-primary" />
              </div>
              Select Camp Template
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <Command className="rounded-lg border">
              <CommandInput placeholder="Search templates..." value={templateSearch} onValueChange={setTemplateSearch} />
              <CommandList className="max-h-40">
                <CommandEmpty>No templates found.</CommandEmpty>
                <CommandGroup>
                  {activeTemplates
                    .filter((t) => t.name.toLowerCase().includes(templateSearch.toLowerCase()))
                    .map((tpl) => (
                      <CommandItem
                        key={tpl.id}
                        onSelect={() => { update('templateId', tpl.id); setTemplateSearch(''); }}
                        className={cn('cursor-pointer', form.templateId === tpl.id && 'bg-primary/5')}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <p className="font-medium">{tpl.name}</p>
                            <p className="text-xs text-muted-foreground">{tpl.mandal}, {tpl.district}</p>
                          </div>
                          {form.templateId === tpl.id && <Badge className="bg-primary/10 text-primary text-xs">Selected</Badge>}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </Command>

            {selectedTemplate && (
              <div className="mt-4 p-3 rounded-lg bg-muted/40 border border-border/40">
                <p className="text-sm font-medium text-foreground">{selectedTemplate.name}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedTemplate.mandal}, {selectedTemplate.district}, {selectedTemplate.state} · Organizer: {selectedTemplate.organizerName}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dates */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
            <CardTitle className="flex items-center gap-2.5 text-base">
              <div className="h-8 w-8 rounded-lg bg-[hsl(var(--stat-blue))]/20 flex items-center justify-center">
                <CalendarIcon className="h-4 w-4 text-[hsl(var(--stat-blue-text))]" />
              </div>
              Event Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.startDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.startDate ? format(form.startDate, 'PPP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.startDate} onSelect={(d) => update('startDate', d)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal', !form.endDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {form.endDate ? format(form.endDate, 'PPP') : 'Select end date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.endDate} onSelect={(d) => update('endDate', d)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Doctors & Staff */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Doctors */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2.5 text-sm">
                <Stethoscope className="h-4 w-4 text-[hsl(var(--stat-orange-text))]" />
                Doctors ({form.selectedDoctors.length})
                {selectedTemplate && <span className="text-xs text-muted-foreground font-normal ml-auto">Pre-filled from template</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              <div className="space-y-1.5 max-h-48 overflow-y-auto premium-scroll">
                {allDoctors.map((doctor) => {
                  const selected = form.selectedDoctors.some((d) => d.id === doctor.id);
                  return (
                    <div
                      key={doctor.id}
                      onClick={() => toggleDoctor(doctor)}
                      className={cn(
                        'flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border text-sm',
                        selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50'
                      )}
                    >
                      <span className="font-medium">{doctor.name}</span>
                      {selected && <Badge className="bg-primary/10 text-primary text-[10px]">✓</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/40">
              <CardTitle className="flex items-center gap-2.5 text-sm">
                <Users className="h-4 w-4 text-[hsl(var(--stat-teal-text))]" />
                Staff ({form.selectedStaff.length})
                {selectedTemplate && <span className="text-xs text-muted-foreground font-normal ml-auto">Pre-filled</span>}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 py-5">
              {form.selectedStaff.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {form.selectedStaff.map((s) => (
                    <Badge key={s.id} variant="secondary" className="px-2 py-1 text-xs flex items-center gap-1">
                      {s.name}
                      <button onClick={() => toggleStaff(s)} className="hover:text-destructive"><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              )}
              <Dialog open={staffModalOpen} onOpenChange={setStaffModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full">
                    <Users className="mr-2 h-3.5 w-3.5" /> Add/Remove Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Select Staff</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 h-9" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} />
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto premium-scroll">
                    {filteredStaff.map((staff) => {
                      const selected = form.selectedStaff.some((s) => s.id === staff.id);
                      return (
                        <div key={staff.id} onClick={() => toggleStaff(staff)} className={cn('flex items-center justify-between p-3 rounded-lg cursor-pointer border', selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50')}>
                          <div><p className="text-sm font-medium">{staff.name}</p><p className="text-xs text-muted-foreground">{staff.role}</p></div>
                          {selected && <Badge className="bg-primary/10 text-primary text-xs">✓</Badge>}
                        </div>
                      );
                    })}
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
