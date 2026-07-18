import { forwardRef } from "react";
import { Provider, Root, Trigger, Portal, Content } from "@radix-ui/react-tooltip";
import { cn } from "../../lib/cn";

const TooltipProvider = Provider;

interface TooltipProps {
  content: string;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
}

const Tooltip = ({ content, side = "top", children }: TooltipProps) => (
  <Root>
    <Trigger asChild>{children}</Trigger>
    <Portal>
      <Content
        side={side}
        sideOffset={4}
        className={cn(
          "z-50 overflow-hidden rounded-ui-sm bg-bg text-fg border border-border px-2.5 py-1 text-xs shadow-lg",
          "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        )}
        style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
      >
        {content}
      </Content>
    </Portal>
  </Root>
);

const TooltipContent = forwardRef<React.ComponentRef<typeof Content>, React.ComponentPropsWithoutRef<typeof Content>>(
  ({ className, ...props }, ref) => (
    <Content
      ref={ref}
      sideOffset={4}
      className={cn(
        "z-50 overflow-hidden rounded-ui-sm bg-bg text-fg border border-border px-2.5 py-1 text-xs shadow-lg",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        className,
      )}
      style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
      {...props}
    />
  ),
);
TooltipContent.displayName = "TooltipContent";

export { TooltipProvider, Tooltip, TooltipContent, Root as TooltipRoot, Trigger as TooltipTrigger };
