import { cloneElement, forwardRef, isValidElement, useId } from "react";
import type { ReactElement, ReactNode } from "react";
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

// A11y wiring contract (issue #29): the single control child gets the label's
// id (native <label for> association), aria-describedby pointing at the
// visible hint/error text, aria-invalid + data-invalid when an error is
// shown. The error line is role="alert" so screen readers announce it the
// moment it appears. Native semantics first: ids only where association
// requires them; everything else is plain visible text.
const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ label, error, hint, required, className, children, ...props }, ref) => {
    const id = useId();
    const hintId = `${id}-hint`;
    const errorId = `${id}-error`;
    const describedBy = error ? errorId : hint ? hintId : undefined;

    const control = isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          id,
          "aria-describedby": describedBy,
          "aria-invalid": error ? true : undefined,
          "data-invalid": error ? true : undefined,
        })
      : children;

    return (
      <div ref={ref} className={cn("flex flex-col gap-1.5", className)} {...props}>
        <Label htmlFor={id}>
          {label}
          {required && <span className="ml-1 text-danger">*</span>}
        </Label>
        {control}
        {hint && !error && (
          <p id={hintId} className="text-xs text-muted">
            {hint}
          </p>
        )}
        {error && (
          <p id={errorId} role="alert" className="text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    );
  },
);
FormField.displayName = "FormField";

export { FormField };
