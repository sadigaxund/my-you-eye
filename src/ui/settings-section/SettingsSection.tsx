import { forwardRef, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { SettingsSectionContext } from "./SettingsSection.context";
import type { SettingsControlWidth } from "../settings-row/SettingsRow";

export interface SettingsSectionProps extends HTMLAttributes<HTMLElement> {
  /** Section heading; also labels the `<section>` landmark. */
  title: string;
  /** Short blurb under the heading. */
  description?: ReactNode;
  /** Shared default `controlWidth` for every `SettingsRow` inside, so their
   * control columns line up. A row's own `controlWidth` prop overrides this.
   * Default "md". */
  controlWidth?: SettingsControlWidth;
  /** `SettingsRow`s, rendered with a rule between each. */
  children: ReactNode;
}

// `@container/settings-section` lets a future row-layout decision react to
// the section's own width (not just the viewport) — mirrors Toolbar's
// `@container/toolbar` wrapper idiom.
const SettingsSection = forwardRef<HTMLElement, SettingsSectionProps>(
  ({ title, description, controlWidth = "md", className, children, ...props }, ref) => {
    const headingId = useId();
    return (
      <section
        ref={ref}
        aria-labelledby={headingId}
        className={cn("@container/settings-section flex flex-col gap-stack", className)}
        {...props}
      >
        <div className="flex flex-col gap-tight">
          <h3 id={headingId} className="text-base font-semibold text-fg">
            {title}
          </h3>
          {description && <p className="text-sm text-muted">{description}</p>}
        </div>
        <SettingsSectionContext.Provider value={{ controlWidth }}>
          <div className="flex flex-col divide-y divide-border">{children}</div>
        </SettingsSectionContext.Provider>
      </section>
    );
  },
);
SettingsSection.displayName = "SettingsSection";

export { SettingsSection };
