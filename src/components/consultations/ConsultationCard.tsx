import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
      return 'bg-[#FEF9C3] text-[#A16207] border-[#FDE047]';
    case 'in_progress':
      return 'bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]';
    case 'completed':
      return 'bg-[#D1FAE5] text-[#047857] border-[#6EE7B7]';
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
      "bg-white rounded-xl shadow-md p-4 border border-gray-100",
      "hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    )}>
      {/* Header: Avatar + Name + Status Badge */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="h-10 w-10 flex-shrink-0 bg-gray-100">
          <AvatarFallback className="bg-gray-100 text-gray-600 font-medium text-sm">
            {getInitials(patient?.name, patient?.surname)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-[#111] truncate">
                {patient?.name} {patient?.surname} • {patient?.age} yrs • {patient?.gender}
              </h3>
              <p className="text-xs text-gray-500">{patient?.patientId}</p>
            </div>
            <span className={cn(
              "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border flex-shrink-0",
              getStatusStyles(statusColor)
            )}>
              {status}
            </span>
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      {note && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-[#111] mb-1">Chief Complaint:</p>
          <p className="text-sm text-[#555] line-clamp-2 leading-relaxed">
            {note.subjective}
          </p>
        </div>
      )}

      {/* Colored Vital Signs */}
      {note && (
        <div className="flex items-center gap-4 mb-4 py-2 px-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">BP:</p>
            <p className={cn(
              "text-sm font-bold",
              bpIsHigh ? "text-[#EF4444]" : "text-[#6B7280]"
            )}>
              {bp}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">Pulse:</p>
            <p className="text-sm font-bold text-[#3B82F6]">
              {pulse} <span className="font-normal text-xs">bpm</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-0.5">SpO2:</p>
            <p className="text-sm font-bold text-[#10B981]">
              {spo2}<span className="font-normal text-xs">%</span>
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        {actions}
      </div>
    </div>
  );
};
