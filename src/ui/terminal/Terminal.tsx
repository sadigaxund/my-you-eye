import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { CodeBlock } from "../code-block";
import { Badge } from "../badge";
import { Spinner } from "../spinner";
import { ScrollArea } from "../scroll-area";

const terminalVariants = cva(
  "w-full overflow-clip rounded-ui border border-border bg-code-bg text-code-fg flex flex-col",
  {
    variants: {
      variant: {
        default: "",
        elevated: "shadow-card",
      },
      /**
       * Color decorator (owner feedback: "add more themes... to the
       * terminal component") — an existing-variant-axis extension, not a
       * parallel prop, and every value is composed from color tokens that
       * already exist (`--color-success`/`--color-warning`) rather than
       * new ones, so no theme file needs updating. "default" leaves the
       * base `bg-code-bg`/`text-code-fg` untouched; the others retint text
       * and border only, keeping the same background every theme already
       * defines for code surfaces.
       */
      scheme: {
        default: "",
        matrix: "border-success/40 text-success",
        amber: "border-warning/40 text-warning",
      },
      /**
       * Window-chrome decorator: "dots" (default) renders the macOS-style
       * traffic-light dots inside the title bar; "none" keeps the caption
       * bar (when `title`/`cwd` is set) but drops the dots for a flatter,
       * non-native chrome. No effect when there's no title bar at all.
       */
      chrome: {
        dots: "",
        none: "",
      },
    },
    defaultVariants: {
      variant: "default",
      scheme: "default",
      chrome: "dots",
    },
  },
);

/** Prompt glyph shown before each command. "#" reads as a root shell —
 * added for `my-you-eye/scenes`' `TerminalScene`, whose schema's `prompt`
 * field always included it (additive: the other three glyphs render
 * unchanged). */
export type TerminalPromptGlyph = "$" | ">" | "#" | "❯";

export interface TerminalEntry {
  /** Command text shown after the prompt. Omit for an output-only entry (banner text, log lines). */
  command?: string;
  /** Output body rendered below the command, composed via CodeBlock. */
  output?: string;
  /** Syntax language for `output` — enables CodeBlock's tokenizer for that entry. */
  language?: string;
  /** Process exit code for this command. Renders a small badge (0 reads success, non-zero danger). */
  exitCode?: number;
  /** In-progress line: a spinner + label in place of output, for a still-frame of a running step. */
  spinner?: string;
  /**
   * Per-entry overrides of the prompt chrome — each independently
   * optional, and each PERSISTS to every following entry until overridden
   * again (real-shell semantics: `cd`-ing once changes the prompt for
   * every command after it, not just that one line). Falls back to the
   * Terminal-level prop when never set by any entry up to this point.
   */
  cwd?: string;
  user?: string;
  host?: string;
  promptGlyph?: TerminalPromptGlyph;
}

export interface TerminalProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof terminalVariants> {
  entries: TerminalEntry[];
  /** Prompt glyph before each command. Default "$". Per-entry `promptGlyph` overrides and persists from that entry on. */
  prompt?: TerminalPromptGlyph;
  /** Working directory shown in the prompt chrome (and the title bar, if no `title` is given). Per-entry `cwd` overrides and persists from that entry on. */
  cwd?: string;
  /** Username shown before an "@host" segment in the prompt chrome. Per-entry `user` overrides and persists from that entry on. */
  user?: string;
  /** Hostname shown after "user@" in the prompt chrome. Per-entry `host` overrides and persists from that entry on. */
  host?: string;
  /** Caption for an optional window-style title bar above the entries. */
  title?: string;
  /**
   * Fixed visible height, expressed as a whole number of text lines
   * (owner feedback: "the size of terminal does not really change, but
   * the content just gets scrolled up as something gets added — that
   * would feel more natural"). When set, the entries body is capped at
   * `rows` lines' worth of height (measured from the real rendered
   * line-height, never a hardcoded px figure — AGENTS.md TODO A1) and
   * scrolls internally; the box itself never grows with content. Newly
   * revealed content auto-scrolls into view. Omit for the previous
   * grows-with-content behavior.
   */
  rows?: number;
}

function PromptChrome({
  glyph, user, host, cwd,
}: { glyph: TerminalPromptGlyph; user?: string; host?: string; cwd?: string }) {
  const hasIdentity = Boolean(user || host);
  return (
    <span className="shrink-0 select-none whitespace-nowrap">
      {hasIdentity && (
        <span className="text-success">
          {user}
          {user && host && "@"}
          {host}
          {" "}
        </span>
      )}
      {cwd && <span className="text-primary">{cwd} </span>}
      <span className="text-code-muted">{glyph}</span>
    </span>
  );
}

type TerminalScheme = "default" | "matrix" | "amber";

/** Command-line text color per `scheme` — a literal lookup (never string
 * interpolation, per the Tailwind-literal-classname rule) so "matrix"/
 * "amber" retint the one line every entry always has, not just the box
 * border. Every value is an existing color token (`text-code-fg` is the
 * unchanged default; `text-success`/`text-warning` back the other two —
 * both already verified against src/styles/tokens.css). */
