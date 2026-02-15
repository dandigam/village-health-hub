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
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <button
              type="button"
              className="flex items-center cursor-pointer group"
              onClick={() => onStepClick?.(step.id)}
            >
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-colors group-hover:ring-2 group-hover:ring-accent/30',
                  currentStep > step.id
                    ? 'bg-accent border-accent text-white'
                    : currentStep === step.id
                    ? 'border-accent text-accent bg-accent/10'
                    : 'border-muted-foreground/30 text-muted-foreground bg-muted/50'
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  'ml-2 text-sm font-medium whitespace-nowrap group-hover:text-accent transition-colors',
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.title}
              </span>
            </button>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-4',
                  currentStep > step.id ? 'bg-accent' : 'bg-muted-foreground/20'
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
