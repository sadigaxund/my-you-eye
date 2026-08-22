import { forwardRef, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { Input } from "../input";

export interface FindOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
}

export interface FindWidgetProps extends Omit<HTMLAttributes<HTMLDivElement>, "onClose"> {
  query: string;
  onQueryChange: (query: string) => void;
  /** Total matches for the current query; omit renders no counter. */
  matchCount?: number;
  /** Zero-based active match; rendered as "activeMatch + 1 of matchCount". */
  activeMatch?: number;
  /** Render the replace row (gate it off yourself for read-only surfaces). */
  replaceable?: boolean;
  replaceValue?: string;
  onReplaceValueChange?: (value: string) => void;
  options: FindOptions;
  onOptionsChange?: (options: FindOptions) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onReplace?: () => void;
  onReplaceAll?: () => void;
  onClose: () => void;
}

// Engine-agnostic floating find/replace card (#4): a positioned overlay that
// docks to the top-right of an arbitrary `position: relative` container —
// NOT a modal, and never pushes content down. The consumer owns the search
// engine (CodeMirror's @codemirror/search, a text scan, anything) and all
// state; this widget is fully controlled. Keyboard contract: Enter = next,
// Shift+Enter = previous, Enter in the replace field = replace, Escape
// anywhere closes.
const FindWidget = forwardRef<HTMLDivElement, FindWidgetProps>(
  (
    {
      className,
      query, onQueryChange, matchCount, activeMatch,
      replaceable = false, replaceValue, onReplaceValueChange,
      options, onOptionsChange,
      onNext, onPrevious, onReplace, onReplaceAll, onClose,
      ...props
    },
    ref,
  ) => {
    const [replaceOpen, setReplaceOpen] = useState(false);
    const showReplaceRow = replaceable && replaceOpen;

    const toggle = (key: keyof FindOptions) => () =>
      onOptionsChange?.({ ...options, [key]: !options[key] });

    return (
      <div
        ref={ref}
        role="search"
        className={cn(
          "absolute right-2 top-2 z-20 flex w-80 flex-col gap-1 rounded-ui border border-border bg-surface-opaque p-1 shadow-elevated",
          className,
        )}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            e.stopPropagation();
            onClose();
          }
        }}
        {...props}
      >
        <div className="flex items-center gap-1">
          {replaceable && (
            <button
              type="button"
              aria-expanded={replaceOpen ? true : undefined}
              aria-label="Toggle replace row"
              onClick={() => setReplaceOpen((o) => !o)}
              className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-ui-sm text-muted hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring"
            >
              <svg viewBox="0 0 12 12" aria-hidden="true" className={cn("size-3 fill-none stroke-current transition-transform duration-[var(--duration-fast)]", showReplaceRow && "rotate-90")}>
                <path d="M4 2l4 4-4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
          <Input
            size="sm"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (e.shiftKey) onPrevious?.();
                else onNext?.();
              }
            }}
            placeholder="Find"
            aria-label="Find"
            className="h-7 min-w-0 flex-1"
          />
          <FindToggle pressed={Boolean(options.caseSensitive)} onPress={toggle("caseSensitive")} label="Match case">
            <path d="M3 11L6.5 3l3.5 8M4.4 8h4.2M12.5 5v4a1.5 1.5 0 003 0V5" />
          </FindToggle>
          <FindToggle pressed={Boolean(options.wholeWord)} onPress={toggle("wholeWord")} label="Match whole word">
            <path d="M2 9h10M4 4.5a2 2 0 104 0V6a2 2 0 11-4 .5z" />
          </FindToggle>
          <FindToggle pressed={Boolean(options.regex)} onPress={toggle("regex")} label="Use regular expression">
            <path d="M3 11h1.5M6 3l4 8M10 3L6 11" />
          </FindToggle>
          {typeof matchCount === "number" && (
            <span aria-live="polite" className={cn("shrink-0 whitespace-nowrap px-1 font-mono text-xs", matchCount === 0 && "text-danger")}>
              {matchCount === 0 ? "No results" : `${matchCount > 0 ? (activeMatch ?? 0) + 1 : 0} of ${matchCount}`}
            </span>
          )}
          <FindIconButton label="Previous match" onClick={onPrevious}>
            <path d="M8 3L4 7l4 4" />
          </FindIconButton>
          <FindIconButton label="Next match" onClick={onNext}>
            <path d="M6 3l4 4-4 4" />
          </FindIconButton>
          <FindIconButton label="Close" onClick={onClose}>
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </FindIconButton>
        </div>
        {showReplaceRow && (
          <div className="flex items-center gap-1 pl-7">
            <Input
              size="sm"
              value={replaceValue ?? ""}
              onChange={(e) => onReplaceValueChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onReplace?.();
                }
              }}
              placeholder="Replace"
              aria-label="Replace with"
              className="h-7 min-w-0 flex-1"
            />
            <button
              type="button"
              onClick={onReplace}
              disabled={!onReplace}
              className="shrink-0 cursor-pointer rounded-ui-sm px-2 py-1 text-xs hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={onReplaceAll}
              disabled={!onReplaceAll}
              className="shrink-0 cursor-pointer rounded-ui-sm px-2 py-1 text-xs hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              All
            </button>
          </div>
        )}
      </div>
    );
  },
);
FindWidget.displayName = "FindWidget";

function FindToggle({
  pressed, onPress, label, children,
}: {
  pressed: boolean;
  onPress: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed ? true : undefined}
      aria-label={label}
      title={label}
      onClick={onPress}
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-ui-sm fill-none stroke-current",
        pressed
          ? "bg-primary/15 text-primary"
          : "text-muted hover:bg-surface-hover hover:text-fg",
        "focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

function FindIconButton({
  label, onClick, children,
}: {
  label: string;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-ui-sm fill-none stroke-current text-muted",
        "hover:bg-surface-hover hover:text-fg focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
        "disabled:pointer-events-none disabled:opacity-50",
      )}
    >
      <svg viewBox="0 0 16 16" aria-hidden="true" className="size-3.5 stroke-current" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </button>
  );
}

export { FindWidget };
