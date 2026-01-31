import { useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  IdCard,
  ArrowLeft,
  Printer,
  Download,
  QrCode,
  Phone,
  Stethoscope,
  Users,
  UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCamps, mockDoctors } from '@/data/mockData';
import { IDCardPreview } from '@/components/settings/IDCardPreview';

// Mock volunteers and staff data
const mockVolunteers = [
  { id: 'v1', name: 'Ramesh Kumar', phone: '+91 98765 43211', photoUrl: '', department: 'Registration' },
  { id: 'v2', name: 'Lakshmi Devi', phone: '+91 98765 43212', photoUrl: '', department: 'Patient Care' },
  { id: 'v3', name: 'Suresh Reddy', phone: '+91 98765 43213', photoUrl: '', department: 'Logistics' },
];

const mockStaff = [
  { id: 's1', name: 'Priya Sharma', phone: '+91 98765 43214', photoUrl: '', department: 'Administration' },
  { id: 's2', name: 'Anil Kumar', phone: '+91 98765 43215', photoUrl: '', department: 'IT Support' },
  { id: 's3', name: 'Meena Rani', phone: '+91 98765 43216', photoUrl: '', department: 'Finance' },
];

export default function IDCardPrintouts() {
  const navigate = useNavigate();
  const [selectedCamp, setSelectedCamp] = useState(mockCamps[0]?.id || '');
  const [selectedTab, setSelectedTab] = useState('doctors');
  const [showQRCode, setShowQRCode] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const currentCamp = mockCamps.find(c => c.id === selectedCamp);

  const getDataForTab = () => {
    switch (selectedTab) {
      case 'doctors':
        return mockDoctors.map(d => ({
          id: d.id,
          name: d.name,
          role: 'Doctor',
          department: d.specialization,
          phone: d.phone,
          photoUrl: d.photoUrl || '',
          idNumber: `DOC-${d.id.slice(-4).toUpperCase()}`,
        }));
      case 'volunteers':
        return mockVolunteers.map(v => ({
          id: v.id,
          name: v.name,
          role: 'Volunteer',
          department: v.department,
          phone: v.phone,
          photoUrl: v.photoUrl,
          idNumber: `VOL-${v.id.slice(-4).toUpperCase()}`,
        }));
      case 'staff':
        return mockStaff.map(s => ({
          id: s.id,
          name: s.name,
          role: 'Staff',
          department: s.department,
          phone: s.phone,
          photoUrl: s.photoUrl,
          idNumber: `STF-${s.id.slice(-4).toUpperCase()}`,
        }));
      default:
        return [];
    }
  };

  const data = getDataForTab();

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedItems.length === data.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(d => d.id));
    }
  };

  const handlePrintSelected = () => {
    const printContent = document.getElementById('print-area');
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>ID Cards - ${currentCamp?.name || 'Camp'}</title>
              <style>
                @page { size: A4; margin: 10mm; }
                body { font-family: system-ui, -apple-system, sans-serif; }
                .id-card-grid { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
                .id-card { width: 240px; border: 2px solid #e5e7eb; border-radius: 12px; overflow: hidden; page-break-inside: avoid; }
                .id-card-header { padding: 12px; text-align: center; color: white; }
                .id-card-header.doctor { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
                .id-card-header.volunteer { background: linear-gradient(135deg, #22c55e, #16a34a); }
                .id-card-header.staff { background: linear-gradient(135deg, #a855f7, #7c3aed); }
                .id-card-body { padding: 16px; text-align: center; background: white; }
                .avatar { width: 80px; height: 80px; border-radius: 50%; background: #e5e7eb; margin: 0 auto 12px; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; color: #6b7280; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
                .role { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
                .department { font-size: 11px; background: #f3f4f6; padding: 4px 8px; border-radius: 4px; display: inline-block; margin-bottom: 8px; }
                .id-number { font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .phone { font-size: 11px; color: #6b7280; }
                .validity { font-size: 10px; color: #9ca3af; margin-top: 8px; padding-top: 8px; border-top: 1px solid #e5e7eb; }
                .qr-placeholder { width: 60px; height: 60px; background: #f3f4f6; margin: 8px auto; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #9ca3af; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'doctor';
      case 'volunteer': return 'volunteer';
      case 'staff': return 'staff';
      default: return 'staff';
    }
  };

  const getAccentColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'bg-blue-500';
      case 'volunteer': return 'bg-green-500';
      case 'staff': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getAccentBorder = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'border-blue-200';
      case 'volunteer': return 'border-green-200';
      case 'staff': return 'border-purple-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <IdCard className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">ID Card & Tag Printouts</h1>
                  <p className="text-sm text-muted-foreground">Generate and print ID cards for camp doctors, volunteers, and staff</p>
                </div>
              </div>
            </div>

            {/* Controls Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  {/* Camp Selection */}
                  <div className="flex items-center gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Select Camp</Label>
                      <Select value={selectedCamp} onValueChange={setSelectedCamp}>
                        <SelectTrigger className="w-[280px]">
                          <SelectValue placeholder="Select a camp" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockCamps.map(camp => (
                            <SelectItem key={camp.id} value={camp.id}>
                              {camp.name} – {camp.location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Toggle Options */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="show-qr" 
                        checked={showQRCode} 
                        onCheckedChange={setShowQRCode}
                      />
                      <Label htmlFor="show-qr" className="text-sm">Show QR Code</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch 
                        id="show-contact" 
                        checked={showContact} 
                        onCheckedChange={setShowContact}
                      />
                      <Label htmlFor="show-contact" className="text-sm">Show Contact</Label>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      onClick={handlePrintSelected}
                      disabled={selectedItems.length === 0}
                      className="gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print Selected ({selectedItems.length})
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedItems(data.map(d => d.id));
                        setTimeout(handlePrintSelected, 100);
                      }}
                      className="gap-2"
                    >
                      <Printer className="h-4 w-4" />
                      Print All
                    </Button>
                    <Button className="gap-2">
                      <Download className="h-4 w-4" />
                      Download PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role Tabs */}
            <Tabs value={selectedTab} onValueChange={(v) => { setSelectedTab(v); setSelectedItems([]); }}>
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="doctors" className="gap-2">
                  <Stethoscope className="h-4 w-4" />
                  Doctors
                </TabsTrigger>
                <TabsTrigger value="volunteers" className="gap-2">
                  <Users className="h-4 w-4" />
                  Volunteers
                </TabsTrigger>
                <TabsTrigger value="staff" className="gap-2">
                  <UserCheck className="h-4 w-4" />
                  Staff
                </TabsTrigger>
              </TabsList>

              <div className="mt-4">
                {/* Select All */}
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox 
                    id="select-all"
                    checked={selectedItems.length === data.length && data.length > 0}
                    onCheckedChange={selectAll}
                  />
                  <Label htmlFor="select-all" className="text-sm cursor-pointer">
                    Select All ({data.length} {selectedTab})
                  </Label>
                </div>

                {/* ID Cards Grid */}
                <div id="print-area" className="id-card-grid">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {data.map((person) => (
                      <div key={person.id} className="relative">
                        {/* Selection Checkbox */}
                        <div className="absolute -top-2 -left-2 z-10">
                          <Checkbox 
                            checked={selectedItems.includes(person.id)}
                            onCheckedChange={() => toggleSelectItem(person.id)}
                            className="bg-white shadow-sm"
                          />
                        </div>

                        {/* ID Card */}
                        <div className={`id-card bg-white rounded-xl border-2 ${getAccentBorder(person.role)} shadow-lg overflow-hidden hover:shadow-xl transition-shadow`}>
                          {/* Card Header */}
                          <div className={`id-card-header ${getRoleColor(person.role)} p-4 text-center text-white`}
                            style={{
                              background: person.role === 'Doctor' 
                                ? 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(221, 83%, 53%))' 
                                : person.role === 'Volunteer'
                                ? 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%))'
                                : 'linear-gradient(135deg, hsl(270, 95%, 60%), hsl(271, 91%, 65%))'
                            }}
                          >
                            <p className="text-xs font-medium opacity-90">Srini Foundation</p>
                            <p className="font-bold text-sm mt-1">{currentCamp?.name || 'Medical Camp'}</p>
                          </div>

                          {/* Card Body */}
                          <div className="p-4 text-center">
                            {/* Avatar */}
                            <Avatar className="h-20 w-20 mx-auto mb-3 border-4 border-white shadow-lg">
                              <AvatarImage src={person.photoUrl} />
                              <AvatarFallback className={`text-xl font-bold text-white ${getAccentColor(person.role)}`}>
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>

                            {/* Name */}
                            <h3 className="font-bold text-lg text-foreground">{person.name}</h3>

                            {/* Role Badge */}
                            <Badge 
                              variant="secondary" 
                              className={`mt-1 ${
                                person.role === 'Doctor' 
                                  ? 'bg-blue-100 text-blue-700' 
                                  : person.role === 'Volunteer'
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-purple-100 text-purple-700'
                              }`}
                            >
                              {person.role}
                            </Badge>

                            {/* Department */}
                            <p className="text-xs text-muted-foreground mt-2 bg-muted/50 py-1 px-2 rounded inline-block">
                              {person.department}
                            </p>

                            {/* ID Number */}
                            <p className="font-mono text-sm font-semibold mt-3 text-foreground">
                              {person.idNumber}
                            </p>

                            {/* Contact */}
                            {showContact && (
                              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" />
                                <span>{person.phone}</span>
                              </div>
                            )}

                            {/* QR Code Placeholder */}
                            {showQRCode && (
                              <div className="mt-3 mx-auto w-16 h-16 bg-muted rounded flex items-center justify-center">
                                <QrCode className="h-10 w-10 text-muted-foreground/50" />
                              </div>
                            )}

                            {/* Validity */}
                            <div className="mt-3 pt-3 border-t text-xs text-muted-foreground">
                              Valid: {currentCamp ? `${new Date(currentCamp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} - ${new Date(currentCamp.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}` : 'Camp Duration'}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
