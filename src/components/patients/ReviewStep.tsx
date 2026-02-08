import { User, ClipboardList, CreditCard, MapPin, Camera } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface DemographicData {
  firstName: string;
  lastName: string;
  fatherSpouseName: string;
  gender: string;
  age: string;
  maritalStatus: string;
  phone: string;
  state: string;
  district: string;
  mandal: string;
  village: string;
  street: string;
}

interface HistoryData {
  hasPreviousTreatment: string;
  conditions: string[];
  previousHospital: string;
  currentMedications: string;
  pastSurgery: string;
}

interface PaymentData {
  paymentType: string;
  paymentPercentage: string;
}

interface ReviewStepProps {
  demographic: DemographicData;
  history: HistoryData;
  payment: PaymentData;
  photoUrl: string | null;
}

const CONDITIONS_MAP: Record<string, string> = {
  diabetes: 'Diabetes',
  hypertension: 'Hypertension',
  heart_disease: 'Heart Disease',
  asthma: 'Asthma / Breathing Issues',
  thyroid: 'Thyroid',
  other: 'Other',
};

const STATE_MAP: Record<string, string> = {
  AP: 'Andhra Pradesh',
  TS: 'Telangana',
  KA: 'Karnataka',
  TN: 'Tamil Nadu',
};

export function ReviewStep({ demographic, history, payment, photoUrl }: ReviewStepProps) {
  const requiresApproval = payment.paymentType === 'paid' && payment.paymentPercentage && payment.paymentPercentage !== '100';
  
  const initials = `${demographic.firstName?.[0] || ''}${demographic.lastName?.[0] || ''}`.toUpperCase();

  return (
    <div className="space-y-4">
      {/* Demographic Details */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <User className="h-4 w-4 text-accent" />
            Demographic Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-6">
            {/* Photo */}
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20">
                <AvatarImage src={photoUrl || undefined} alt={demographic.firstName} />
                <AvatarFallback className="bg-accent/10 text-accent text-lg">
                  {initials || <Camera className="h-6 w-6" />}
                </AvatarFallback>
              </Avatar>
            </div>
            
            {/* Info Grid */}
            <div className="flex-1 grid grid-cols-4 gap-x-6 gap-y-3 text-sm">
              <div>
                <span className="text-muted-foreground text-xs">First Name</span>
                <p className="font-medium">{demographic.firstName || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Last Name</span>
                <p className="font-medium">{demographic.lastName || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Father / Spouse Name</span>
                <p className="font-medium">{demographic.fatherSpouseName || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Gender</span>
                <p className="font-medium">{demographic.gender || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Age</span>
                <p className="font-medium">{demographic.age ? `${demographic.age} years` : '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Marital Status</span>
                <p className="font-medium">{demographic.maritalStatus || '-'}</p>
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Phone</span>
                <p className="font-medium">{demographic.phone || '-'}</p>
              </div>
              <div></div>
              
              {/* Address */}
              <div className="col-span-4 pt-2 border-t mt-2">
                <div className="flex items-center gap-1 mb-2">
                  <MapPin className="h-3 w-3 text-accent" />
                  <span className="text-xs text-muted-foreground">Address</span>
                </div>
                <p className="font-medium">
                  {[
                    demographic.street,
                    demographic.village,
                    demographic.mandal,
                    demographic.district,
                    STATE_MAP[demographic.state] || demographic.state,
                  ].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-accent" />
            Medical History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Previous Treatment</span>
              <p className="font-medium">
                {history.hasPreviousTreatment === 'yes' ? 'Yes' : history.hasPreviousTreatment === 'no' ? 'No' : '-'}
              </p>
            </div>
            
            {history.hasPreviousTreatment === 'yes' && (
              <>
                <div>
                  <span className="text-muted-foreground text-xs">Previous Hospital</span>
                  <p className="font-medium">{history.previousHospital || '-'}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground text-xs">Conditions</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {history.conditions.length > 0 ? (
                      history.conditions.map((c) => (
                        <Badge key={c} variant="secondary" className="text-xs">
                          {CONDITIONS_MAP[c] || c}
                        </Badge>
                      ))
                    ) : (
                      <span className="font-medium">-</span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Current Medications</span>
                  <p className="font-medium whitespace-pre-wrap">{history.currentMedications || '-'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Past Surgery / Major Illness</span>
                  <p className="font-medium whitespace-pre-wrap">{history.pastSurgery || '-'}</p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment */}
      <Card className="shadow-sm">
        <CardHeader className="py-3 px-4 border-b bg-muted/30">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-accent" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-muted-foreground text-xs">Payment Type</span>
              <p className="font-medium capitalize">{payment.paymentType || '-'}</p>
            </div>
            {payment.paymentType === 'paid' && (
              <div>
                <span className="text-muted-foreground text-xs">Payment Percentage</span>
                <p className="font-medium">{payment.paymentPercentage ? `${payment.paymentPercentage}%` : '-'}</p>
              </div>
            )}
            {requiresApproval && (
              <Badge variant="outline" className="border-warning text-warning bg-warning/10">
                Admin Approval Required
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
