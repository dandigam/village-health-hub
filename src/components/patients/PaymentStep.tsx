import { CreditCard, AlertTriangle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PaymentData {
  paymentType: string;
  paymentPercentage: string;
}

interface PaymentStepProps {
  data: PaymentData;
  onUpdate: (field: keyof PaymentData, value: string) => void;
}

const PERCENTAGES = [
  { value: '25', label: '25%' },
  { value: '50', label: '50%' },
  { value: '75', label: '75%' },
  { value: '100', label: '100%' },
];

export function PaymentStep({ data, onUpdate }: PaymentStepProps) {
  const requiresApproval = data.paymentType === 'paid' && data.paymentPercentage && data.paymentPercentage !== '100';

  return (
    <Card className="shadow-sm">
      <CardHeader className="py-3 px-4 border-b bg-muted/30">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-accent" />
          Payment Details
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-5">
        {/* Payment Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Payment Type</Label>
          <RadioGroup
            value={data.paymentType}
            onValueChange={(v) => {
              onUpdate('paymentType', v);
              if (v === 'free') {
                onUpdate('paymentPercentage', '');
              }
            }}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="free" id="payment-free" />
              <Label htmlFor="payment-free" className="text-sm font-normal cursor-pointer">
                Free
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="paid" id="payment-paid" />
              <Label htmlFor="payment-paid" className="text-sm font-normal cursor-pointer">
                Paid
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Payment Percentage - Only shown when Paid is selected */}
        {data.paymentType === 'paid' && (
          <div className="space-y-3 pl-4 border-l-2 border-accent/30">
            <Label className="text-sm font-medium">Payment Percentage</Label>
            <RadioGroup
              value={data.paymentPercentage}
              onValueChange={(v) => onUpdate('paymentPercentage', v)}
              className="flex gap-4"
            >
              {PERCENTAGES.map((pct) => (
                <div key={pct.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={pct.value} id={`pct-${pct.value}`} />
                  <Label
                    htmlFor={`pct-${pct.value}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {pct.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {/* Admin Approval Warning */}
            {requiresApproval && (
              <Alert className="bg-warning/10 border-warning/30">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <AlertDescription className="text-warning-foreground text-sm">
                  <strong>Admin Approval Required:</strong> Payment percentage is below 100%. 
                  This registration will require administrative approval before proceeding.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
