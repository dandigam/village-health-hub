import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronLeft, ChevronRight, Save, FileText, ShieldCheck } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { PatientStepper } from '@/components/patients/PatientStepper';
import { DemographicStep } from '@/components/patients/DemographicStep';
import { HistoryStep } from '@/components/patients/HistoryStep';
import { PaymentStep } from '@/components/patients/PaymentStep';
import { ReviewStep } from '@/components/patients/ReviewStep';
import { toast } from 'sonner';

const STEPS = [
  { id: 1, title: 'Demographic Details' },
  { id: 2, title: 'History' },
  { id: 3, title: 'Payment' },
  { id: 4, title: 'Review' },
];

export default function NewPatient() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const [demographic, setDemographic] = useState({
    firstName: '',
    lastName: '',
    fatherSpouseName: '',
    gender: '',
    age: '',
    maritalStatus: '',
    phone: '',
    state: '',
    district: '',
    mandal: '',
    village: '',
    street: '',
  });

  const [history, setHistory] = useState({
    hasPreviousTreatment: '',
    conditions: [] as string[],
    previousHospital: '',
    currentMedications: '',
    pastSurgery: '',
  });

  const [payment, setPayment] = useState({
    paymentType: '',
    paymentPercentage: '',
  });

  const updateDemographic = (field: keyof typeof demographic, value: string) => {
    setDemographic((prev) => ({ ...prev, [field]: value }));
  };

  const updateHistory = <K extends keyof typeof history>(field: K, value: typeof history[K]) => {
    setHistory((prev) => ({ ...prev, [field]: value }));
  };

  const updatePayment = (field: keyof typeof payment, value: string) => {
    setPayment((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!demographic.firstName || !demographic.fatherSpouseName || !demographic.gender || !demographic.age) {
          toast.error('Please fill in all required fields');
          return false;
        }
        return true;
      case 2:
        return true; // History is optional
      case 3:
        if (!payment.paymentType) {
          toast.error('Please select a payment type');
          return false;
        }
        if (payment.paymentType === 'paid' && !payment.paymentPercentage) {
          toast.error('Please select a payment percentage');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const requiresApproval = payment.paymentType === 'paid' && payment.paymentPercentage && payment.paymentPercentage !== '100';

  const handleSaveDraft = () => {
    toast.success('Patient saved as draft');
    navigate('/patients');
  };

  const handleSendToSOAP = () => {
    toast.success('Patient registered and sent to SOAP Notes');
    navigate('/soap-notes');
  };

  const handleSendToAdmin = () => {
    toast.success('Patient registration sent to Administration for approval');
    navigate('/patients');
  };

  const handleCancel = () => {
    navigate('/patients');
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Add New Patient</h1>
          <Button variant="outline" size="sm" onClick={handleCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>

        {/* Stepper */}
        <div className="bg-card border rounded-lg p-4">
          <PatientStepper steps={STEPS} currentStep={currentStep} onStepClick={(stepId) => setCurrentStep(stepId)} />
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <DemographicStep
              data={demographic}
              photoUrl={photoUrl}
              onUpdate={updateDemographic}
              onPhotoChange={setPhotoUrl}
            />
          )}
          {currentStep === 2 && (
            <HistoryStep data={history} onUpdate={updateHistory} />
          )}
          {currentStep === 3 && (
            <PaymentStep data={payment} onUpdate={updatePayment} />
          )}
          {currentStep === 4 && (
            <ReviewStep
              demographic={demographic}
              history={history}
              payment={payment}
              photoUrl={photoUrl}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {currentStep < 4 ? (
              <Button onClick={handleNext} className="bg-accent hover:bg-accent/90">
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleSaveDraft}>
                  <Save className="h-4 w-4 mr-1" />
                  Save (Draft)
                </Button>
                <Button onClick={handleSendToSOAP} className="bg-accent hover:bg-accent/90">
                  <FileText className="h-4 w-4 mr-1" />
                  Send to SOAP Notes
                </Button>
                {requiresApproval && (
                  <Button variant="secondary" onClick={handleSendToAdmin}>
                    <ShieldCheck className="h-4 w-4 mr-1" />
                    Send to Administration
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
