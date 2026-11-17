import { forwardRef, useCallback, useState, createContext, useContext } from "react";
import type { ReactNode } from "react";
import {
  Provider,
  Root,
  Title,
  Description,
  Close,
  Viewport,
} from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/cn";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between gap-stack rounded-ui border p-panel shadow-elevated data-[swipe=end]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0",
  {
    variants: {
      variant: {
        default: "border-border bg-surface-elevated text-fg",
        success: "border-success bg-success text-success-fg",
        danger: "border-danger bg-danger text-danger-fg",
      },
      // `soft` swaps the full-bleed status fill for an elevated surface with
      // a thicker left accent bar (the Alert `note`/`tip` idiom) — status
      // still reads instantly via the bar + title colour, without the panel
      // becoming a solid colour block. `solid` reproduces today's classes
      // exactly (issue #40).
      tone: {
        solid: "",
        soft: "bg-surface-elevated text-fg border border-border border-l-4",
      },
    },
    compoundVariants: [
      { tone: "soft", variant: "default", className: "border-l-border" },
      { tone: "soft", variant: "success", className: "border-l-success" },
      { tone: "soft", variant: "danger", className: "border-l-danger" },
    ],
    defaultVariants: {
      variant: "default",
      tone: "solid",
    },
  },
);

// Title/description colour also shifts under `soft` (status colour moves
// from the panel fill to the title text); kept as their own small CVAs
// rather than folded into `toastVariants` since they target different
// elements than the Root.
const toastTitleVariants = cva("text-sm font-semibold", {
  variants: {
    tone: { solid: "", soft: "" },
    variant: { default: "", success: "", danger: "" },
  },
  compoundVariants: [
    { tone: "soft", variant: "default", className: "text-fg" },
    { tone: "soft", variant: "success", className: "text-success" },
    { tone: "soft", variant: "danger", className: "text-danger" },
  ],
  defaultVariants: { tone: "solid", variant: "default" },
});

const toastDescriptionVariants = cva("text-sm", {
  variants: {
    tone: {
      solid: "opacity-90",
      soft: "text-muted",
    },
  },
  defaultVariants: { tone: "solid" },
});

/** Per-slot class overrides for one toast (#40). Each is merged last, after
 * the variant classes, via `cn()`. */
export interface ToastClassNames {
  /** The toast panel — same target as `ToastData.className`. */
  root?: string;
  title?: string;
  description?: string;
  /** The close button. */
  close?: string;
}

export interface ToastData {
  id: string;
  title: string;
  description?: string;
  /** Status colour. */
  variant?: "default" | "success" | "danger";
  /** `solid` (default): full-bleed status fill. `soft`: elevated surface,
   * 1px border and a status-coloured left accent bar + title. */
  tone?: "solid" | "soft";
  /** Extra classes on the toast panel. */
  className?: string;
  /** Per-slot class overrides. */
  classNames?: ToastClassNames;
  /** Auto-dismiss delay in ms for this toast; overrides `Toaster`'s `duration`. */
  duration?: number;
  /**
   * Screen-reader urgency. `polite` renders a `role="status"` (Radix
   * `background` type); `assertive` is `foreground` (interrupts). Default is
   * Radix's own: assertive.
   */
  politeness?: "polite" | "assertive";
}

export type ToasterPlacement =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

// Declared as `ToastProps` because scripts/gen-manifest.mjs documents the
// props of the "Toast" showcase page from `<Title>Props`; the public name is
// the `ToasterProps` alias below.
interface ToastProps {
  /** Where the toast stack sits from `sm` up. Default `"bottom-right"`. */
  placement?: ToasterPlacement;
  /** Where the stack sits below the `sm` breakpoint. Defaults to `placement`. */
  mobilePlacement?: ToasterPlacement;
  /** Max toasts shown at once; when exceeded the oldest are removed. Default unlimited. */
  limit?: number;
  /** Default auto-dismiss delay in ms (Radix default 5000). A toast's own `duration` wins. */
  duration?: number;
  /** Accessible label of the toast region (Radix default "Notifications (F8)"). */
  label?: string;
  children?: ReactNode;
}

export type ToasterProps = ToastProps;

