import { useCallback, useEffect, useState, useRef, useLayoutEffect } from "react";
import { cn } from "../../lib/cn";
import { Badge } from "../badge";
import { StatusDot } from "../status-dot";
import type { StatusDotProps } from "../status-dot";
import type { BadgeProps } from "../badge";
import { Dialog, DialogContent, DialogTitle } from "../dialog";
import { Popover, PopoverTrigger, PopoverContent } from "../popover";
import { Image } from "../image";
import { Slider } from "../slider";
import { Button } from "../button";
import { DateHumanDisplay, DateSystemDisplay, DateTimeTzDisplay } from "./CellType.date-displays";
import {
  NumberDisplay, PercentageDisplay, BytesDisplay, DurationDisplay,
  CurrencyDisplay, SignedDisplay,
} from "./CellType.numeric-displays";
import { JsonDisplay, TreeDisplay, ArrayDisplay } from "./CellType.complex-displays";
import {
  SparklineDisplay, TagsDisplay, CodeDisplay, ColorDisplay,
  HashDisplay, UserDisplay, ProgressCellDisplay, SecretDisplay,
} from "./CellType.misc-displays";
import { useTruncated, EllipsisBadge } from "./CellType.shared";

export type CellValueType =
  | "text" | "boolean" | "email" | "url" | "json" | "null" | "badge" | "status"
  | "number" | "percentage" | "date-human" | "date-system" | "datetime-tz"
  | "bytes" | "duration" | "currency" | "signed" | "array"
  | "image" | "audio" | "tree"
  | "sparkline" | "tags" | "code" | "color" | "hash" | "user" | "progress" | "secret";

export type UrlReplacement = { pattern: string | RegExp; label: string };

export interface CellTypeProps {
  type?: CellValueType;
  value?: unknown;
  badgeVariant?: BadgeProps["variant"];
  badgeStyle?: BadgeProps["style"];
  statusVariant?: StatusDotProps["variant"];
  statusPulse?: boolean;
  replacements?: UrlReplacement[];
  dateFormat?: Intl.DateTimeFormatOptions;
  compact?: boolean;
  /** Fraction digits (0-20). Controls minimumFractionDigits and maximumFractionDigits. */
  fractionDigits?: number;
  /** ISO 4217 currency code for "currency" type (default "USD"). */
  currency?: string;
  /** Force a byte unit (e.g. "GB"). Overrides auto-scaling for "bytes" type. */
  displayUnit?: string;
  /** Highlight language for "code" type (e.g. "ts", "sql"). Omit for a
   * plain, unhighlighted snippet. */
  codeLanguage?: string;
  /** Optional photo URL for "user" type — falls back to initials (Avatar's
   * own fallback behavior) when omitted. */
  avatarSrc?: string;
}

function BooleanDisplay({ value }: { value: unknown }) {
  const t = Boolean(value);
  return (
    <span className={cn("inline-flex items-center", t ? "text-success" : "text-muted")}>
      <svg viewBox="0 0 12 12" className="size-icon fill-current">
        {t ? <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" fill="none" />
          : <path d="M2 2l8 8M10 2L2 10" stroke="currentColor" strokeWidth="1.5" fill="none" />}
      </svg>
    </span>
  );
}

function applyReplacements(str: string, replacements?: UrlReplacement[]) {
  if (!replacements) return str;
  let r = str;
  for (const x of replacements) r = r.replaceAll(x.pattern, x.label);
  return r;
}

function ImageDisplay({ value, compact }: { value: unknown; compact?: boolean }) {
  const src = String(value);
  const [open, setOpen] = useState(false);
  return (
    <>
      <Image
        src={src}
        alt=""
        radius="sm"
        bordered
        // `compact`: size-thumb (32px, --spacing-thumb) is taller than a
        // TreeView row (24px, --spacing-tree-row) and overflows it — see
        // TODO.md's "Known issues". size-thumb-sm (20px, --spacing-thumb-sm)
        // fits inside a "normal" density row with margin to spare. Default
        // (size-thumb) is unchanged for every other CellType consumer
        // (tables, DataList, etc.) — this is opt-in only.
        className={cn(
          compact ? "size-thumb-sm" : "size-thumb",
          "cursor-pointer hover:opacity-80 transition-opacity",
        )}
        onClick={() => setOpen(true)}
      />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="p-0 overflow-hidden max-w-[90vw] w-auto">
          <DialogTitle className="sr-only">Image preview</DialogTitle>
          <Image src={src} alt="" fit="contain" radius="none" className="max-w-[80vw] max-h-[80vh]" />
        </DialogContent>
      </Dialog>
    </>
  );
}

