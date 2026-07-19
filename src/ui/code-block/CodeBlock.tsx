import { forwardRef, useState, useCallback, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";

const codeBlockVariants = cva(
  "group relative overflow-hidden rounded-ui border border-border bg-code-bg text-sm flex flex-col",
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
  showLineNumbers?: boolean;
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-code-muted">
      <path d="M3 1h6l2 2v6a1 1 0 01-1 1H3a1 1 0 01-1-1V2a1 1 0 011-1zm0 1v7h7V3.5L8.5 2H3z" />
      <path d="M2 4H1v6a1 1 0 001 1h6v-1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 12 12" className="size-3.5 fill-success">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}

function CopyButton({ copied, onCopy }: { copied: boolean; onCopy: () => void }) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "flex items-center gap-1 rounded-ui-sm px-1.5 h-6 shrink-0",
        "text-xs text-code-muted hover:text-code-fg hover:bg-code-bg/80 border border-transparent hover:border-border",
        "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity duration-[var(--duration-fast)]",
        "outline-none focus-visible:ring-[length:var(--focus-ring-width)] focus-visible:ring-ring cursor-pointer",
        copied && "opacity-100",
      )}
      title="Copy code"
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
      <span className={cn(copied && "text-success")}>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

const CodeBlock = forwardRef<HTMLPreElement, CodeBlockProps>(
  ({ className, variant, code, language, header, wrap = true, showLineNumbers = false, ...props }, ref) => {
    const [copied, setCopied] = useState(false);
    const copy = useCallback(() => {
      navigator.clipboard.writeText(code).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }, [code]);

    const lines = useMemo(() => code.split("\n"), [code]);
    const hasHeader = Boolean(header || language);

    return (
      <div className={cn(codeBlockVariants({ variant }), className)}>
        {hasHeader ? (
          <div className="flex items-center justify-between gap-2 h-9 pl-panel pr-1.5 border-b border-border">
            <div className="flex items-center gap-2 min-w-0">
              {header && <span className="text-xs font-medium text-code-fg truncate">{header}</span>}
              {language && (
                <span className="shrink-0 rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-xs uppercase tracking-wide text-code-muted border border-border/50">
                  {language}
                </span>
              )}
            </div>
            <CopyButton copied={copied} onCopy={copy} />
          </div>
        ) : (
          language && (
            <div className="absolute top-1 right-1 z-10 flex items-center gap-1">
              <span className="rounded-ui-sm bg-code-bg/80 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-code-muted border border-border/50 pointer-events-none">
                {language}
              </span>
              <CopyButton copied={copied} onCopy={copy} />
            </div>
          )
        )}
        {!hasHeader && !language && (
          <div className="absolute top-1 right-1 z-10">
            <CopyButton copied={copied} onCopy={copy} />
          </div>
        )}
        <div className="flex flex-1 min-h-0">
          {showLineNumbers && (
            <div
              aria-hidden
              className="select-none shrink-0 py-panel pl-compact-x pr-compact-x text-right font-mono text-xs leading-relaxed text-code-muted border-r border-border"
            >
              {lines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
          )}
          <pre
            ref={ref}
            className={cn(
              "flex-1 min-w-0 p-panel font-mono text-xs leading-relaxed overflow-x-auto text-code-fg",
              wrap && "whitespace-pre-wrap break-words",
            )}
            {...props}
          >
            <code>{code}</code>
          </pre>
        </div>
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
