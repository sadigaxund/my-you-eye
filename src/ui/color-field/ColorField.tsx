import { forwardRef, useEffect, useState } from "react";
import type { HTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { Input } from "../input";

export interface ColorFieldProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "defaultValue"> {
  /** Hex color, e.g. "#7c3aed". */
  value: string;
  onChange: (hex: string) => void;
  /** Quick-pick swatches rendered beside the trigger. */
  presets?: string[];
  /** Accessible name for the swatch trigger. */
  label?: string;
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

// Themed accent-color field (#20): token-styled swatch trigger over the
// platform's native <input type="color"> (its OS-level picker is genuinely
// good and fully accessible), a validated hex readout, and optional preset
// swatches. Deliberately NOT an in-app popover picker — that stays future
// work until a consumer needs presets/recents beyond this.
const ColorField = forwardRef<HTMLDivElement, ColorFieldProps>(
  ({ className, value, onChange, presets, label = "Pick a color", ...props }, ref) => {
    const [text, setText] = useState(value);
    useEffect(() => setText(value), [value]);
    const valid = HEX_RE.test(text);

    return (
      <div ref={ref} className={cn("flex min-w-0 items-center gap-2", className)} {...props}>
        <label
          className="relative inline-flex size-8 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-ui border border-border shadow-subtle"
          style={{ backgroundColor: valid ? text : value }}
        >
          <input
            type="color"
            aria-label={label}
            value={value}
            onChange={(e) => {
              setText(e.target.value);
              onChange(e.target.value);
            }}
            className="sr-only"
          />
        </label>
        {/* Hex readout commits only valid values; invalid intermediate text
            shows the danger border but never propagates upward. */}
        <Input
          size="sm"
          value={text}
          onChange={(e) => {
            const next = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
            setText(next);
            if (HEX_RE.test(next)) onChange(next.toLowerCase());
          }}
          aria-label="Color as hex"
          className={cn("w-24 font-mono uppercase", !valid && "border-danger")}
          spellCheck={false}
        />
        {presets && presets.length > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            {presets.map((preset) => (
              <button
                key={preset}
                type="button"
                aria-label={`Use ${preset}`}
                onClick={() => {
                  setText(preset);
                  onChange(preset);
                }}
                className={cn(
                  "size-5 cursor-pointer rounded-ui-sm border",
                  value.toLowerCase() === preset.toLowerCase() ? "border-primary ring-[length:var(--focus-ring-width)] ring-ring" : "border-border",
                )}
                style={{ backgroundColor: preset }}
              />
            ))}
          </div>
        )}
      </div>
    );
  },
);
ColorField.displayName = "ColorField";

export { ColorField };
