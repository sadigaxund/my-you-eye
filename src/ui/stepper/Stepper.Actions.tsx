import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Button } from "../button";
import { useStepperContext } from "./Stepper";

export interface StepperActionsProps extends HTMLAttributes<HTMLDivElement> {
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  busy?: boolean;
  backLabel?: string;
  doneLabel?: string;
}

const StepperActions = forwardRef<HTMLDivElement, StepperActionsProps>(
  (
    { onBack, onNext, nextLabel, nextDisabled, busy, backLabel = "Back", doneLabel = "Done", className, ...rest },
    ref,
  ) => {
    const { steps, currentIndex, currentStep, isLast, isTerminal, go, orientation } = useStepperContext();

    const isFirst = currentIndex === 0;
    const showBack = !isFirst && !isTerminal;
    const showNext = Boolean(onNext) || isLast || isTerminal;

    const handleBack = onBack ?? (() => {
      const previous = steps[currentIndex - 1];
      if (previous) go(previous.id);
    });

    return (
      <div ref={ref} className={cn("flex items-center justify-end gap-inline", orientation === "vertical" && "basis-full", className)} {...rest}>
        {showBack && (
          <Button variant="ghost" onClick={handleBack} disabled={busy}>
            {backLabel}
          </Button>
        )}
        {showNext && (
          <Button
            variant="primary"
            onClick={onNext}
            loading={busy}
            disabled={nextDisabled || Boolean(currentStep.error)}
          >
            {nextLabel ?? (isLast || isTerminal ? doneLabel : "Continue")}
          </Button>
        )}
      </div>
    );
  },
);
StepperActions.displayName = "StepperActions";

export { StepperActions };
