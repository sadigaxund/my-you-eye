import { forwardRef } from "react";
import type { OlHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { useStepperContext } from "./Stepper";
import type { StepperStep } from "./Stepper";

const stepperMarkerVariants = cva(
  "size-6 shrink-0 rounded-full border text-xs font-medium inline-flex items-center justify-center",
  {
    variants: {
      state: {
        upcoming: "border-border bg-surface text-muted",
        current: "border-primary bg-primary text-primary-fg",
        completed: "border-primary bg-primary text-primary-fg",
        error: "border-danger bg-danger text-danger-fg",
      },
    },
    defaultVariants: {
      state: "upcoming",
    },
  },
);

export type StepperListProps = OlHTMLAttributes<HTMLOListElement>;

function markerState(step: StepperStep, isCurrent: boolean, isCompleted: boolean) {
  if (step.error) return "error" as const;
  if (isCurrent) return "current" as const;
  if (isCompleted) return "completed" as const;
  return "upcoming" as const;
}

/**
 * The ordered `<ol>` of step buttons. `aria-current="step"` sits on the
 * current step's button (the element that receives focus, so it is announced
 * on focus), locked steps are real disabled buttons with sr-only "locked".
 */
const StepperList = forwardRef<HTMLOListElement, StepperListProps>(
  ({ className, "aria-label": ariaLabel = "Steps", ...rest }, ref) => {
    const { steps, current, completed, orientation, isLocked, go } = useStepperContext();

    return (
      <ol
        ref={ref}
        aria-label={ariaLabel}
        className={cn(
          orientation === "vertical" ? "flex shrink-0 flex-col" : "flex w-full items-start",
          className,
        )}
        {...rest}
      >
        {steps.map((step, index) => {
          const isCurrent = step.id === current;
          const isCompleted = completed.has(step.id);
          const locked = isLocked(step.id);
          const state = markerState(step, isCurrent, isCompleted);
          const isFirstItem = index === 0;
          const isLastItem = index === steps.length - 1;
          const previousCompleted = index > 0 && completed.has(steps[index - 1].id);

          const marker = (
            <span className={cn(stepperMarkerVariants({ state }), locked && "opacity-50")}>
              {state === "completed" ? (
                <svg viewBox="0 0 8 8" aria-hidden="true" className="size-3 fill-none stroke-current" strokeWidth="1.5">
                  <path d="M1 4l2 2 4-4" />
                </svg>
              ) : state === "error" ? (
                "!"
              ) : (
                index + 1
              )}
            </span>
          );
          const text = (
            <span className={cn("flex min-w-0 flex-col", orientation === "horizontal" && "items-center text-center", locked && "opacity-50")}>
              <span className={cn("text-sm", isCurrent || isCompleted ? "text-fg" : "text-muted", isCurrent && "font-medium")}>
                {step.label}
                {step.optional && <span className="text-muted"> (optional)</span>}
                {locked && <span className="sr-only">, locked</span>}
              </span>
              {step.error ? (
                <span className="text-xs text-danger">{step.error}</span>
              ) : step.description ? (
                <span className="text-xs text-muted">{step.description}</span>
              ) : null}
            </span>
          );
          const buttonClass = cn(
            "rounded-ui-sm focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
            // Locked: the dimming sits on the marker + text, not the whole
            // button, so the connector halves inside it stay full strength.
            locked && "cursor-not-allowed",
          );

          if (orientation === "horizontal") {
            // Label sits UNDER the marker so a step's footprint is its longest
            // word, not marker + label side by side — five steps still fit a
            // `lg` Dialog. The connector is two halves flanking the marker
            // (hidden at the two outer ends); the half between step i-1 and i
            // is painted "done" when step i-1 is completed.
            return (
              <li key={step.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => go(step.id)}
                  disabled={locked}
                  aria-disabled={locked || undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  className={cn("flex w-full flex-col items-center gap-tight", buttonClass)}
                >
                  <span className="flex w-full items-center">
                    <span aria-hidden="true" className={cn("h-px flex-1", previousCompleted ? "bg-primary" : "bg-border", isFirstItem && "invisible")} />
                    {marker}
                    <span aria-hidden="true" className={cn("h-px flex-1", isCompleted ? "bg-primary" : "bg-border", isLastItem && "invisible")} />
                  </span>
                  {text}
                </button>
              </li>
            );
          }

          // Vertical: marker left, label right, a fixed connector stub under
          // the marker (ml-3 = half the size-6 marker) — a column flex item
          // has no free height for a flex-1 connector to grow into.
          return (
            <li key={step.id} className="flex flex-col">
              <button
                type="button"
                onClick={() => go(step.id)}
                disabled={locked}
                aria-disabled={locked || undefined}
                aria-current={isCurrent ? "step" : undefined}
                className={cn("flex items-start gap-inline text-left", buttonClass)}
              >
                {marker}
                {text}
              </button>
              {!isLastItem && (
                <span aria-hidden="true" className={cn("my-1 ml-3 h-4 w-px", isCompleted ? "bg-primary" : "bg-border")} />
              )}
            </li>
          );
        })}
      </ol>
    );
  },
);
StepperList.displayName = "StepperList";

export { StepperList, stepperMarkerVariants };
