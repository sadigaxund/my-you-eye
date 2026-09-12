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
}

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
      ...props
    },
    ref,
  ) => (
    <Root
      ref={ref}
      className={cn(
        "backdrop-blur-ui",
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

export function Toaster({ children }: { children?: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const toast = useCallback(
    (data: Omit<ToastData, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...data, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <Provider>
        {toasts.map((t) => (
          <ToastItem key={t.id} {...t} />
        ))}
        <Viewport className="fixed bottom-panel right-panel z-[var(--z-toast)] flex flex-col gap-inline w-full max-w-sm" />
      </Provider>
    </ToastContext.Provider>
  );
}

export { toastVariants };
