import { forwardRef } from "react";
import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { Label } from "../label";
import { useSettingsSection } from "../settings-section/SettingsSection.context";

export type SettingsControlWidth = "auto" | "xs" | "sm" | "md" | "lg" | "full";

const CONTROL_WIDTH_VAR = {
  xs: "var(--width-settings-control-xs)",
  sm: "var(--width-settings-control-sm)",
  md: "var(--width-settings-control-md)",
  lg: "var(--width-settings-control-lg)",
} as const;

const settingsRowVariants = cva("flex flex-col gap-inline", {
  variants: {
    stackAt: {
      sm: "@sm/settings-row:flex-row @sm/settings-row:items-start @sm/settings-row:justify-between @sm/settings-row:gap-panel",
      md: "@md/settings-row:flex-row @md/settings-row:items-start @md/settings-row:justify-between @md/settings-row:gap-panel",
    },
  },
  defaultVariants: {
    stackAt: "sm",
  },
});

export interface SettingsRowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children">,
    VariantProps<typeof settingsRowVariants> {
  label: ReactNode;
  description?: ReactNode;
  /** Associates the left column's `<Label>` with the control (a Switch's
   * `id`, say) so the whole label+description column becomes its click
   * target. Radix `Label` renders a native `<label>` — when set, keep the
   * left column's children to phrasing content (plain text/spans), the way
   * this component already does. */
  htmlFor?: string;
  /** Overrides the width the row inherits from its `SettingsSection`
   * (`"auto"` when there is no enclosing section and this is unset). */
  controlWidth?: SettingsControlWidth;
  /** Container-query breakpoint at which the row switches from stacked
   * (label above control) to a single row (label left, control right).
   * `"sm"` (default) or `"md"` — the repo has no facility for an arbitrary
   * numeric breakpoint. */
  stackAt?: "sm" | "md";
  /** The control (Switch, Input, Select, ...). */
  children: ReactNode;
}

const SettingsRow = forwardRef<HTMLDivElement, SettingsRowProps>(
  ({ label, description, htmlFor, controlWidth, stackAt = "sm", className, children, ...props }, ref) => {
    const section = useSettingsSection();
    const resolvedWidth: SettingsControlWidth = controlWidth ?? section?.controlWidth ?? "auto";

    const sizedWidth = resolvedWidth !== "auto" && resolvedWidth !== "full" ? resolvedWidth : undefined;

    const controlClasses = cn(
      "flex shrink-0 items-center justify-start",
      stackAt === "md" ? "@md/settings-row:justify-end" : "@sm/settings-row:justify-end",
      resolvedWidth === "full" &&
        (stackAt === "md" ? "w-full @md/settings-row:flex-1" : "w-full @sm/settings-row:flex-1"),
      sizedWidth &&
        (stackAt === "md"
          ? "w-full max-w-full @md/settings-row:w-[var(--settings-control-w)]"
          : "w-full max-w-full @sm/settings-row:w-[var(--settings-control-w)]"),
      (resolvedWidth === "full" || sizedWidth) && "[&>*]:w-full",
    );

    const controlStyle = sizedWidth
      ? ({ "--settings-control-w": CONTROL_WIDTH_VAR[sizedWidth] } as CSSProperties)
      : undefined;

    const titleSpan = <span className="text-sm font-medium text-fg">{label}</span>;
    const descriptionSpan = description && (
      <span className="text-sm font-normal text-muted">{description}</span>
    );

    return (
      <div
        ref={ref}
        className={cn("@container/settings-row py-panel-sm", className)}
        data-control-width={resolvedWidth}
        {...props}
      >
        <div className={settingsRowVariants({ stackAt })}>
          {htmlFor ? (
            <Label
              htmlFor={htmlFor}
              className="flex min-w-0 flex-1 cursor-pointer flex-col gap-tight leading-normal"
            >
              {titleSpan}
              {descriptionSpan}
            </Label>
          ) : (
            <div className="flex min-w-0 flex-1 flex-col gap-tight">
              {titleSpan}
              {descriptionSpan}
            </div>
          )}
          <div className={controlClasses} style={controlStyle}>
            {children}
          </div>
        </div>
      </div>
    );
  },
);
SettingsRow.displayName = "SettingsRow";

export { SettingsRow, settingsRowVariants };