const SCHEME_COMMAND_TEXT: Record<TerminalScheme, string> = {
  default: "text-code-fg",
  matrix: "text-success",
  amber: "text-warning",
};

function ExitBadge({ code }: { code: number }) {
  return (
    <Badge variant={code === 0 ? "success" : "danger"} style="soft" className="font-mono">
      exit {code}
    </Badge>
  );
}

/** Resolved per-entry prompt chrome, carried forward shell-style: each
 * entry's own override (if set) becomes the new "current" value for every
 * later entry too, rather than only applying to that one line. */
interface ResolvedPrompt {
  glyph: TerminalPromptGlyph;
  user?: string;
  host?: string;
  cwd?: string;
}

function resolvePrompts(
  entries: TerminalEntry[],
  base: ResolvedPrompt,
): ResolvedPrompt[] {
  let current = base;
  return entries.map((entry) => {
    current = {
      glyph: entry.promptGlyph ?? current.glyph,
      user: entry.user ?? current.user,
      host: entry.host ?? current.host,
      cwd: entry.cwd ?? current.cwd,
    };
    return current;
  });
}

/** Measures one rendered line's height from the SAME font/leading/padding
 * the entries body uses, so `rows` caps the box at a real, current
 * line-height rather than a guessed constant (AGENTS.md TODO A1) — mirrors
 * the ruler pattern `CodeBlock`/`CodeDiff` already use for the same reason. */
function useLineHeight(active: boolean): { ref: React.RefObject<HTMLDivElement | null>; height: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  useLayoutEffect(() => {
    if (!active) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setHeight((h) => (h === el.offsetHeight ? h : el.offsetHeight));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);
  return { ref, height };
}

const Terminal = forwardRef<HTMLDivElement, TerminalProps>(
  (
    {
      className, variant, scheme, chrome, entries, prompt = "$", cwd, user, host, title, rows, ...props
    },
    ref,
  ) => {
    const titleBarCaption = title ?? cwd;
    const effectiveScheme: TerminalScheme = scheme ?? "default";
    const prompts = useMemo(
      () => resolvePrompts(entries, { glyph: prompt, user, host, cwd }),
      [entries, prompt, user, host, cwd],
    );

    const hasFixedHeight = rows != null && rows > 0;
    const { ref: rulerRef, height: lineHeight } = useLineHeight(hasFixedHeight);
    const maxHeight = hasFixedHeight && lineHeight > 0 ? lineHeight * rows : undefined;

    // Auto-scroll to the bottom whenever the entry count or the currently-
    // running entry's own revealed content grows — the box's height never
    // changes (that's the whole point of `rows`), so without this a fixed-
    // height terminal would silently clip new lines below the fold instead
    // of "scrolling up as something gets added".
    const viewportRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
      if (!hasFixedHeight) return;
      const el = viewportRef.current;
      if (!el) return;
      el.scrollTop = el.scrollHeight;
    });

    return (
      <div ref={ref} className={cn(terminalVariants({ variant, scheme, chrome }), className)} {...props}>
        {titleBarCaption && (
          <div className="flex items-center gap-inline h-9 px-panel border-b border-border shrink-0">
            {chrome !== "none" && (
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-danger/70" />
                <span className="size-2.5 rounded-full bg-warning/70" />
                <span className="size-2.5 rounded-full bg-success/70" />
              </span>
            )}
            <span className="flex-1 text-center text-xs text-code-muted truncate font-mono">
              {titleBarCaption}
            </span>
            {chrome !== "none" && <span className="w-[3.75rem]" aria-hidden />}
          </div>
        )}
        <ScrollArea
          ref={viewportRef}
          orientation="both"
          className="flex-1 min-h-0"
          style={maxHeight != null ? { maxHeight } : undefined}
        >
          <div className="flex flex-col gap-stack p-panel font-mono text-sm">
            {hasFixedHeight && (
              <div ref={rulerRef} aria-hidden className="invisible absolute">
                0
              </div>
            )}
            {entries.map((entry, i) => (
              <div key={i} className="flex flex-col gap-tight">
                {entry.command != null && (
                  <div className="flex items-start gap-inline">
                    <PromptChrome
                      glyph={prompts[i].glyph}
                      user={prompts[i].user}
                      host={prompts[i].host}
                      cwd={prompts[i].cwd}
                    />
                    <span className={cn("break-all", SCHEME_COMMAND_TEXT[effectiveScheme])}>{entry.command}</span>
                  </div>
                )}
                {entry.spinner != null && (
                  <div className="flex items-center gap-inline text-code-muted">
                    <Spinner size="sm" className="size-3.5" />
                    <span>{entry.spinner}</span>
                  </div>
                )}
                {entry.output != null && (
                  <CodeBlock
                    code={entry.output}
                    language={entry.language}
                    highlight={Boolean(entry.language)}
                    wrap
                  />
                )}
                {entry.exitCode != null && <ExitBadge code={entry.exitCode} />}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  },
);
Terminal.displayName = "Terminal";

export { Terminal, terminalVariants };
