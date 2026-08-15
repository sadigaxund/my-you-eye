import { forwardRef, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/cn";
import { ScrollArea } from "../scroll-area";
import { TerminalOutput } from "./Terminal.Output";

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
  /** Output body rendered below the command, as plain terminal lines. */
  output?: string;
  /** Syntax language for `output` — colorizes it with the shared code tokenizer. */
  language?: string;
  /** Process exit code for this command. Renders a plain monospace status line — "✓ exit 0" in success color, "✗ exit 2" in danger. */
  exitCode?: number;
  /** In-progress line: a braille spinner glyph + this label in place of output, for a still-frame of a running step. */
  spinner?: string;
  /**
   * Which glyph that spinner line shows. Defaults to the first frame of
   * `SPINNER_FRAMES`. Exists so a frame-driven caller (`TerminalScene`) can
   * cycle the braille set deterministically from the current frame — this
   * component never animates it itself (AGENTS.md §9c: no CSS animation in
   * anything a video render composes).
   */
  spinnerGlyph?: string;
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
   * (owner feedback: "I want to see a constant height terminal that does
   * not change or move, and the content gets added within it ... like a
   * scrolling action"). When set, the entries body is EXACTLY `rows`
   * lines tall — measured from the real rendered line-height plus the
   * body's own padding, never a hardcoded px figure (AGENTS.md TODO A1)
   * — from the first frame onward, and scrolls internally. Newly revealed
   * content auto-scrolls into view. Omit for grows-with-content
   * behaviour, which suits a static page but never a video frame.
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

/**
 * The exit line, as a shell would print it: monospace text, no pill, no
 * border, no background. Everything inside the terminal frame has to look
 * like something a real shell could have written to the tty — a rounded
 * `Badge` is chrome from a different design language, and reading it inside a
 * transcript is like finding a button in a log file. Color (success/danger)
 * plus a ✓/✗ glyph carries the same information; `opacity-muted` keeps it
 * subordinate to the command and its output, which is what the reader is
 * actually there for.
 */
function ExitStatus({ code }: { code: number }) {
  const ok = code === 0;
  return (
    <span className={cn("text-xs opacity-muted", ok ? "text-success" : "text-danger")}>
      {ok ? "✓" : "✗"} exit {code}
    </span>
  );
}

/**
 * The braille cycle every terminal spinner on earth uses, in order. Exported
 * for the scenes tier (`TerminalScene`), which has frame access and steps
 * through it deterministically — this component itself renders ONE glyph and
 * never animates: a CSS animation here would be wall-clock driven, and
 * AGENTS.md §9c forbids that anywhere a frame-captured render can reach. A
 * paused spinner reads perfectly well in a static page.
 */
export const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"] as const;

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
function useLineHeight(active: boolean): { ref: React.RefObject<HTMLDivElement | null>; height: number; padding: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  // The entries body has its own vertical padding (`p-panel`). Sizing the
  // viewport to `rows * lineHeight` alone would silently eat two lines of the
  // requested height, so the padding is measured off the real element rather
  // than assumed — same reason the line height is.
  const [padding, setPadding] = useState(0);
  useLayoutEffect(() => {
    if (!active) return undefined;
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => {
      setHeight((h) => (h === el.offsetHeight ? h : el.offsetHeight));
      const body = el.parentElement;
      if (!body) return;
      const cs = getComputedStyle(body);
      const pad = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0);
      setPadding((p) => (p === pad ? p : pad));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [active]);
  return { ref, height, padding };
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
    const { ref: rulerRef, height: lineHeight, padding: bodyPadding } = useLineHeight(hasFixedHeight);
    // A FIXED height, not a max-height. Capping the box let it start short
    // and grow line by line until it hit the cap — which is the very thing
    // `rows` exists to stop (owner: "I dont like how the terminal's size gets
    // bigger whenever a new line is added, I want to see a constant height
    // terminal that does not change or move"). With a fixed height the frame
    // is the same size on frame 0 as on the last frame and the content
    // scrolls underneath it, which is how a real terminal behaves.
    const bodyHeight = hasFixedHeight && lineHeight > 0 ? lineHeight * rows + bodyPadding : undefined;

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
          // `flex-1` is `flex: 1 1 0%`, and in a column flex container a
          // flex-basis of 0 wins over `height` — so a fixed height set
          // alongside it is simply ignored and the box goes back to sizing
          // itself from its content. The fixed-height case therefore opts out
          // of growing entirely.
          className={cn("min-h-0", bodyHeight == null ? "flex-1" : "shrink-0")}
          style={bodyHeight != null ? { height: bodyHeight } : undefined}
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
                    <span aria-hidden className="shrink-0">{entry.spinnerGlyph ?? SPINNER_FRAMES[0]}</span>
                    <span>{entry.spinner}</span>
                  </div>
                )}
                {entry.output != null && <TerminalOutput text={entry.output} language={entry.language} />}
                {entry.exitCode != null && <ExitStatus code={entry.exitCode} />}
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
