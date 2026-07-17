import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import { cn } from "../../lib/cn";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  showValue?: boolean;
}

const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, showValue, value, min = 0, max = 100, step = 1, ...props }, ref) => (
    <div className={cn("flex flex-col gap-1", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && <span className="text-sm text-fg">{label}</span>}
          {showValue && <span className="text-sm text-muted font-mono">{String(value ?? 0)}</span>}
        </div>
      )}
      <input
        ref={ref}
        type="range"
        value={value}
        min={min}
        max={max}
        step={step}
        className="w-full h-2 rounded-full bg-secondary appearance-none cursor-pointer accent-primary [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-bg [&::-webkit-slider-thumb]:shadow-card"
        {...props}
      />
    </div>
  ),
);
Slider.displayName = "Slider";

export { Slider };
