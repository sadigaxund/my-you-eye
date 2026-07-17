import { forwardRef, useId } from "react";
import type { ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { Label } from "../../label";

export interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, className, children, ...props }, ref) => {
    const id = useId();

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </Label>
        {children}
        {hint && !error && (
          <p className="text-xs text-muted">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-danger">{error}</p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
