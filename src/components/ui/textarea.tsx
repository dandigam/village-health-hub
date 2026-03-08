import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[hsl(var(--field-border))] bg-[hsl(var(--field-bg))] px-3 py-2 text-sm text-value ring-offset-background placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--field-focus-ring)/0.3)] focus-visible:border-[hsl(var(--field-focus-border))] disabled:cursor-not-allowed disabled:opacity-50 shadow-sm transition-all duration-200",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
