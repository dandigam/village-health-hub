import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface ConsultationCardProps {
  patient: any;
  note?: any;
  status: string;
  statusColor: 'awaiting' | 'in_progress' | 'completed';
  actions: React.ReactNode;
}

const getStatusStyles = (status: 'awaiting' | 'in_progress' | 'completed') => {
  switch (status) {
    case 'awaiting':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'in_progress':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'completed':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

const getInitials = (name?: string, surname?: string) => {
  const first = name?.charAt(0) || '';
  const last = surname?.charAt(0) || '';
  return (first + last).toUpperCase() || 'P';
};

// Helper to determine if BP is high
const isBPHigh = (bp: string) => {
  const parts = bp?.split('/');
  if (parts?.length === 2) {
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    return systolic >= 140 || diastolic >= 90;
  }
  return false;
};

export const ConsultationCard = ({ 
  patient, 
  note, 
  status, 
  statusColor, 
  actions 
}: ConsultationCardProps) => {
  const bp = note?.objective?.bp || '---';
  const pulse = note?.objective?.pulse || '---';
  const spo2 = note?.objective?.spo2 || '---';
  const bpIsHigh = isBPHigh(bp);

  return (
    <div className={cn(
      "bg-white rounded-2xl p-5 border border-gray-100",
      "shadow-[0_2px_12px_rgba(0,0,0,0.06)]",
      "hover:shadow-[0_8px_24px_rgba(0,0,0,0.1)] hover:-translate-y-1",
      "transition-all duration-300 ease-out"
    )}>
      {/* Header: Avatar + Name + Status Badge */}
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="h-12 w-12 flex-shrink-0 ring-2 ring-gray-100">
          <AvatarImage src={patient?.photoUrl} alt={patient?.name} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
            {getInitials(patient?.name, patient?.surname)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-[15px] text-gray-900 leading-tight">
                {patient?.name} {patient?.surname}
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                {patient?.age} yrs • {patient?.gender}
              </p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{patient?.patientId}</p>
            </div>
            <span className={cn(
              "inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border flex-shrink-0",
              getStatusStyles(statusColor)
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      {note && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Chief Complaint
          </p>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {note.subjective}
          </p>
        </div>
      )}

      {/* Colored Vital Signs */}
      {note && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-1">BP</p>
            <p className={cn(
              "text-sm font-bold",
              bpIsHigh ? "text-red-500" : "text-gray-700"
            )}>
              {bp}
            </p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">Pulse</p>
            <p className="text-sm font-bold text-blue-600">
              {pulse} <span className="font-normal text-[10px]">bpm</span>
            </p>
          </div>
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1">SpO2</p>
            <p className="text-sm font-bold text-emerald-600">
              {spo2}<span className="font-normal text-[10px]">%</span>
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t border-gray-100">
        {actions}
      </div>
    </div>
  );
};
