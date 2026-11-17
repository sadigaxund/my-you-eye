import { createElement, forwardRef } from "react";
import type { LiHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface ThreadStopProps extends Omit<LiHTMLAttributes<HTMLLIElement>, "title"> {
  /** The stop's title, rendered next to the marker. */
  label: ReactNode;
  /** Secondary text (e.g. a date range) after the label; wraps under it when narrow. */
  meta?: ReactNode;
  /** Renders the label as this heading level instead of plain text. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Fills the marker and sets `aria-current="step"`. */
  current?: boolean;
  /** Body shown below the label. */
  children?: ReactNode;
}

/**
 * One stop of a `Thread`. The rule is drawn per stop (marker bottom to this item's
 * bottom) so it joins stop to stop and ends at the last marker. `relative` on the
 * `li` anchors the absolutely positioned marker and rule. The label line is fixed
 * at `leading-6` so the marker's offset is a pure function of the marker token.
 *
 * Text strategy: label and body use `wrap-anywhere` (inside `min-w-0` blocks, not
 * flex text); meta wraps the same way.
 */
const ThreadStop = forwardRef<HTMLLIElement, ThreadStopProps>(
  ({ className, label, meta, headingLevel, current, children, ...props }, ref) => {
    const labelClass = "min-w-0 font-medium leading-6 text-fg wrap-anywhere";
    return (
      <li
        ref={ref}
        aria-current={current ? "step" : undefined}
        className={cn("group relative ps-[calc(var(--thread-marker)+var(--spacing-inline)*2)] pb-6 last:pb-0", className)}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute start-0 top-[calc((1.5rem-var(--thread-marker))/2)] box-border size-(--thread-marker) rounded-full border-(length:--spacing-thread-rule) border-(--thread-ring)",
            current && "border-(--thread-current) bg-(--thread-current)",
          )}
        />
        <span
          aria-hidden="true"
          className="absolute bottom-0 top-[calc((1.5rem+var(--thread-marker))/2)] w-(--spacing-thread-rule) -translate-x-1/2 bg-(--thread-color) group-last:hidden start-[calc(var(--thread-marker)/2)] rtl:translate-x-1/2"
        />
        <div className="min-w-0 leading-6">
          {headingLevel
            ? createElement(`h${headingLevel}`, { className: cn(labelClass, "m-0 inline text-[length:inherit]") }, label)
            : <span className={labelClass}>{label}</span>}
          {meta != null && (
            <span className="ms-inline min-w-0 text-sm text-muted wrap-anywhere">{meta}</span>
          )}
        </div>
        {children != null && (
          <div className="min-w-0 pt-1 text-sm text-muted wrap-anywhere">{children}</div>
        )}
      </li>
    );
  },
);
ThreadStop.displayName = "ThreadStop";

export { ThreadStop };
