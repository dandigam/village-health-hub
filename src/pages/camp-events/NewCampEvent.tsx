import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
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
import { useCampTemplates, useDoctors, useCampEvents, useSaveCampEvent } from '@/hooks/useApiData';

const mockStaff = [
  { id: '1', name: 'Alice Johnson', role: 'Nurse' },
  { id: '2', name: 'Bob Smith', role: 'Volunteer' },
  { id: '3', name: 'Charlie Brown', role: 'Nurse' },
  { id: '4', name: 'David Wilson', role: 'Pharmacist' },
  { id: '5', name: 'Eva Martinez', role: 'Volunteer' },
];

export default function NewCampEvent() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedCampId = searchParams.get('campId');
  const { data: templates = [] } = useCampTemplates();
  const { data: allDoctors = [] } = useDoctors();
  const { data: allEvents = [] } = useCampEvents();
  const saveMutation = useSaveCampEvent();

  const activeTemplates = templates.filter((t) => t.active === true);

  const [templateSearch, setTemplateSearch] = useState('');
  const [staffModalOpen, setStaffModalOpen] = useState(false);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  const [form, setForm] = useState({
    campId: preselectedCampId || '',
    startDate: undefined as Date | undefined,
    endDate: undefined as Date | undefined,
    selectedDoctors: [] as any[],
    selectedStaff: [] as typeof mockStaff,
    location: '',
    state: '',
    district: '',
    mandal: '',
    city: '',
    address: '',
  });

  useEffect(() => {
    if (preselectedCampId) {
      update('campId', preselectedCampId);
    }
  }, [preselectedCampId]);

  useEffect(() => {
    if (templates.length > 0 && !preselectedCampId) {
      const firstActiveTemplate = templates.find((t) => t.active === true);
      if (firstActiveTemplate) {
        update('campId', firstActiveTemplate.id);
      }
    }
  }, [templates, preselectedCampId]);
  useEffect(() => {
    if (eventId && allEvents.length > 0) {
      const event = allEvents.find((e) => String(e.id) === String(eventId));
      if (event) {
        setForm({
          campId: event.campId || '',
          startDate: event.startDate ? new Date(event.startDate) : undefined,
          endDate: event.endDate ? new Date(event.endDate) : undefined,
          selectedDoctors: allDoctors.filter((d) => event.doctorsList?.includes(d.id)),
          selectedStaff: mockStaff.filter((s) => event.staffList?.includes(s.id)),
          location: event.location || '',
          state: event.state || '',
          district: event.district || '',
          mandal: event.mandal || '',
          city: event.city || '',
          address: event.address || '',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, allEvents, allDoctors]);

  const update = (field: string, value: any) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    if (form.campId) {
      const tpl = templates.find((t) => t.id === form.campId);
      if (tpl) {
        const doctorsList = tpl.doctorList || [];
        const defaultDoctors = allDoctors.filter((d) => doctorsList.includes(d.id));
        const staffList = tpl.staffList || [];
        const defaultStaff = mockStaff.filter((s) => staffList.includes(s.id));
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
  }, [form.campId, templates, allDoctors]);

  const selectedTemplate = templates.find((t) => t.id === form.campId);

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

  const filteredDoctors = allDoctors.filter((d) =>
    d.name.toLowerCase().includes(doctorSearch.toLowerCase())
  );

  const filteredStaff = mockStaff.filter((s) =>
    s.name.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!form.campId) {
      toast({ title: 'Validation Error', description: 'Please select a camp template.', variant: 'destructive' });
      return;
    }
    if (!form.startDate || !form.endDate) {
      toast({ title: 'Validation Error', description: 'Start and End dates are required.', variant: 'destructive' });
      return;
    }
    if (form.startDate > form.endDate) {
      toast({ title: 'Validation Error', description: 'Start date cannot be after end date.', variant: 'destructive' });
      return;
    }

    const payload = {
      id: eventId,
      campId: form.campId,
      campName: selectedTemplate?.campName,
      location: form.location,
      state: form.state,
      district: form.district,
      mandal: form.mandal,
      city: form.city,
      address: form.address,
      startDate: format(form.startDate, 'yyyy-MM-dd'),
      endDate: format(form.endDate, 'yyyy-MM-dd'),
      doctorsList: form.selectedDoctors.map((d) => d.id),
      staffList: form.selectedStaff.map((s) => s.id),
      status: 'planned',
    };

    try {
      await saveMutation.mutateAsync(payload);
      toast({ title: eventId ? 'Camp Event Updated' : 'Camp Event Created', description: `Event for ${selectedTemplate?.campName} ${eventId ? 'updated' : 'created'} successfully.` });
      navigate('/camp-events');
    } catch {
      toast({ title: 'Error', description: `Failed to ${eventId ? 'update' : 'create'} camp event.`, variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur-sm border-b border-border/60 -mx-3 sm:-mx-4 lg:-mx-6 -mt-3 sm:-mt-4 lg:-mt-6 px-4 sm:px-6 lg:px-8 py-2.5 mb-4" style={{ boxShadow: '0 1px 8px hsl(var(--shadow-color) / 0.04)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => navigate('/camp-events')}>
              <X className="h-4 w-4" />
            </Button>
            <h1 className="text-base font-bold text-foreground tracking-tight">{eventId ? 'Edit Camp Event' : 'Create Camp Event'}</h1>
          </div>
          <Button onClick={handleSubmit} className="h-8 px-4 text-xs">
            <Save className="mr-1.5 h-3.5 w-3.5" /> {eventId ? 'Save Changes' : 'Create Event'}
          </Button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto space-y-3">
        {/* Template Selection */}
        {!eventId ? (
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Tent className="h-3.5 w-3.5 text-primary" />
                </div>
                Select Camp Template
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 py-3.5">
              <Command className="rounded-lg border">
                <CommandInput placeholder="Search templates..." value={templateSearch} onValueChange={setTemplateSearch} className="h-8" />
                <CommandList className="max-h-36">
                  <CommandEmpty>No templates found.</CommandEmpty>
                  <CommandGroup>
                    {activeTemplates
                      .filter((t) => (t.campName || '').toLowerCase().includes(templateSearch.toLowerCase()))
                      .map((tpl) => (
                        <CommandItem
                          key={tpl.id}
                          onSelect={() => { update('campId', tpl.id); setTemplateSearch(''); }}
                          className={cn('cursor-pointer', form.campId === tpl.id && 'bg-primary/5')}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div>
                              <p className="text-sm font-medium">{tpl.campName}</p>
                              <p className="text-[10px] text-muted-foreground">{tpl.mandal}, {tpl.district}</p>
                            </div>
                            {form.campId === tpl.id && <Badge className="bg-primary/10 text-primary text-[10px]">Selected</Badge>}
                          </div>
                        </CommandItem>
                      ))}
                  </CommandGroup>
                </CommandList>
              </Command>
              {selectedTemplate && (
                <div className="mt-3 p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <p className="text-xs font-medium text-foreground">{selectedTemplate.campName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedTemplate.mandal}, {selectedTemplate.district}, {selectedTemplate.state} · Organizer: {selectedTemplate.organizerName}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          selectedTemplate && (
            <Card className="border-border/50 shadow-sm">
              <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Tent className="h-3.5 w-3.5 text-primary" />
                  </div>
                  Camp Template
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 py-3.5">
                <div className="p-2.5 rounded-lg bg-muted/40 border border-border/40">
                  <p className="text-sm font-bold text-foreground">{selectedTemplate.campName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {selectedTemplate.mandal}, {selectedTemplate.district}, {selectedTemplate.state} · Organizer: {selectedTemplate.organizerName}
                  </p>
                </div>
              </CardContent>
            </Card>
          )
        )}

        {/* Dates */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
            <CardTitle className="flex items-center gap-2 text-sm">
              <div className="h-7 w-7 rounded-lg bg-[hsl(var(--stat-blue))]/20 flex items-center justify-center">
                <CalendarIcon className="h-3.5 w-3.5 text-[hsl(var(--stat-blue-text))]" />
              </div>
              Event Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-5 py-3.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
              <div className="space-y-1">
                <Label className="text-xs">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal h-8 text-sm', !form.startDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {form.startDate ? format(form.startDate, 'PPP') : 'Select start date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar mode="single" selected={form.startDate} onSelect={(d) => update('startDate', d)} initialFocus className="p-3 pointer-events-auto" />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className={cn('w-full justify-start text-left font-normal h-8 text-sm', !form.endDate && 'text-muted-foreground')}>
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Doctors */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Stethoscope className="h-3.5 w-3.5 text-[hsl(var(--stat-orange-text))]" />
                Doctors ({form.selectedDoctors.length})
                {selectedTemplate && <span className="text-[10px] text-muted-foreground font-normal ml-auto">Pre-filled</span>}
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
                    <div key={doctor.id} onClick={() => toggleDoctor(doctor)} className={cn('flex items-center justify-between p-1.5 rounded-lg cursor-pointer transition-all border text-xs', selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50')}>
                      <span className="font-medium">{doctor.name}</span>
                      {selected && <Badge className="bg-primary/10 text-primary text-[9px] px-1.5 py-0">✓</Badge>}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Staff */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-2.5 pt-3.5 px-5 border-b border-border/40">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Users className="h-3.5 w-3.5 text-[hsl(var(--stat-teal-text))]" />
                Staff ({form.selectedStaff.length})
                {selectedTemplate && <span className="text-[10px] text-muted-foreground font-normal ml-auto">Pre-filled</span>}
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
                    <Users className="mr-1.5 h-3 w-3" /> Add/Remove Staff
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Select Staff</DialogTitle>
                  </DialogHeader>
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <Input placeholder="Search..." className="pl-9 h-8" value={staffSearch} onChange={(e) => setStaffSearch(e.target.value)} />
                  </div>
                  <div className="space-y-1 max-h-64 overflow-y-auto premium-scroll">
                    {filteredStaff.map((staff) => {
                      const selected = form.selectedStaff.some((s) => s.id === staff.id);
                      return (
                        <div key={staff.id} onClick={() => toggleStaff(staff)} className={cn('flex items-center justify-between p-2 rounded-lg cursor-pointer border', selected ? 'bg-primary/5 border-primary/30' : 'border-transparent hover:bg-muted/50')}>
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
