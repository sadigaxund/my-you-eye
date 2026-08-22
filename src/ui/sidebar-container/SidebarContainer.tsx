import { forwardRef, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ResizeHandle } from "../split-pane";

const MIN_WIDTH = 160;
const COLLAPSE_THRESHOLD = 96;

export interface SidebarContainerProps extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  label: string;
  /** Trailing header icons (new-file, refresh…). */
  headerActions?: ReactNode;
  /** Controlled width in px — a property of the REGION, not of any one view,
   *  so views mounted into the shell share one width (#13). */
  width: number;
  onWidthChange: (width: number) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  /** Resize ceiling. Default min(50vw, fallback). */
  maxWidth?: number;
  children: ReactNode;
}

// Persistent collapsible/resizable side-panel region (#13) — the layout
// counterpart of Drawer (which is a transient overlay). The resize handle
// stays MOUNTED even while collapsed, acting as a thin grab edge that both
// restores the panel and keeps one drag mechanic for open and collapsed
// states. Dragging below the collapse threshold auto-collapses; dragging
// back out auto-restores at MIN_WIDTH. Paints from --color-sidebar-*.
const SidebarContainer = forwardRef<HTMLElement, SidebarContainerProps>(
  (
    { className, label, headerActions, width, onWidthChange, collapsed, onCollapsedChange, maxWidth, children, ...props },
    ref,
  ) => {
    // Gesture-start anchor: ResizeHandle reports cumulative deltas, so the
    // pre-drag width/collapsed state must be captured once per gesture.
    const startRef = useRef<{ width: number; collapsed: boolean; max: number } | null>(null);

    const clampMax = () => {
      const vw = typeof window !== "undefined" ? window.innerWidth * 0.5 : Number.POSITIVE_INFINITY;
      return Math.min(vw, maxWidth ?? Number.POSITIVE_INFINITY);
    };

    return (
      <>
        <aside
          ref={ref}
          data-collapsed={collapsed || undefined}
          aria-label={label}
          aria-hidden={collapsed || undefined}
          className={cn(
            "flex shrink-0 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar",
            collapsed && "border-r-0",
            className,
          )}
          style={{ width: collapsed ? 0 : width }}
          {...props}
        >
          <div className="flex h-8 shrink-0 items-center justify-between gap-2 pl-3 pr-1">
            <span className="truncate font-mono text-xs uppercase tracking-wider text-muted">{label}</span>
            {headerActions && <div className="flex shrink-0 items-center gap-0.5">{headerActions}</div>}
          </div>
          <div className="min-h-0 flex-1">{children}</div>
        </aside>
        <ResizeHandle
          direction="row"
          aria-label={`Resize ${label} sidebar`}
          onDragStart={() => {
            startRef.current = { width, collapsed, max: clampMax() };
          }}
          onDrag={(delta) => {
            const s = startRef.current;
            if (!s) return;
            if (s.collapsed) {
              if (delta > 16) {
                onCollapsedChange(false);
                onWidthChange(Math.max(MIN_WIDTH, Math.round(s.width || MIN_WIDTH)));
              }
              return;
            }
            const next = Math.round(Math.min(Math.max(s.width + delta, MIN_WIDTH), s.max));
            if (next <= COLLAPSE_THRESHOLD) onCollapsedChange(true);
            else onWidthChange(next);
          }}
        />
      </>
    );
  },
);
SidebarContainer.displayName = "SidebarContainer";

export { SidebarContainer };
