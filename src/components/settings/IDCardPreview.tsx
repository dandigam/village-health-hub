import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { QrCode, Phone } from 'lucide-react';

interface IDCardPreviewProps {
  person: {
    id: string;
    name: string;
    role: string;
    department: string;
    phone: string;
    photoUrl: string;
    idNumber: string;
  };
  campName: string;
  campDates: string;
  showQRCode: boolean;
  showContact: boolean;
}

export function IDCardPreview({ 
  person, 
  campName, 
  campDates, 
  showQRCode, 
  showContact 
}: IDCardPreviewProps) {
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
      case 'doctor': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'volunteer': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'staff': return 'bg-purple-100 text-purple-700 border-purple-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getAccentBorderColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'border-blue-500';
      case 'volunteer': return 'border-emerald-500';
      case 'staff': return 'border-purple-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div className="id-card-preview bg-white rounded-2xl shadow-xl overflow-hidden w-[280px] border border-gray-200">
      {/* Card Header with Gradient */}
      <div className={`bg-gradient-to-br ${getHeaderGradient(person.role)} px-4 py-5 text-center text-white relative`}>
        <div className="absolute top-2 left-2 w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-[10px] font-bold">HC</span>
        </div>
        <p className="text-sm font-semibold tracking-wide">HealthCamp Pro</p>
        <p className="text-lg font-bold mt-1">{campName}</p>
      </div>

      {/* Avatar Section - Overlapping */}
      <div className="relative -mt-10 flex justify-center">
        <Avatar className={`h-24 w-24 border-4 border-white shadow-lg ring-4 ${getAccentBorderColor(person.role)} ring-opacity-30`}>
          <AvatarImage src={person.photoUrl} className="object-cover" />
          <AvatarFallback className={`text-2xl font-bold text-white ${getAccentColor(person.role)}`}>
            {person.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Card Body */}
      <div className="px-5 pt-3 pb-5 text-center">
        {/* Name */}
        <h3 className="font-bold text-xl text-gray-900 mt-2">{person.name}</h3>

        {/* Role Badge */}
        <Badge variant="outline" className={`mt-2 px-4 py-1 text-sm font-semibold ${getBadgeStyle(person.role)}`}>
          {person.role}
        </Badge>

        {/* Department */}
        <p className="text-sm text-gray-600 mt-3 font-medium">
          {person.department}
        </p>

        {/* ID Number */}
        <div className="mt-4 bg-gray-50 rounded-lg py-2 px-4 inline-block">
          <p className="font-mono text-base font-bold text-gray-800 tracking-wider">
            {person.idNumber}
          </p>
        </div>

        {/* Contact */}
        {showContact && (
          <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-600">
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{person.phone}</span>
          </div>
        )}

        {/* QR Code */}
        {showQRCode && (
          <div className="mt-4 mx-auto w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
            <QrCode className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Validity */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Valid</p>
          <p className="text-sm font-semibold text-gray-700 mt-0.5">{campDates}</p>
        </div>
      </div>
    </div>
  );
}
