import { forwardRef, useRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/cn";

export interface EditorTab {
  id: string;
  label: string;
  icon?: ReactNode;
  /** Unsaved-changes dot — sits BESIDE the close button, never replaces it. */
  dirty?: boolean;
  /** Ephemeral preview tab — rendered italic. */
  preview?: boolean;
}

export interface EditorTabBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onSelect"> {
  tabs: EditorTab[];
  activeId?: string;
  onSelect?: (id: string) => void;
  onClose?: (id: string) => void;
  /** Within-bar drag reorder: dragged tab dropped onto targetId. */
  onMove?: (draggedId: string, targetId: string) => void;
  /** Given a tab, returns the JSON-ready payload written to dataTransfer
   *  under "application/x-tab" on dragstart, so pane-edge drop zones can
   *  dock the dragged document (e.g. { path, paneId, name }). Omit to make
   *  tabs non-draggable to external targets; within-bar reorder still works. */
  dragPayload?: (tab: EditorTab) => Record<string, unknown>;
  /** Trailing slot after the tabs (the home for a "…" overflow trigger). */
  actions?: ReactNode;
}

// Document tab strip (#5) — closeable/draggable open-document tabs, distinct
// from `Tabs` (content-switching nav with one active panel). Shares Tabs'
// visual language: underline active state, filing-style scroll behavior.
//
// Keyboard contract: roving tabindex + Left/Right moves selection,
// Enter/Space is a no-op (selection IS activation), Delete closes the
// focused tab when onClose is provided.
//
// Right-click pairing: wrap this bar's rows in ContextMenu at the call site
// for per-tab menus ("Split left/right", …) — see the ContextMenu docblock.
const EditorTabBar = forwardRef<HTMLDivElement, EditorTabBarProps>(
  ({ className, tabs, activeId, onSelect, onClose, onMove, dragPayload, actions, "aria-label": ariaLabel, ...props }, ref) => {
    const draggedId = useRef<string | null>(null);

    const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
      if (e.key === "ArrowRight" && index < tabs.length - 1) {
        e.preventDefault();
        onSelect?.(tabs[index + 1].id);
      } else if (e.key === "ArrowLeft" && index > 0) {
        e.preventDefault();
        onSelect?.(tabs[index - 1].id);
      } else if (e.key === "Delete" && onClose && tabs[index]) {
        e.preventDefault();
        onClose(tabs[index].id);
      }
    };

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel ?? "Open documents"}
        className={cn("flex min-h-9 items-stretch border-b border-sidebar-border bg-sidebar", className)}
        {...props}
      >
        <div className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-gutter:stable]">
          {tabs.map((tab, i) => {
            const active = tab.id === activeId;
            return (
              <div
                key={tab.id}
                role="tab"
                aria-selected={active ? true : undefined}
                tabIndex={active ? 0 : -1}
                draggable
                onDragStart={(e) => {
                  draggedId.current = tab.id;
                  if (dragPayload) {
                    e.dataTransfer.setData("application/x-tab", JSON.stringify(dragPayload(tab)));
                    e.dataTransfer.effectAllowed = "move";
                  }
                }}
                onDragOver={(e) => {
                  if (draggedId.current && draggedId.current !== tab.id) e.preventDefault();
                }}
                onDrop={(e) => {
                  if (draggedId.current && draggedId.current !== tab.id && onMove) {
                    e.preventDefault();
                    onMove(draggedId.current, tab.id);
                  }
                  draggedId.current = null;
                }}
                onClick={() => onSelect?.(tab.id)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className={cn(
                  "group relative flex max-w-48 shrink-0 cursor-pointer select-none items-center gap-1.5 border-b-2 px-3 py-1.5 text-sm outline-none",
                  "-mb-px",
                  active
                    ? "border-primary text-fg"
                    : "border-transparent text-muted hover:bg-sidebar-item-hover hover:text-fg",
                  "focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring focus-visible:ring-inset",
                )}
              >
                {tab.icon && (
                  <span aria-hidden="true" className="shrink-0 [&>svg]:size-3.5">
                    {tab.icon}
                  </span>
                )}
                <span className={cn("truncate", tab.preview && "italic")}>{tab.label}</span>
                {/* The dirty dot never replaces the close button — it sits
                    beside it so closing stays discoverable while dirty. */}
                {tab.dirty && (
                  <span aria-label="Unsaved changes" role="img" className="size-1.5 shrink-0 rounded-full bg-warning" />
                )}
                {onClose && (
                  <button
                    type="button"
                    aria-label={`Close ${tab.label}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose(tab.id);
                    }}
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full text-muted",
                      "hover:bg-sidebar-item-active hover:text-fg focus-visible:outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring",
                    )}
                  >
                    <svg viewBox="0 0 8 8" aria-hidden="true" className="size-2 fill-none stroke-current strokeWidth-[1.25]">
                      <path d="M1 1l6 6M7 1L1 7" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })}
        </div>
        {actions && (
          <div className="flex shrink-0 items-center gap-1 px-2">{actions}</div>
        )}
      </div>
    );
  },
);
EditorTabBar.displayName = "EditorTabBar";

export { EditorTabBar };
