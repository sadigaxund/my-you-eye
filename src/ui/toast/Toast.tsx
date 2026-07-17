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
  "group pointer-events-auto relative flex w-full items-center justify-between gap-stack rounded-ui border p-panel shadow-lg data-[swipe=end]:animate-out data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0",
  {
    variants: {
      variant: {
        default: "border-border bg-bg text-fg",
        success: "border-success/30 bg-success/10 text-success",
        danger: "border-danger/30 bg-danger/10 text-danger",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: "default" | "success" | "danger";
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
  ({ title, description, variant = "default", ...props }, ref) => (
    <Root
      ref={ref}
      className={cn(toastVariants({ variant }))}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {title && <Title className="text-sm font-semibold">{title}</Title>}
        {description && <Description className="text-sm opacity-90">{description}</Description>}
      </div>
      <Close className="shrink-0 opacity-dim hover:opacity-100">
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
        <Viewport className="fixed bottom-panel right-panel z-[100] flex flex-col gap-inline w-full max-w-sm" />
      </Provider>
    </ToastContext.Provider>
  );
}
