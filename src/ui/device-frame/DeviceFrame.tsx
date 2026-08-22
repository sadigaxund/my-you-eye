import { forwardRef } from "react";
import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const deviceFrameVariants = cva(
  "flex flex-col overflow-hidden bg-surface border border-border",
  {
    variants: {
      variant: {
        browser: "rounded-ui-lg shadow-card",
        window: "rounded-ui-lg shadow-card",
        phone: "rounded-ui-lg shadow-elevated p-2",
      },
    },
    defaultVariants: {
      variant: "browser",
    },
  },
);

export type DeviceFrameVariant = "browser" | "window" | "phone";

export interface DeviceFrameProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof deviceFrameVariants> {
  /** Address shown in the browser variant's URL bar. */
  url?: string;
  /** Title shown in the window variant's centered title bar (and the browser tab, if given alongside `url`). */
  title?: string;
  children: ReactNode;
}

function TrafficLights() {
  return (
    <span className="flex items-center gap-1.5 shrink-0">
      <span className="size-2.5 rounded-full bg-danger/70" />
      <span className="size-2.5 rounded-full bg-warning/70" />
      <span className="size-2.5 rounded-full bg-success/70" />
    </span>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-icon-sm shrink-0 fill-none stroke-current" strokeWidth="1.2">
      <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
      <path d="M4 5.5V4a2 2 0 0 1 4 0v1.5" />
    </svg>
  );
}

function BrowserChrome({ url, title }: { url?: string; title?: string }) {
  return (
    <div className="flex items-center gap-2 h-10 px-3 border-b border-border shrink-0">
      <TrafficLights />
      <div className="flex-1 flex items-center justify-center min-w-0">
        <div className="flex items-center gap-1.5 max-w-full px-3 py-1 rounded-ui-sm bg-secondary/40 text-code-muted">
          <LockIcon />
          <span className="text-xs truncate">{url ?? title ?? ""}</span>
        </div>
      </div>
    </div>
  );
}

function WindowChrome({ title }: { title?: string }) {
  return (
    <div className="flex items-center h-9 px-3 border-b border-border shrink-0">
      <TrafficLights />
      <span className="flex-1 text-center text-xs text-muted truncate">{title}</span>
      <span className="shrink-0" aria-hidden><TrafficLights /></span>
    </div>
  );
}

function PhoneNotch() {
  return (
    <div className="flex justify-center py-1.5 shrink-0" aria-hidden>
      <div className="h-1.5 w-16 rounded-full bg-fg/70" />
    </div>
  );
}

function PhoneHomeIndicator() {
  return (
    <div className="flex justify-center py-1.5 shrink-0" aria-hidden>
      <div className="h-1 w-24 rounded-full bg-fg/40" />
    </div>
  );
}

const DeviceFrame = forwardRef<HTMLDivElement, DeviceFrameProps>(
  ({ className, variant = "browser", url, title, children, ...props }, ref) => (
    <div ref={ref} className={cn(deviceFrameVariants({ variant }), className)} {...props}>
      {variant === "browser" && <BrowserChrome url={url} title={title} />}
      {variant === "window" && <WindowChrome title={title} />}
      {variant === "phone" && <PhoneNotch />}
      <div className={cn("flex-1 min-h-0 overflow-auto bg-bg", variant === "phone" && "rounded-ui")}>
        {children}
      </div>
      {variant === "phone" && <PhoneHomeIndicator />}
    </div>
  ),
);
DeviceFrame.displayName = "DeviceFrame";

export { DeviceFrame, deviceFrameVariants };
