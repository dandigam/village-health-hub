import { useState, useEffect, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Eye, Warehouse as WarehouseIcon, MapPin, Phone, Mail, User, Search } from 'lucide-react';
import { useStatesHierarchy } from '@/hooks/useApiData';
import api from '@/services/api';

interface WarehouseRecord {
  id?: number;
  name: string;
  email: string;
  phoneNumber: string;
  authorizedPerson: string;
  licenceNumber: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  pinCode: string;
}

const emptyWarehouse: WarehouseRecord = {
  name: '', email: '', phoneNumber: '', authorizedPerson: '', licenceNumber: '',
  state: '', district: '', mandal: '', village: '', pinCode: '',
};

export default function WarehouseManagement() {
  const [warehouses, setWarehouses] = useState<WarehouseRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseRecord | null>(null);
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseRecord | null>(null);
  const [form, setForm] = useState<WarehouseRecord>({ ...emptyWarehouse });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: statesHierarchy = [] } = useStatesHierarchy();

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await api.get<WarehouseRecord[]>('/warehouses', []);
        if (data.data && Array.isArray(data.data)) {
          setWarehouses(data.data);
        }
      } catch (e) {
        // fallback empty
      }
    };
    fetchWarehouses();
  }, []);

  // Derived location data
  const selectedState = useMemo(() => statesHierarchy.find(s => String(s.id) === form.state || s.name === form.state), [statesHierarchy, form.state]);
  const availableDistricts = useMemo(() => selectedState?.districts ?? [], [selectedState]);
  const selectedDistrict = useMemo(() => availableDistricts.find(d => String(d.id) === form.district || d.name === form.district), [availableDistricts, form.district]);
  const availableMandals = useMemo(() => selectedDistrict?.mandals ?? [], [selectedDistrict]);

  const filteredWarehouses = useMemo(() => {
    if (!searchTerm) return warehouses;
    const term = searchTerm.toLowerCase();
    return warehouses.filter(w =>
      w.name.toLowerCase().includes(term) ||
      w.authorizedPerson.toLowerCase().includes(term) ||
      w.village.toLowerCase().includes(term)
    );
  }, [warehouses, searchTerm]);

  const openCreateDialog = () => {
    setEditingWarehouse(null);
    setForm({ ...emptyWarehouse });
    setDialogOpen(true);
  };

  const openEditDialog = (wh: WarehouseRecord) => {
    setEditingWarehouse(wh);
    setForm({ ...wh });
    setDialogOpen(true);
  };

  const openDeleteDialog = (wh: WarehouseRecord) => {
    setDeletingWarehouse(wh);
    setDeleteDialogOpen(true);
  };

  const updateForm = (field: keyof WarehouseRecord, value: string) => {
    const newForm = { ...form, [field]: value };
    if (field === 'state') {
      newForm.district = '';
      newForm.mandal = '';
    }
    if (field === 'district') {
      newForm.mandal = '';
    }
    setForm(newForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.authorizedPerson || !form.phoneNumber) {
      toast.error('Please fill required fields: Name, Authorized Person, Phone');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingWarehouse?.id) {
        await api.put(`/warehouses/${editingWarehouse.id}`, form);
        setWarehouses(prev => prev.map(w => w.id === editingWarehouse.id ? { ...form, id: editingWarehouse.id } : w));
        toast.success('Warehouse updated successfully');
      } else {
        const result = await api.post<WarehouseRecord>('/warehouses', form);
        const newWh = result || { ...form, id: Date.now() };
        setWarehouses(prev => [...prev, newWh as WarehouseRecord]);
        toast.success('Warehouse created successfully');
      }
      setDialogOpen(false);
    } catch (e) {
      toast.error('Failed to save warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingWarehouse) return;
    try {
      if (deletingWarehouse.id) {
        await api.delete(`/warehouses/${deletingWarehouse.id}`);
      }
      setWarehouses(prev => prev.filter(w => w.id !== deletingWarehouse.id));
      toast.success(`${deletingWarehouse.name} deleted`);
      setDeleteDialogOpen(false);
      setDeletingWarehouse(null);
    } catch (e) {
      toast.error('Failed to delete warehouse');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <WarehouseIcon className="h-5 w-5 text-accent" />
              Warehouse Management
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">{warehouses.length} warehouses registered</p>
          </div>
          <Button size="sm" className="bg-accent hover:bg-accent/90" onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" />
            Add Warehouse
          </Button>
        </div>

        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search warehouses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Name</TableHead>
                <TableHead>Authorized Person</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Licence #</TableHead>
                <TableHead className="text-right w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWarehouses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-muted-foreground">
                    No warehouses found. Click "Add Warehouse" to create one.
                  </TableCell>
                </TableRow>
              ) : (
                filteredWarehouses.map((wh, idx) => (
                  <TableRow key={wh.id || idx}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-md bg-accent/10 shrink-0">
                          <WarehouseIcon className="h-3.5 w-3.5 text-accent" />
                        </div>
                        <span className="font-medium text-sm">{wh.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm flex items-center gap-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        {wh.authorizedPerson || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="text-xs flex items-center gap-1 text-muted-foreground">
                          <Phone className="h-3 w-3" /> {wh.phoneNumber || '—'}
                        </span>
                        {wh.email && (
                          <span className="text-xs flex items-center gap-1 text-muted-foreground">
                            <Mail className="h-3 w-3" /> {wh.email}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[wh.village, wh.mandal, wh.district, wh.state].filter(Boolean).join(', ') || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">{wh.licenceNumber || '—'}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEditDialog(wh)} title="Edit">
                          <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openDeleteDialog(wh)} title="Delete">
                          <Trash2 className="h-3.5 w-3.5 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}</DialogTitle>
            <DialogDescription>Fill in warehouse details below.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 p-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Name <span className="text-destructive">*</span></Label>
                  <Input value={form.name} onChange={e => updateForm('name', e.target.value)} className="h-9 text-sm" placeholder="Warehouse name" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Authorized Person <span className="text-destructive">*</span></Label>
                  <Input value={form.authorizedPerson} onChange={e => updateForm('authorizedPerson', e.target.value)} className="h-9 text-sm" placeholder="Contact person" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={form.email} onChange={e => updateForm('email', e.target.value)} className="h-9 text-sm" placeholder="email@example.com" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone <span className="text-destructive">*</span></Label>
                  <Input type="tel" value={form.phoneNumber} onChange={e => updateForm('phoneNumber', e.target.value)} className="h-9 text-sm" placeholder="Phone number" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Licence Number</Label>
                <Input value={form.licenceNumber} onChange={e => updateForm('licenceNumber', e.target.value)} className="h-9 text-sm" placeholder="Licence number" />
              </div>

              {/* Location */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-sm font-medium">Location</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">State</Label>
                    <Select value={form.state || undefined} onValueChange={(v) => updateForm('state', v)}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select State" />
                      </SelectTrigger>
                      <SelectContent>
                        {statesHierarchy.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">District</Label>
                    <Select value={form.district || undefined} onValueChange={(v) => updateForm('district', v)} disabled={!form.state}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select District" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableDistricts.map(d => (
                          <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mandal</Label>
                    <Select value={form.mandal || undefined} onValueChange={(v) => updateForm('mandal', v)} disabled={!form.district}>
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue placeholder="Select Mandal" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMandals.map(m => (
                          <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Village / City</Label>
                    <Input value={form.village} onChange={e => updateForm('village', e.target.value)} className="h-9 text-sm" placeholder="Village/City" />
                  </div>
                </div>
                <div className="space-y-1 mt-3">
                  <Label className="text-xs">Pin Code</Label>
                  <Input value={form.pinCode} onChange={e => updateForm('pinCode', e.target.value)} className="h-9 text-sm w-1/2" placeholder="Pin code" />
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button className="bg-accent hover:bg-accent/90" onClick={handleSave} disabled={isSubmitting}>
              {editingWarehouse ? 'Update' : 'Create'} Warehouse
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Warehouse</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{deletingWarehouse?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
