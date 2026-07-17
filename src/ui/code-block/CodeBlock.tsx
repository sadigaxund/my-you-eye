import { forwardRef } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const codeBlockVariants = cva(
  "overflow-hidden rounded-ui border border-border bg-secondary text-sm",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CodeBlockProps
  extends HTMLAttributes<HTMLPreElement>,
    VariantProps<typeof codeBlockVariants> {
  code: string;
  language?: string;
  header?: string;
  wrap?: boolean;
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, ...props }, ref) => (
    <div className={cn(codeBlockVariants({ variant }), className)}>
      {header && (
        <div className="flex items-center justify-between px-compact-x py-compact-y border-b border-border text-xs text-muted">
          <span>{header}</span>
          {language && <span className="font-mono uppercase">{language}</span>}
        </div>
      )}
      <pre
        ref={ref}
        className={cn("p-panel text-xs leading-relaxed overflow-x-auto", wrap && "whitespace-pre-wrap")}
        {...props}
      >
        <code>{code}</code>
      </pre>
    </div>
  ),
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