// Static lookup maps: Tailwind must see every class literally. Each entry
// resets the opposing edge so the unprefixed (mobile) and `sm:` sets can
// override one another.
const MOBILE_PLACEMENT: Record<ToasterPlacement, string> = {
  "top-left": "top-panel bottom-auto left-panel right-auto translate-x-0",
  "top-center": "top-panel bottom-auto left-1/2 right-auto -translate-x-1/2",
  "top-right": "top-panel bottom-auto right-panel left-auto translate-x-0",
  "bottom-left": "bottom-panel top-auto left-panel right-auto translate-x-0",
  "bottom-center": "bottom-panel top-auto left-1/2 right-auto -translate-x-1/2",
  "bottom-right": "bottom-panel top-auto right-panel left-auto translate-x-0",
};
const DESKTOP_PLACEMENT: Record<ToasterPlacement, string> = {
  "top-left": "sm:top-panel sm:bottom-auto sm:left-panel sm:right-auto sm:translate-x-0",
  "top-center": "sm:top-panel sm:bottom-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
  "top-right": "sm:top-panel sm:bottom-auto sm:right-panel sm:left-auto sm:translate-x-0",
  "bottom-left": "sm:bottom-panel sm:top-auto sm:left-panel sm:right-auto sm:translate-x-0",
  "bottom-center": "sm:bottom-panel sm:top-auto sm:left-1/2 sm:right-auto sm:-translate-x-1/2",
  "bottom-right": "sm:bottom-panel sm:top-auto sm:right-panel sm:left-auto sm:translate-x-0",
};
const SWIPE_DIRECTION: Record<ToasterPlacement, "left" | "right" | "up" | "down"> = {
  "top-left": "left",
  "top-center": "up",
  "top-right": "right",
  "bottom-left": "left",
  "bottom-center": "down",
  "bottom-right": "right",
};

interface ToastContextValue {
  toast: (data: Omit<ToastData, "id">) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <Toaster />");
  return ctx;
}

type ToastItemProps = ToastData & React.ComponentPropsWithoutRef<typeof Root>;

const ToastItem = forwardRef<React.ComponentRef<typeof Root>, ToastItemProps>(
  (
    {
      title,
      description,
      variant = "default",
      tone = "solid",
      className,
      classNames,
      politeness,
      ...props
    },
    ref,
  ) => (
    <Root
      ref={ref}
      type={politeness === "polite" ? "background" : politeness === "assertive" ? "foreground" : undefined}
      className={cn(
        "backdrop-blur-ui data-[swipe=move]:translate-y-[var(--radix-toast-swipe-move-y)] data-[swipe=cancel]:translate-y-0",
        toastVariants({ variant, tone }),
        className,
        classNames?.root,
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {title && (
          <Title className={cn(toastTitleVariants({ tone, variant }), classNames?.title)}>
            {title}
          </Title>
        )}
        {description && (
          <Description className={cn(toastDescriptionVariants({ tone }), classNames?.description)}>
            {description}
          </Description>
        )}
      </div>
      <Close className={cn("shrink-0 opacity-dim hover:opacity-100", classNames?.close)}>
        <svg viewBox="0 0 15 15" className="size-4 fill-current">
          <path d="M2 2l11 11M13 2L2 13" stroke="currentColor" strokeWidth="1.5" fill="none" />
        </svg>
      </Close>
    </Root>
  ),
);
ToastItem.displayName = "ToastItem";

export function Toaster({
  children,
  placement = "bottom-right",
  mobilePlacement = placement,
  limit,
  duration,
  label,
}: ToasterProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => {
        const next = [...prev, { ...data, id }];
        return limit !== undefined && limit >= 0 ? next.slice(Math.max(0, next.length - limit)) : next;
      });
    },
    [limit],
  );

  // Radix owns the timer (it pauses on hover/focus); we drop the toast once
  // it reports closed, whether by timeout, swipe or the close button.
  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Provider duration={duration} label={label} swipeDirection={SWIPE_DIRECTION[placement]}>
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} onOpenChange={(open) => !open && remove(t.id)} />
        ))}
        <Viewport
          className={cn(
            "fixed z-[var(--z-toast)] flex flex-col gap-inline w-full max-w-sm",
            MOBILE_PLACEMENT[mobilePlacement],
            DESKTOP_PLACEMENT[placement],
          )}
        />
      </Provider>
    </ToastContext.Provider>
  );
}

export { toastVariants };
