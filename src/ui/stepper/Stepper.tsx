import { createContext, forwardRef, useContext, useRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface StepperStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  /** Blocks Continue and shows on the step marker. */
  error?: string;
  /** A result/summary step: reaching it hides Back and locks every earlier step. */
  terminal?: boolean;
}

export interface StepperProps extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  steps: readonly StepperStep[];
  current: string;
  onCurrentChange: (id: string) => void;
  completed?: ReadonlySet<string>;
  orientation?: "horizontal" | "vertical";
  children: ReactNode;
}

interface StepperContextValue {
  steps: readonly StepperStep[];
  current: string;
  currentIndex: number;
  completed: ReadonlySet<string>;
  orientation: "horizontal" | "vertical";
  isReachable: (id: string) => boolean;
  isLocked: (id: string) => boolean;
  go: (id: string) => void;
  isLast: boolean;
  isTerminal: boolean;
  currentStep: StepperStep;
  /** Increments every time `current` changes after mount (never on the
   * initial render) — see `StepperPanelTitle`'s focus-management docblock. */
  changeCount: number;
}

const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext(): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error("Stepper.* components must be rendered inside a <Stepper>.");
  }
  return ctx;
}

/** A step is reachable iff it is current, already completed, or is the first
 * step (in order) not yet completed. When the CURRENT step is terminal
 * (a result/summary screen), every step before it is locked too — result
 * screens are not navigable back into. */
function isStepReachable(
  steps: readonly StepperStep[],
  completed: ReadonlySet<string>,
  current: string,
  id: string,
): boolean {
  if (id === current) return true;
  const currentIndex = steps.findIndex((s) => s.id === current);
  const targetIndex = steps.findIndex((s) => s.id === id);
  const currentStep = steps[currentIndex];
  if (currentStep?.terminal && targetIndex < currentIndex) return false;
  if (completed.has(id)) return true;
  const firstUncompleted = steps.find((s) => !completed.has(s.id));
  return firstUncompleted?.id === id;
}

const EMPTY_COMPLETED: ReadonlySet<string> = new Set();

const Stepper = forwardRef<HTMLDivElement, StepperProps>(
  (
    {
      steps,
      current,
      onCurrentChange,
      completed = EMPTY_COMPLETED,
      orientation = "horizontal",
      className,
      children,
      ...rest
    },
    ref,
  ) => {
    // Tracks how many times `current` has changed since mount, WITHOUT
    // counting the initial render — this is the "adjust state during
    // rendering" pattern (react.dev), safe because it's idempotent per
    // committed value of `current`. StepperPanelTitle uses it to know
    // whether to steal focus (never on first mount, always on advance).
    const [changeCount, setChangeCount] = useState(0);
    const prevCurrentRef = useRef(current);
    if (prevCurrentRef.current !== current) {
      prevCurrentRef.current = current;
      setChangeCount((c) => c + 1);
    }

    const currentIndex = steps.findIndex((s) => s.id === current);
    const currentStep = steps[currentIndex] ?? steps[0];
    const isLast = currentIndex === steps.length - 1;
    const isTerminal = currentStep?.terminal === true;

    const isReachable = (id: string) => isStepReachable(steps, completed, current, id);
    const isLocked = (id: string) => !isReachable(id);
    const go = (id: string) => {
      if (isLocked(id)) return;
      onCurrentChange(id);
    };

    const value: StepperContextValue = {
      steps,
      current,
      currentIndex,
      completed,
      orientation,
      isReachable,
      isLocked,
      go,
      isLast,
      isTerminal,
      currentStep,
      changeCount,
    };

    return (
      <StepperContext.Provider value={value}>
        <div
          ref={ref}
          data-orientation={orientation}
          className={cn(
            // Vertical: list column on the left, panel (min-w-0 flex-1)
            // beside it, and StepperActions wraps onto its own full-width
            // row below (basis-full) — no wrapper element needed.
            orientation === "vertical"
              ? "flex flex-row flex-wrap items-start gap-panel"
              : "flex flex-col gap-stack",
            className,
          )}
          {...rest}
        >
          {children}
        </div>
      </StepperContext.Provider>
    );
  },
);
Stepper.displayName = "Stepper";

export { Stepper };
