import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: number;
  title: string;
}

interface PatientStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepId: number) => void;
}

export function PatientStepper({ steps, currentStep, onStepClick }: PatientStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              className="flex flex-col items-center cursor-pointer group min-w-[64px]"
              onClick={() => onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200',
                  currentStep > step.id
                    ? 'bg-accent border-accent text-white'
                    : currentStep === step.id
                    ? 'border-accent text-accent bg-accent/10 shadow-md shadow-accent/20 scale-110'
                    : 'border-muted-foreground/25 text-muted-foreground bg-muted/50 group-hover:border-accent/40'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'mt-2 text-xs font-semibold whitespace-nowrap transition-colors',
                  currentStep >= step.id ? 'text-accent' : 'text-muted-foreground group-hover:text-accent/60'
                )}
              >
                {step.title}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-[3px] mx-1 rounded-full mt-[20px] transition-colors duration-200',
                  currentStep > step.id ? 'bg-accent' : 'bg-muted-foreground/15'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
