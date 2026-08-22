import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const sliderTrackVariants = cva(
  "w-full rounded-full bg-secondary appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:shadow-card",
  {
    variants: {
      // "sm" is the compact/unlabelled track used when a Slider is composed
      // inline (e.g. CellType's AudioDisplay seek bar) rather than shown as
      // its own labelled control.
      size: {
        sm: "h-1 [&::-webkit-slider-thumb]:size-3",
        md: "h-2 [&::-webkit-slider-thumb]:size-4",
      },
    },
    defaultVariants: {
      size: "md",
    },
  },
);

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size">, VariantProps<typeof sliderTrackVariants> {
  label?: string;
  showValue?: boolean;
}

// A `step` of 1 over the default 0–100 range means the thumb can only land
// on ~1% increments — on a typical ~200-400px track that's a jump every
// few px, which reads as low-fps/jittery dragging even though nothing is
// actually dropping frames (AGENTS.md TODO A11: this is quantization, not
// jitter). Deriving a default from the actual range gives ~500 steps
// across it regardless of what that range is, fine enough granularity
// that dragging reads as continuous on any realistic track width. Any
// caller that wants coarse, meaningful steps (e.g. an integer count 1–10)
// still passes `step` explicitly and gets exactly that.
function defaultStep(min: number, max: number): number {
  return Math.max((max - min) / 500, 0.001);
}

/**
 * How many decimals to show for a given step. The fine default step above
 * makes the raw value a long float (`33.400000000000006`) — displaying
 * `String(value)` printed all of it, which both read as noise and pushed
 * the readout past the right edge of the row. The displayed precision is
 * derived from the step, so an explicit `step={1}` still reads "42", while
 * the derived fine step rounds to something a human can take in.
 *
 * This is display only: the input's own `value`/`step` are untouched, so
 * dragging stays as smooth as the step allows and the value a caller
 * receives in `onChange` is unchanged.
 */
function decimalsForStep(step: number): number {
  if (step >= 1) return 0;
  if (step >= 0.1) return 1;
  if (step >= 0.01) return 2;
  return 3;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, size, value, min = 0, max = 100, step, ...props }, ref) => {
    const resolvedMin = Number(min);
    const resolvedMax = Number(max);
    const resolvedStep = step != null ? Number(step) : defaultStep(resolvedMin, resolvedMax);
    return (
      <div className={cn("flex flex-col gap-1", className)}>
        {(label || showValue) && (
          <div className="flex items-center justify-between">
            {label && <span className="text-sm text-fg truncate">{label}</span>}
            {showValue && (
              // `tabular-nums` + `shrink-0` so the readout keeps a constant
              // width while dragging — otherwise the label reflows on every
              // digit change.
              <span className="text-sm text-muted font-mono tabular-nums shrink-0">
                {Number(value ?? 0).toFixed(decimalsForStep(resolvedStep))}
              </span>
            )}
          </div>
        )}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          step={resolvedStep}
          className={sliderTrackVariants({ size })}
          {...props}
        />
      </div>
    );
  },
);
Slider.displayName = "Slider";

export { Slider, sliderTrackVariants };
