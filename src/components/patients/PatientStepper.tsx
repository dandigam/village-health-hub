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
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                className="flex flex-col items-center cursor-pointer group min-w-[64px]"
                onClick={() => onStepClick?.(step.id)}
              >
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300',
                    isCompleted
                      ? 'bg-accent border-accent text-white shadow-md shadow-accent/25'
                      : isActive
                      ? 'border-accent text-accent bg-accent/10 shadow-lg shadow-accent/20 scale-110 ring-4 ring-accent/10'
                      : 'border-muted-foreground/20 text-muted-foreground bg-muted/40 group-hover:border-accent/40 group-hover:bg-accent/5'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={cn(
                    'mt-2 text-[11px] font-semibold whitespace-nowrap transition-colors',
                    isCompleted ? 'text-accent' : isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent/60'
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2 mt-[20px]">
                  <div className="h-[3px] rounded-full bg-muted-foreground/10 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500 ease-out',
                        isCompleted ? 'w-full bg-accent' : 'w-0 bg-accent'
                      )}
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
