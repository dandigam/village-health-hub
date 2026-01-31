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
      case 'volunteer': return 'bg-green-500';
      case 'staff': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getHeaderGradient = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'linear-gradient(135deg, hsl(217, 91%, 60%), hsl(221, 83%, 53%))';
      case 'volunteer': return 'linear-gradient(135deg, hsl(142, 76%, 36%), hsl(142, 71%, 45%))';
      case 'staff': return 'linear-gradient(135deg, hsl(270, 95%, 60%), hsl(271, 91%, 65%))';
      default: return 'linear-gradient(135deg, hsl(0, 0%, 50%), hsl(0, 0%, 40%))';
    }
  };

  const getBadgeStyle = (role: string) => {
    switch (role.toLowerCase()) {
      case 'doctor': return 'bg-blue-100 text-blue-700';
      case 'volunteer': return 'bg-green-100 text-green-700';
      case 'staff': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden w-60">
      {/* Card Header */}
      <div 
        className="p-4 text-center text-white"
        style={{ background: getHeaderGradient(person.role) }}
      >
        <p className="text-xs font-medium opacity-90">Srini Foundation</p>
        <p className="font-bold text-sm mt-1">{campName}</p>
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
        <h3 className="font-bold text-lg text-gray-900">{person.name}</h3>

        {/* Role Badge */}
        <Badge variant="secondary" className={`mt-1 ${getBadgeStyle(person.role)}`}>
          {person.role}
        </Badge>

        {/* Department */}
        <p className="text-xs text-gray-500 mt-2 bg-gray-100 py-1 px-2 rounded inline-block">
          {person.department}
        </p>

        {/* ID Number */}
        <p className="font-mono text-sm font-semibold mt-3 text-gray-900">
          {person.idNumber}
        </p>

        {/* Contact */}
        {showContact && (
          <div className="flex items-center justify-center gap-1 mt-2 text-xs text-gray-500">
            <Phone className="h-3 w-3" />
            <span>{person.phone}</span>
          </div>
        )}

        {/* QR Code Placeholder */}
        {showQRCode && (
          <div className="mt-3 mx-auto w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
            <QrCode className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {/* Validity */}
        <div className="mt-3 pt-3 border-t text-xs text-gray-400">
          Valid: {campDates}
        </div>
      </div>
    </div>
  );
}