function AudioDisplay({ value }: { value: unknown }) {
  const src = String(value);
  const r = useRef<HTMLAudioElement>(null);
  const [p, setP] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  const toggle = useCallback(() => {
    const a = r.current; if (!a) return;
    if (p) { a.pause(); setP(false); return; }
    if (a.ended || a.currentTime >= a.duration - 0.01) a.currentTime = 0;
    a.play(); setP(true);
  }, [p]);
  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const a = r.current; if (!a) return;
    a.currentTime = Number(e.target.value);
    setT(a.currentTime);
  }, []);
  // `timeupdate` only fires ~4x/second (the HTML spec's floor, not this
  // browser's), so driving the seek thumb from it alone reads as low-fps
  // during playback. Drive it from rAF instead while playing — cancelled
  // on pause/unmount — for a smooth ~60fps thumb; `timeupdate` still fires
  // and would be harmless, but rAF supersedes it, so there's no reason to
  // keep both updating the same state (AGENTS.md TODO A11). This is plain
  // DOM/UI polish outside src/motion/ — not the frame-driven animation
  // tier, so rAF here is unrelated to (and doesn't conflict with)
  // AGENTS.md §9c's "no wall-clock APIs" rule, which scopes to src/motion/.
  useEffect(() => {
    if (!p) return;
    let raf: number;
    const tick = () => {
      setT(r.current?.currentTime ?? 0);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [p]);
  const fmt = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
  return (
    <span className="inline-flex items-center gap-inline text-xs min-w-audio-min" onClick={(e) => e.stopPropagation()}>
      <audio ref={r} src={src} onLoadedMetadata={() => setD(r.current?.duration ?? 0)} onEnded={() => setP(false)} />
      <Button type="button" variant="ghost" size="icon-sm" onClick={toggle} aria-label={p ? "Pause" : "Play"}>
        {p ? <svg viewBox="0 0 10 10" className="size-3 fill-current"><rect x="1" y="1" width="3" height="8" rx="0.5" /><rect x="6" y="1" width="3" height="8" rx="0.5" /></svg>
          : <svg viewBox="0 0 10 10" className="size-3 fill-current"><path d="M2 1l7 4-7 4V1z" /></svg>}
      </Button>
      <Slider aria-label="Seek" size="sm" min={0} max={d || 1} step={0.1} value={t} onChange={seek} className="flex-1" />
      <span className="font-mono tabular-nums text-muted shrink-0 w-audio-time text-right whitespace-nowrap">{d ? `${fmt(t)} / ${fmt(d)}` : "--:-- / --:--"}</span>
    </span>
  );
}

function TruncatedCellValue({ value, className }: { value: string; className?: string }) {
  const [ref, isTruncated] = useTruncated<HTMLSpanElement>([value]);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    if (!isTruncated) setOpen(false);
  }, [isTruncated]);

  return (
    <Popover open={open} onOpenChange={(next) => isTruncated && setOpen(next)}>
      <PopoverTrigger asChild disabled={!isTruncated}>
        <span
          className={cn("flex w-full max-w-full min-w-0 items-center", isTruncated && "cursor-pointer")}
          tabIndex={isTruncated ? undefined : -1}
          aria-disabled={!isTruncated}
        >
          <span
            ref={ref}
            className={cn(
              "block min-w-0 flex-1 overflow-hidden whitespace-nowrap",
              !isTruncated && "text-ellipsis",
              className,
            )}
          >
            {value}
          </span>
          {isTruncated && <EllipsisBadge />}
        </span>
      </PopoverTrigger>
      <PopoverContent className="max-w-sm p-3 text-sm whitespace-pre-wrap break-words">
        {value}
      </PopoverContent>
    </Popover>
  );
}

export function CellType({
  type = "text", value, badgeVariant, badgeStyle, statusVariant, statusPulse, replacements, dateFormat, compact,
  fractionDigits, currency, displayUnit, codeLanguage, avatarSrc,
}: CellTypeProps) {
  if (value === null || value === undefined || type === "null") return <span className="text-muted">—</span>;
  switch (type) {
    case "boolean": return <BooleanDisplay value={value} />;
    case "email": return <a href={`mailto:${String(value)}`} className="text-primary hover:underline inline-flex min-w-0 w-full"><span className="truncate">{String(value)}</span></a>;
    case "url": return <a href={String(value)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-tight text-primary hover:underline min-w-0 w-full">
      <span className="truncate">{applyReplacements(String(value), replacements)}</span>
      <svg viewBox="0 0 12 12" className="size-icon-sm shrink-0 fill-current opacity-dim"><path d="M2 2h3v1H3v6h6V7h1v3H2V2zm4 0h4v4H9V4.5L6.5 7 6 6.5 8.5 4H6V2z" /></svg></a>;
    case "json": return <JsonDisplay value={value} />;
    case "badge": return <Badge variant={badgeVariant ?? "neutral"} style={badgeStyle ?? "solid"}>{String(value)}</Badge>;
    case "status": return <span className="inline-flex items-center gap-1.5 min-w-0 w-full"><StatusDot variant={statusVariant ?? "neutral"} size="sm" pulse={statusPulse} /><TruncatedCellValue value={String(value)} /></span>;
    case "number": return <NumberDisplay value={value} compact={compact} fractionDigits={fractionDigits} />;
    case "percentage": return <PercentageDisplay value={value} fractionDigits={fractionDigits} />;
    case "date-human": return <DateHumanDisplay value={value} />;
    case "date-system": return <DateSystemDisplay value={value} dateFormat={dateFormat} />;
    case "datetime-tz": return <DateTimeTzDisplay value={value} />;
    case "bytes": return <BytesDisplay value={value} compact={compact} displayUnit={displayUnit} />;
    case "duration": return <DurationDisplay value={value} />;
    case "currency": return <CurrencyDisplay value={value} compact={compact} fractionDigits={fractionDigits} currency={currency} />;
    case "signed": return <SignedDisplay value={value} />;
    case "image": return <ImageDisplay value={value} compact={compact} />;
    case "audio": return <AudioDisplay value={value} />;
    case "array": return <ArrayDisplay value={value} />;
    case "tree": return <TreeDisplay value={value} replacements={replacements} />;
    case "sparkline": return <SparklineDisplay value={value} />;
    case "tags": return <TagsDisplay value={value} />;
    case "code": return <CodeDisplay value={value} language={codeLanguage} />;
    case "color": return <ColorDisplay value={value} />;
    case "hash": return <HashDisplay value={value} />;
    case "user": return <UserDisplay value={value} avatarSrc={avatarSrc} />;
    case "progress": return <ProgressCellDisplay value={value} />;
    case "secret": return <SecretDisplay value={value} />;
    default: return <TruncatedCellValue value={String(value)} />;
  }
}
