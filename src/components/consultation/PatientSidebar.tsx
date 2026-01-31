import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Scale, Activity, Heart, Thermometer, Wind,
  ChevronLeft, ChevronRight, Printer, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PatientSidebarProps {
  patient: any;
  doctor: any;
  campName: string;
  date: string;
  vitals: {
    weight?: number | '';
    bp?: string;
    pulse?: number | '';
    temp?: number | '';
    spo2?: number | '';
  };
  diagnosis: string[];
  allergies: {
    drug: boolean;
    food: boolean;
    environment: boolean;
    drugList?: string[];
  };
  onClose?: () => void;
}

const isBPHigh = (bp?: string) => {
  if (!bp) return false;
  const parts = bp.split('/');
  if (parts.length === 2) {
    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);
    return systolic >= 140 || diastolic >= 90;
  }
  return false;
};

export function PatientSidebar({
  patient,
  doctor,
  campName,
  date,
  vitals,
  diagnosis,
  allergies,
  onClose
}: PatientSidebarProps) {
  const getInitials = (name?: string, surname?: string) => {
    const first = name?.charAt(0) || '';
    const last = surname?.charAt(0) || '';
    return (first + last).toUpperCase() || 'P';
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="font-semibold text-lg">Patient Details</h2>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Medical Condition Header Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-3 pt-4">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-semibold tracking-wide">MEDICAL CONDITION</CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage src={patient?.photoUrl} />
                <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                  {getInitials(patient?.name, patient?.surname)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Date</p>
                  <p className="font-medium">{date}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Camp Name</p>
                  <p className="font-medium">{campName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Doctor</p>
                  <p className="font-medium">{doctor?.name}</p>
                  <p className="text-xs text-muted-foreground">{doctor?.specialization}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-bold tracking-wide">DIAGNOSIS</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {diagnosis.length > 0 ? diagnosis.map((d, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="bg-primary/10 text-primary border-primary/30 font-medium"
                >
                  {d}
                </Badge>
              )) : (
                <p className="text-sm text-muted-foreground">No diagnosis added</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Vitals Summary Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-bold tracking-wide">VITALS SUMMARY</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-3 gap-3">
              {/* Weight */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Scale className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Weight</p>
                  <p className="font-bold text-sm">{vitals.weight || '--'}</p>
                </div>
              </div>
              
              {/* BP */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">BP</p>
                  <p className={cn(
                    "font-bold text-sm",
                    isBPHigh(vitals.bp) ? "text-destructive" : "text-foreground"
                  )}>
                    {vitals.bp || '--'}
                  </p>
                </div>
              </div>
              
              {/* Pulse */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-destructive flex items-center justify-center">
                  <Heart className="h-4 w-4 text-destructive-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pulse</p>
                  <p className="font-bold text-sm">{vitals.pulse || '--'}</p>
                </div>
              </div>
              
              {/* Temp */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent flex items-center justify-center">
                  <Thermometer className="h-4 w-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Temp</p>
                  <p className="font-bold text-sm">{vitals.temp ? `${vitals.temp}°F` : '--'}</p>
                </div>
              </div>
              
              {/* SpO2 */}
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                  <Wind className="h-4 w-4 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">SpO2</p>
                  <p className="font-bold text-sm">{vitals.spo2 ? `${vitals.spo2}%` : '--'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Allergies Card */}
        <Card className="border shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-bold tracking-wide">ALLERGIES</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Drug</span>
                <Badge variant={allergies.drug ? "destructive" : "secondary"} className="text-xs">
                  {allergies.drug ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Food</span>
                <Badge variant={allergies.food ? "destructive" : "secondary"} className="text-xs">
                  {allergies.food ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-muted-foreground">Environment</span>
                <Badge variant={allergies.environment ? "destructive" : "secondary"} className="text-xs">
                  {allergies.environment ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
            {allergies.drugList && allergies.drugList.length > 0 && (
              <p className="mt-2 text-sm text-destructive">
                {allergies.drugList.join(', ')}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
