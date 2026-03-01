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
      <div className="flex items-center">
        {steps.map((step, index) => {
          const Icon = stepIcons[index] || User;
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          return (
            <div key={step.id} className="flex items-center flex-1">
              <button
                type="button"
                className="flex items-center gap-1.5 cursor-pointer group"
                onClick={() => onStepClick?.(step.id)}
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold border-2 transition-all duration-200 shrink-0',
                    isCompleted
                      ? 'bg-accent border-accent text-white'
                      : isActive
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-muted-foreground/20 text-muted-foreground bg-muted/40 group-hover:border-accent/40'
                  )}
                >
                  {isCompleted ? <Check className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
                </div>
                <span
                  className={cn(
                    'text-[11px] font-medium whitespace-nowrap transition-colors hidden sm:inline',
                    isCompleted || isActive ? 'text-accent' : 'text-muted-foreground group-hover:text-accent/60'
                  )}
                >
                  {step.title}
                </span>
              </button>
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div className={cn('h-[2px] rounded-full transition-colors duration-300', isCompleted ? 'bg-accent' : 'bg-muted-foreground/12')} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
