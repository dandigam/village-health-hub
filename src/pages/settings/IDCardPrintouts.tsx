import { useState, useRef } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  UserCheck,
  FileDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCamps, mockDoctors } from '@/data/mockData';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

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

interface PersonData {
  id: string;
  name: string;
  role: string;
  department: string;
  phone: string;
  photoUrl: string;
  idNumber: string;
}

export default function IDCardPrintouts() {
  const navigate = useNavigate();
  const [selectedCamp, setSelectedCamp] = useState(mockCamps[0]?.id || '');
  const [selectedTab, setSelectedTab] = useState('doctors');
  const [showQRCode, setShowQRCode] = useState(true);
  const [showContact, setShowContact] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const cardsRef = useRef<HTMLDivElement>(null);

  const currentCamp = mockCamps.find(c => c.id === selectedCamp);

  const getCampDates = () => {
    if (!currentCamp) return 'Camp Duration';
    const start = new Date(currentCamp.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const end = new Date(currentCamp.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getDataForTab = (): PersonData[] => {
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

  const getAccentColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'bg-blue-500';
      case 'volunteer': return 'bg-emerald-500';
      case 'staff': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getHeaderGradient = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'from-blue-600 to-blue-700';
      case 'volunteer': return 'from-emerald-600 to-emerald-700';
      case 'staff': return 'from-purple-600 to-purple-700';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'bg-blue-100 text-blue-700';
      case 'volunteer': return 'bg-emerald-100 text-emerald-700';
      case 'staff': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getAccentBorder = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'ring-blue-500/30';
      case 'volunteer': return 'ring-emerald-500/30';
      case 'staff': return 'ring-purple-500/30';
      default: return 'ring-gray-500/30';
    }
  };

  const handleDownloadPDF = async () => {
    const selectedData = data.filter(d => selectedItems.includes(d.id));
    if (selectedData.length === 0) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const cardWidth = 85;
      const cardHeight = 130;
      const marginX = (pageWidth - (cardWidth * 2 + 10)) / 2;
      const marginY = 20;

      for (let i = 0; i < selectedData.length; i += 2) {
        if (i > 0) pdf.addPage();

        // Render first card
        const card1 = document.getElementById(`id-card-${selectedData[i].id}`);
        if (card1) {
          const canvas1 = await html2canvas(card1, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
          const imgData1 = canvas1.toDataURL('image/png');
          pdf.addImage(imgData1, 'PNG', marginX, marginY, cardWidth, cardHeight);
        }

        // Render second card if exists
        if (selectedData[i + 1]) {
          const card2 = document.getElementById(`id-card-${selectedData[i + 1].id}`);
          if (card2) {
            const canvas2 = await html2canvas(card2, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
            const imgData2 = canvas2.toDataURL('image/png');
            pdf.addImage(imgData2, 'PNG', marginX + cardWidth + 10, marginY, cardWidth, cardHeight);
          }
        }
      }

      pdf.save(`ID-Cards-${currentCamp?.name || 'Camp'}-${selectedTab}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handlePrintSelected = () => {
    const selectedData = data.filter(d => selectedItems.includes(d.id));
    if (selectedData.length === 0) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const cardsHTML = selectedData.map(person => `
      <div class="id-card">
        <div class="card-header ${person.role.toLowerCase()}">
          <div class="logo">SF</div>
          <p class="org-name">Srini Foundation</p>
          <p class="camp-name">${currentCamp?.name || 'Medical Camp'}</p>
        </div>
        <div class="avatar-container">
          <div class="avatar ${person.role.toLowerCase()}-bg">
            ${person.name.split(' ').map(n => n[0]).join('')}
          </div>
        </div>
        <div class="card-body">
          <h3 class="name">${person.name}</h3>
          <span class="role-badge ${person.role.toLowerCase()}">${person.role}</span>
          <p class="department">${person.department}</p>
          <div class="id-box">
            <p class="id-number">${person.idNumber}</p>
          </div>
          ${showContact ? `<p class="contact">📞 ${person.phone}</p>` : ''}
          ${showQRCode ? `<div class="qr-placeholder">QR</div>` : ''}
          <div class="validity">
            <p class="validity-label">Valid</p>
            <p class="validity-dates">${getCampDates()}</p>
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Cards - ${currentCamp?.name || 'Camp'}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f5f5f5; }
            .cards-container { display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; padding: 20px; }
            .id-card { width: 280px; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); page-break-inside: avoid; }
            .card-header { padding: 20px 16px; text-align: center; color: white; position: relative; }
            .card-header.doctor { background: linear-gradient(135deg, #2563eb, #1d4ed8); }
            .card-header.volunteer { background: linear-gradient(135deg, #059669, #047857); }
            .card-header.staff { background: linear-gradient(135deg, #9333ea, #7c3aed); }
            .logo { position: absolute; top: 8px; left: 8px; width: 28px; height: 28px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; }
            .org-name { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
            .camp-name { font-size: 18px; font-weight: 700; margin-top: 4px; }
            .avatar-container { display: flex; justify-content: center; margin-top: -40px; position: relative; z-index: 1; }
            .avatar { width: 90px; height: 90px; border-radius: 50%; border: 4px solid white; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .doctor-bg { background: #3b82f6; }
            .volunteer-bg { background: #10b981; }
            .staff-bg { background: #a855f7; }
            .card-body { padding: 12px 20px 20px; text-align: center; }
            .name { font-size: 20px; font-weight: 700; color: #111827; margin-top: 8px; }
            .role-badge { display: inline-block; padding: 4px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 8px; }
            .role-badge.doctor { background: #dbeafe; color: #1d4ed8; }
            .role-badge.volunteer { background: #d1fae5; color: #047857; }
            .role-badge.staff { background: #f3e8ff; color: #7c3aed; }
            .department { font-size: 14px; color: #4b5563; margin-top: 10px; font-weight: 500; }
            .id-box { background: #f3f4f6; border-radius: 8px; padding: 8px 16px; display: inline-block; margin-top: 12px; }
            .id-number { font-family: 'Courier New', monospace; font-size: 16px; font-weight: 700; color: #1f2937; letter-spacing: 1px; }
            .contact { font-size: 13px; color: #6b7280; margin-top: 10px; }
            .qr-placeholder { width: 60px; height: 60px; background: #f3f4f6; border-radius: 8px; margin: 12px auto; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px; border: 1px solid #e5e7eb; }
            .validity { margin-top: 12px; padding-top: 10px; border-top: 1px solid #f3f4f6; }
            .validity-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; }
            .validity-dates { font-size: 13px; font-weight: 600; color: #374151; margin-top: 2px; }
            @media print {
              body { background: white; }
              .cards-container { gap: 15px; padding: 0; }
              .id-card { box-shadow: none; border: 1px solid #e5e7eb; }
            }
          </style>
        </head>
        <body>
          <div class="cards-container">${cardsHTML}</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
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
                      Print ({selectedItems.length})
                    </Button>
                    <Button 
                      onClick={handleDownloadPDF}
                      disabled={selectedItems.length === 0 || isGeneratingPDF}
                      className="gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      {isGeneratingPDF ? 'Generating...' : `Download PDF (2/page)`}
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
                <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.map((person) => (
                    <div key={person.id} className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute -top-2 -left-2 z-10">
                        <Checkbox 
                          checked={selectedItems.includes(person.id)}
                          onCheckedChange={() => toggleSelectItem(person.id)}
                          className="bg-white shadow-sm h-5 w-5"
                        />
                      </div>

                      {/* Modern ID Card */}
                      <div 
                        id={`id-card-${person.id}`}
                        className={`id-card bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 transition-all hover:shadow-2xl ${
                          selectedItems.includes(person.id) ? 'ring-2 ring-primary ring-offset-2' : ''
                        }`}
                      >
                        {/* Card Header with Gradient */}
                        <div className={`bg-gradient-to-br ${getHeaderGradient(person.role)} px-4 py-5 text-center text-white relative`}>
                          <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                            <span className="text-[10px] font-bold">SF</span>
                          </div>
                          <p className="text-sm font-semibold tracking-wide">Srini Foundation</p>
                          <p className="text-lg font-bold mt-1">{currentCamp?.name || 'Medical Camp'}</p>
                        </div>

                        {/* Avatar Section - Overlapping */}
                        <div className="relative -mt-10 flex justify-center">
                          <Avatar className={`h-24 w-24 border-4 border-white shadow-lg ring-4 ${getAccentBorder(person.role)}`}>
                            <AvatarImage src={person.photoUrl} className="object-cover" />
                            <AvatarFallback className={`text-2xl font-bold text-white ${getAccentColor(person.role)}`}>
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Card Body */}
                        <div className="px-5 pt-3 pb-5 text-center">
                          {/* Name */}
                          <h3 className="font-bold text-xl text-foreground mt-2">{person.name}</h3>

                          {/* Role Badge */}
                          <Badge 
                            variant="secondary" 
                            className={`mt-2 px-4 py-1 text-sm font-semibold ${getBadgeStyle(person.role)}`}
                          >
                            {person.role}
                          </Badge>

                          {/* Department */}
                          <p className="text-sm text-muted-foreground mt-3 font-medium">
                            {person.department}
                          </p>

                          {/* ID Number */}
                          <div className="mt-4 bg-muted/50 rounded-lg py-2 px-4 inline-block">
                            <p className="font-mono text-base font-bold text-foreground tracking-wider">
                              {person.idNumber}
                            </p>
                          </div>

                          {/* Contact */}
                          {showContact && (
                            <div className="flex items-center justify-center gap-2 mt-3 text-sm text-muted-foreground">
                              <Phone className="h-4 w-4" />
                              <span>{person.phone}</span>
                            </div>
                          )}

                          {/* QR Code */}
                          {showQRCode && (
                            <div className="mt-4 mx-auto w-16 h-16 bg-muted rounded-lg flex items-center justify-center border">
                              <QrCode className="h-12 w-12 text-muted-foreground/50" />
                            </div>
                          )}

                          {/* Validity */}
                          <div className="mt-4 pt-3 border-t">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide">Valid</p>
                            <p className="text-sm font-semibold text-foreground mt-0.5">{getCampDates()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
