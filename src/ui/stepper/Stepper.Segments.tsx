import { forwardRef } from "react";
import type { OlHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { useStepperContext } from "./Stepper";
import type { StepperStep } from "./Stepper";

/**
 * The visible 4px bar of one segment. State is carried by colour + the text
 * line above the bar (which names the current step), never by fill alone for
 * the current step: the "Step n of N · label" line is the non-colour cue.
 */
const stepperSegmentVariants = cva("block h-stepper-segment w-full rounded-ui-sm", {
  variants: {
    state: {
      upcoming: "bg-border",
      current: "bg-primary",
      completed: "bg-primary opacity-dim",
      error: "bg-danger",
    },
  },
  defaultVariants: { state: "upcoming" },
});

function segmentState(step: StepperStep, isCurrent: boolean, isCompleted: boolean) {
  if (step.error) return "error" as const;
  if (isCurrent) return "current" as const;
  if (isCompleted) return "completed" as const;
  return "upcoming" as const;
}

/**
 * Compact segmented-progress presentation of `StepperList` (`variant="segmented"`).
 * Always renders horizontally, whatever `Stepper`'s `orientation` is: a segmented
 * bar has no meaningful vertical form. Each segment is the same real `<button>`
 * the markers variant uses (same reachability and `go()` logic); the 24px-tall
 * button is the hit area, the 4px bar is an inner span.
 */
const StepperSegments = forwardRef<HTMLOListElement, OlHTMLAttributes<HTMLOListElement>>(
  ({ className, "aria-label": ariaLabel = "Steps", ...rest }, ref) => {
    const { steps, current, completed, isLocked, go, currentIndex, currentStep } = useStepperContext();

    return (
      <div className="flex w-full flex-col gap-tight">
        {/* "Step n of N" never shrinks; the label truncates (title carries the full text). */}
        <p className="flex min-w-0 items-baseline gap-tight text-sm">
          <span className="shrink-0 text-muted">
            Step {currentIndex + 1} of {steps.length}
            <span aria-hidden="true"> ·</span>
          </span>
          <span className="min-w-0 truncate font-medium text-fg" title={currentStep.label}>
            {currentStep.label}
          </span>
        </p>
        <ol ref={ref} aria-label={ariaLabel} className={cn("flex w-full gap-tight", className)} {...rest}>
          {steps.map((step, index) => {
            const isCurrent = step.id === current;
            const isCompleted = completed.has(step.id);
            const locked = isLocked(step.id);
            const state = segmentState(step, isCurrent, isCompleted);
            const stateText = step.error ? ", error" : isCompleted ? ", completed" : locked ? ", locked" : "";
            return (
              <li key={step.id} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => go(step.id)}
                  disabled={locked}
                  aria-disabled={locked || undefined}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`${step.label}, step ${index + 1} of ${steps.length}${stateText}`}
                  title={step.label}
                  className={cn(
                    "flex h-control w-full items-center rounded-ui-sm focus-ring focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
                    locked && "cursor-not-allowed",
                  )}
                >
                  <span aria-hidden="true" className={stepperSegmentVariants({ state })} />
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    );
  },
);
StepperSegments.displayName = "StepperSegments";

export { StepperSegments, stepperSegmentVariants };
