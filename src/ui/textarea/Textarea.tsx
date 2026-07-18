import { forwardRef, useRef, useCallback } from "react";
import type { TextareaHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const textareaVariants = cva(
  "flex w-full rounded-ui border bg-bg px-3 py-2 text-sm ring-offset-bg placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:hover:bg-muted [&::-webkit-scrollbar-track]:bg-transparent",
  {
    variants: {
      variant: {
        default: "border-border",
        filled: "border-transparent bg-secondary",
      },
      invalid: {
        true: "border-danger ring-danger/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  autoResize?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, invalid, autoResize, onChange, ...props }, ref) => {
    const internalRef = useRef<HTMLTextAreaElement | null>(null);
    const setRef = useCallback(
      (node: HTMLTextAreaElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const resize = useCallback((el: HTMLTextAreaElement) => {
      el.style.height = "auto";
      el.style.height = `${el.scrollHeight}px`;
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize) resize(e.currentTarget);
      onChange?.(e);
    }, [autoResize, onChange, resize]);

    return (
      <textarea
        ref={setRef}
        className={cn(textareaVariants({ variant, invalid }), "min-h-[80px]", className)}
        style={{ backdropFilter: "blur(var(--backdrop-blur))" }}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
Textarea.displayName = "Textarea";

export { Textarea, textareaVariants };
