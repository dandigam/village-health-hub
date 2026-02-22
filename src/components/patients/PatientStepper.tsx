import { Check, User, History, CreditCard, ClipboardCheck } from 'lucide-react';
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

const stepIcons = [User, History, CreditCard, ClipboardCheck];

export function PatientStepper({ steps, currentStep, onStepClick }: PatientStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-start justify-between">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || User;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                className="flex flex-col items-center cursor-pointer group min-w-[56px]"
                onClick={() => onStepClick?.(step.id)}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-200',
                    currentStep > step.id
                      ? 'bg-accent border-accent text-white'
                      : currentStep === step.id
                      ? 'border-accent text-accent bg-accent/10 shadow-sm scale-105'
                      : 'border-muted-foreground/25 text-muted-foreground bg-muted/50 group-hover:border-accent/40'
                  )}
                >
                  {currentStep > step.id ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <Icon className="h-3.5 w-3.5" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1.5 text-[11px] font-medium whitespace-nowrap transition-colors',
                    currentStep >= step.id ? 'text-accent' : 'text-muted-foreground group-hover:text-accent/60'
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'flex-1 h-[2px] mx-1 rounded-full mt-[16px] transition-colors duration-200',
                    currentStep > step.id ? 'bg-accent' : 'bg-muted-foreground/15'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
