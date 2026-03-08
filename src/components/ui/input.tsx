import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-[hsl(var(--field-border))] bg-[hsl(var(--field-bg))] px-3 py-2 text-base text-value ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--field-focus-ring)/0.3)] focus-visible:border-[hsl(var(--field-focus-border))] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200 shadow-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
