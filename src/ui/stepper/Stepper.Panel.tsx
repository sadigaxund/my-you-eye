import { createContext, forwardRef, useContext, useEffect, useId, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { useStepperContext } from "./Stepper";

interface StepperPanelContextValue {
  titleId: string;
  /** Whether the title mounting right now should steal focus — mirrors the
   * root's changeCount (see StepperPanelTitle's docblock). */
  shouldFocus: boolean;
  registerTitle: () => void;
}

const StepperPanelContext = createContext<StepperPanelContextValue | null>(null);

export interface StepperPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** The step id this panel belongs to. Renders nothing unless it matches
   * the Stepper's current step. */
  step: string;
}

const StepperPanel = forwardRef<HTMLDivElement, StepperPanelProps>(
  ({ step, className, children, ...rest }, ref) => {
    const { current, currentStep, changeCount, orientation } = useStepperContext();
    const titleId = useId();
    const [hasTitle, setHasTitle] = useState(false);
    const registerTitle = () => setHasTitle(true);

    if (step !== current) return null;

    return (
      <StepperPanelContext.Provider value={{ titleId, shouldFocus: changeCount > 0, registerTitle }}>
        <div
          ref={ref}
          role="region"
          aria-labelledby={hasTitle ? titleId : undefined}
          aria-label={hasTitle ? undefined : currentStep.label}
          data-step={step}
          className={cn("flex flex-col gap-stack", orientation === "vertical" && "min-w-0 flex-1", className)}
          {...rest}
        >
          {children}
        </div>
      </StepperPanelContext.Provider>
    );
  },
);
StepperPanel.displayName = "StepperPanel";

export interface StepperPanelTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading level to render. Default `"h3"`. */
  as?: "h2" | "h3" | "h4";
}

/**
 * Renders the current panel's heading and manages focus on step advance.
 *
 * Focus is moved to this heading whenever the Stepper's `current` step
 * changes AFTER mount — but never on the very first mount. That distinction
 * matters because a Stepper is frequently opened inside a Dialog: Radix
 * moves initial focus to the dialog's own first focusable element, and a
 * Stepper that grabbed focus for itself on mount would fight that. We rely
 * on the root Stepper's `changeCount` (0 until the first advance, then
 * incrementing) surfaced here as `shouldFocus` via the panel context: a new
 * StepperPanelTitle instance mounts each time `current` changes (its parent
 * StepperPanel unmounts/remounts), so "focus on mount, but only when
 * shouldFocus is true" is exactly "focus on every advance, never on first
 * mount". `shouldFocus` is read through a ref so the mount effect does not
 * need it in its dependency array and does not refire while this instance
 * stays mounted.
 */
const StepperPanelTitle = forwardRef<HTMLHeadingElement, StepperPanelTitleProps>(
  ({ as: Heading = "h3", className, ...rest }, forwardedRef) => {
    const panelCtx = useContext(StepperPanelContext);
    const headingRef = useRef<HTMLHeadingElement | null>(null);
    const shouldFocusRef = useRef(panelCtx?.shouldFocus ?? false);
    shouldFocusRef.current = panelCtx?.shouldFocus ?? false;

    useEffect(() => {
      panelCtx?.registerTitle();
      if (shouldFocusRef.current) headingRef.current?.focus();
      // Intentionally empty deps: a fresh StepperPanelTitle instance mounts
      // once per step change (its parent StepperPanel mounts/unmounts with
      // it), so this must run exactly once per mount. registerTitle and
      // shouldFocus are read via panelCtx/shouldFocusRef precisely so they
      // don't need to be (and aren't) effect dependencies here.
    }, []);

    const setRefs = (node: HTMLHeadingElement | null) => {
      headingRef.current = node;
      if (typeof forwardedRef === "function") forwardedRef(node);
      else if (forwardedRef) forwardedRef.current = node;
    };

    return (
      <Heading
        ref={setRefs}
        id={panelCtx?.titleId}
        tabIndex={-1}
        className={cn("text-base font-semibold text-fg outline-none", className)}
        {...rest}
      />
    );
  },
);
StepperPanelTitle.displayName = "StepperPanelTitle";

export { StepperPanel, StepperPanelTitle };
