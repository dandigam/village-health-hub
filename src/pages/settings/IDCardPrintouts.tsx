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
import { Badge } from '@/components/ui/badge';
import { 
  IdCard,
  ArrowLeft,
  Printer,
  QrCode,
  Phone,
  Stethoscope,
  Users,
  UserCheck,
  FileDown,
  User
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

  // Refined color schemes
  const getRoleColors = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor':
        return {
          headerBg: 'bg-gradient-to-br from-sky-500 to-blue-600',
          avatarBg: 'bg-sky-100',
          avatarText: 'text-sky-700',
          avatarBorder: 'border-sky-200',
          avatarRing: 'ring-sky-100',
          badgeBg: 'bg-sky-50',
          badgeText: 'text-sky-700',
          badgeBorder: 'border-sky-200',
        };
      case 'volunteer':
        return {
          headerBg: 'bg-gradient-to-br from-teal-500 to-emerald-600',
          avatarBg: 'bg-teal-100',
          avatarText: 'text-teal-700',
          avatarBorder: 'border-teal-200',
          avatarRing: 'ring-teal-100',
          badgeBg: 'bg-teal-50',
          badgeText: 'text-teal-700',
          badgeBorder: 'border-teal-200',
        };
      case 'staff':
        return {
          headerBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
          avatarBg: 'bg-violet-100',
          avatarText: 'text-violet-700',
          avatarBorder: 'border-violet-200',
          avatarRing: 'ring-violet-100',
          badgeBg: 'bg-violet-50',
          badgeText: 'text-violet-700',
          badgeBorder: 'border-violet-200',
        };
      default:
        return {
          headerBg: 'bg-gradient-to-br from-slate-500 to-slate-600',
          avatarBg: 'bg-slate-100',
          avatarText: 'text-slate-700',
          avatarBorder: 'border-slate-200',
          avatarRing: 'ring-slate-100',
          badgeBg: 'bg-slate-50',
          badgeText: 'text-slate-700',
          badgeBorder: 'border-slate-200',
        };
    }
  };

  const handleDownloadPDF = async () => {
    const selectedData = data.filter(d => selectedItems.includes(d.id));
    if (selectedData.length === 0) return;

    setIsGeneratingPDF(true);

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const cardWidth = 85;
      const cardHeight = 130;
      const marginX = (pageWidth - (cardWidth * 2 + 10)) / 2;
      const marginY = 20;

      for (let i = 0; i < selectedData.length; i += 2) {
        if (i > 0) pdf.addPage();

        const card1 = document.getElementById(`id-card-${selectedData[i].id}`);
        if (card1) {
          const canvas1 = await html2canvas(card1, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
          const imgData1 = canvas1.toDataURL('image/png');
          pdf.addImage(imgData1, 'PNG', marginX, marginY, cardWidth, cardHeight);
        }

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

    const getHeaderColor = (role: string) => {
      switch (role.toLowerCase()) {
        case 'doctor': return 'linear-gradient(135deg, #0ea5e9, #2563eb)';
        case 'volunteer': return 'linear-gradient(135deg, #14b8a6, #059669)';
        case 'staff': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        default: return 'linear-gradient(135deg, #64748b, #475569)';
      }
    };

    const getAvatarColors = (role: string) => {
      switch (role.toLowerCase()) {
        case 'doctor': return { bg: '#e0f2fe', text: '#0369a1' };
        case 'volunteer': return { bg: '#ccfbf1', text: '#0f766e' };
        case 'staff': return { bg: '#ede9fe', text: '#6d28d9' };
        default: return { bg: '#f1f5f9', text: '#475569' };
      }
    };

    const getBadgeColors = (role: string) => {
      switch (role.toLowerCase()) {
        case 'doctor': return { bg: '#f0f9ff', text: '#0369a1', border: '#bae6fd' };
        case 'volunteer': return { bg: '#f0fdfa', text: '#0f766e', border: '#99f6e4' };
        case 'staff': return { bg: '#f5f3ff', text: '#6d28d9', border: '#ddd6fe' };
        default: return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0' };
      }
    };

    const cardsHTML = selectedData.map(person => {
      const avatarColors = getAvatarColors(person.role);
      const badgeColors = getBadgeColors(person.role);
      return `
      <div class="id-card">
        <div class="card-header" style="background: ${getHeaderColor(person.role)}">
          <div class="logo">SF</div>
          <p class="org-name">Srini Foundation</p>
          <p class="camp-name">${currentCamp?.name || 'Medical Camp'}</p>
        </div>
        <div class="card-body">
          <div class="avatar" style="background: ${avatarColors.bg}; color: ${avatarColors.text}">
            ${person.photoUrl ? `<img src="${person.photoUrl}" alt="${person.name}" />` : `<span class="initials">${person.name.split(' ').map(n => n[0]).join('')}</span>`}
          </div>
          <h3 class="name">${person.name}</h3>
          <span class="role-badge" style="background: ${badgeColors.bg}; color: ${badgeColors.text}; border-color: ${badgeColors.border}">${person.role}</span>
          <p class="department">${person.department}</p>
          <div class="id-box">
            <p class="id-number">${person.idNumber}</p>
          </div>
          ${showContact ? `<p class="contact">📞 ${person.phone}</p>` : ''}
          ${showQRCode ? `<div class="qr-placeholder"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg></div>` : ''}
          <div class="validity">
            <p class="validity-label">VALID</p>
            <p class="validity-dates">${getCampDates()}</p>
          </div>
        </div>
      </div>
    `}).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ID Cards - ${currentCamp?.name || 'Camp'}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', system-ui, sans-serif; background: #f8fafc; }
            .cards-container { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; padding: 24px; }
            .id-card { width: 260px; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); page-break-inside: avoid; border: 1px solid #e2e8f0; }
            .card-header { padding: 20px 16px; text-align: center; color: white; position: relative; }
            .logo { position: absolute; top: 10px; left: 10px; width: 28px; height: 28px; background: rgba(255,255,255,0.25); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; }
            .org-name { font-size: 13px; font-weight: 600; opacity: 0.95; letter-spacing: 0.3px; }
            .camp-name { font-size: 17px; font-weight: 700; margin-top: 4px; }
            .card-body { padding: 20px; text-align: center; background: white; }
            .avatar { width: 88px; height: 88px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden; }
            .avatar img { width: 100%; height: 100%; object-fit: cover; }
            .avatar .initials { font-size: 28px; font-weight: 700; }
            .name { font-size: 18px; font-weight: 700; color: #1e293b; }
            .role-badge { display: inline-block; padding: 5px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; margin-top: 10px; border: 1px solid; }
            .department { font-size: 13px; color: #64748b; margin-top: 10px; font-weight: 500; }
            .id-box { background: #f8fafc; border-radius: 10px; padding: 8px 20px; display: inline-block; margin-top: 14px; border: 1px solid #e2e8f0; }
            .id-number { font-family: 'SF Mono', 'Courier New', monospace; font-size: 15px; font-weight: 700; color: #334155; letter-spacing: 1px; }
            .contact { font-size: 13px; color: #64748b; margin-top: 12px; }
            .qr-placeholder { width: 56px; height: 56px; background: #f8fafc; border-radius: 10px; margin: 14px auto 0; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; }
            .validity { margin-top: 16px; padding-top: 14px; border-top: 1px solid #f1f5f9; }
            .validity-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
            .validity-dates { font-size: 13px; font-weight: 600; color: #475569; margin-top: 3px; }
            @media print {
              body { background: white; }
              .cards-container { gap: 20px; padding: 0; }
              .id-card { box-shadow: none; }
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
                <div className="h-10 w-10 rounded-lg bg-sky-100 flex items-center justify-center">
                  <IdCard className="h-5 w-5 text-sky-600" />
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
                      {isGeneratingPDF ? 'Generating...' : `Download PDF`}
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
                  {data.map((person) => {
                    const colors = getRoleColors(person.role);
                    return (
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
                          className={`bg-white rounded-2xl shadow-lg overflow-hidden border transition-all hover:shadow-xl ${
                            selectedItems.includes(person.id) ? 'ring-2 ring-primary ring-offset-2' : 'border-slate-200'
                          }`}
                        >
                          {/* Card Header */}
                          <div className={`${colors.headerBg} px-4 py-5 text-center text-white relative`}>
                            <div className="absolute top-2.5 left-2.5 w-7 h-7 bg-white/25 rounded-full flex items-center justify-center">
                              <span className="text-[10px] font-bold">SF</span>
                            </div>
                            <p className="text-sm font-semibold opacity-95 tracking-wide">Srini Foundation</p>
                            <p className="text-base font-bold mt-1">{currentCamp?.name || 'Medical Camp'}</p>
                          </div>

                          {/* Card Body */}
                          <div className="px-5 py-5 text-center">
                            {/* Avatar - Centered properly */}
                            <div className={`w-[88px] h-[88px] mx-auto rounded-full ${colors.avatarBg} ${colors.avatarBorder} border-[3px] flex items-center justify-center shadow-md overflow-hidden`}>
                              {person.photoUrl ? (
                                <img 
                                  src={person.photoUrl} 
                                  alt={person.name} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className={`text-2xl font-bold ${colors.avatarText}`}>
                                  {person.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              )}
                            </div>

                            {/* Name */}
                            <h3 className="font-bold text-lg text-slate-800 mt-4">{person.name}</h3>

                            {/* Role Badge */}
                            <Badge 
                              variant="outline"
                              className={`mt-2 px-4 py-1 text-xs font-semibold ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder} border`}
                            >
                              {person.role}
                            </Badge>

                            {/* Department */}
                            <p className="text-sm text-slate-500 mt-3 font-medium">
                              {person.department}
                            </p>

                            {/* ID Number */}
                            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl py-2 px-5 inline-block">
                              <p className="font-mono text-sm font-bold text-slate-700 tracking-wider">
                                {person.idNumber}
                              </p>
                            </div>

                            {/* Contact */}
                            {showContact && (
                              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-slate-500">
                                <Phone className="h-3.5 w-3.5" />
                                <span>{person.phone}</span>
                              </div>
                            )}

                            {/* QR Code */}
                            {showQRCode && (
                              <div className="mt-4 mx-auto w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center border border-slate-200">
                                <QrCode className="h-9 w-9 text-slate-400" />
                              </div>
                            )}

                            {/* Validity */}
                            <div className="mt-4 pt-4 border-t border-slate-100">
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Valid</p>
                              <p className="text-sm font-semibold text-slate-600 mt-1">{getCampDates()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
