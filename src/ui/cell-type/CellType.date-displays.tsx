function relativeTime(d: Date): string {
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const month = Math.floor(day / 30);
  const year = Math.floor(month / 12);

  if (sec < 60) return "just now";
  if (min < 2) return "1 minute ago";
  if (min < 60) return `${min} minutes ago`;
  if (hr < 2) return "1 hour ago";
  if (hr < 24) return `${hr} hours ago`;
  if (day < 2) return "1 day ago";
  if (day < 30) return `${day} days ago`;
  if (month < 2) return "1 month ago";
  if (month < 12) return `${month} months ago`;
  if (year < 2) return "1 year ago";
  return `${year} years ago`;
}

function parseDate(value: unknown): Date | null {
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? null : d;
}

export function DateHumanDisplay({ value }: { value: unknown }) {
  const d = parseDate(value);
  if (!d) return <span className="text-muted">—</span>;
  return <span title={d.toLocaleString()} className="cursor-help truncate inline-block max-w-full align-middle font-medium text-primary">{relativeTime(d)}</span>;
}

export function DateSystemDisplay({ value, dateFormat }: { value: unknown; dateFormat?: Intl.DateTimeFormatOptions }) {
  const d = parseDate(value);
  if (!d) return <span className="text-muted">—</span>;
  // `day: "2-digit"` (not the previous "numeric"): "1" vs "17" are
  // different digit counts, so even with tabular-nums the day field's
  // width still varied row-to-row. Zero-padding to a fixed 2 digits is
  // what actually makes tabular-nums line the column up — see the
  // DateTimeTzDisplay comment above for the same principle applied to a
  // fully-numeric date. `dateFormat` callers still opt out of this
  // entirely by passing their own format.
  const fmt = dateFormat ?? { year: "numeric", month: "short", day: "2-digit" };
  const parts = new Intl.DateTimeFormat(undefined, fmt).formatToParts(d);
  return (
    <span className="truncate inline-block max-w-full align-middle tabular-nums">
      {parts.map((part, i) => {
        if (part.type === "year" || part.type === "weekday")
          return <span key={i} className="text-muted text-xs">{part.value}</span>;
        if (part.type === "literal")
          return <span key={i}>{part.value}</span>;
        return <span key={i} className="font-medium">{part.value}</span>;
      })}
    </span>
  );
}

function tzOffset(d: Date): string {
  const o = -d.getTimezoneOffset();
  const h = Math.floor(Math.abs(o) / 60);
  const m = Math.abs(o) % 60;
  return `${o >= 0 ? "+" : "-"}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function DateTimeTzDisplay({ value }: { value: unknown }) {
  const d = parseDate(value);
  if (!d) return <span className="text-muted">—</span>;
  const iso = d.toISOString();
  const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const offset = tzOffset(d);
  const meta = `${iso}\n${tzName} (${offset})\n${relativeTime(d)}`;
  // Numeric month ("07"), not a short name ("Jul"): a letter abbreviation
  // has no fixed advance width even with tabular-nums (tabular-nums only
  // pins *digit* glyph widths), so "Jul"/"Jun"/"Mar" render at different
  // pixel widths and push everything after them out of alignment. With
  // every field zero-padded and numeric, "07/17/2026" and "11/03/2026" are
  // both exactly 10 tabular-nums characters — same width, every row, with
  // no JS measurement involved (owner's explicit fix).
  const dateParts = new Intl.DateTimeFormat(undefined, { month: "2-digit", day: "2-digit", year: "numeric" }).formatToParts(d);
  const timeStr = d.toLocaleString(undefined, { hour: "2-digit", minute: "2-digit" });
  return (
    <span title={meta} className="cursor-help whitespace-nowrap inline-flex items-baseline gap-1.5 max-w-full min-w-0 tabular-nums align-middle">
      {/* date + time grouped so they can truncate together in a narrow
          cell, but each is still its own span — three structurally
          separate parts (date / time / zone), not one blob of text. */}
      <span className="min-w-0 truncate inline-flex items-baseline gap-1.5 text-xs/none">
        <span className="shrink-0 text-muted">
          {dateParts.map((part, i) => {
            if (part.type === "year")
              return <span key={i} className="text-muted">{part.value}</span>;
            if (part.type === "literal")
              return <span key={i}>{part.value}</span>;
            return <span key={i} className="font-medium">{part.value}</span>;
          })}
        </span>
        <span className="shrink-0 font-semibold">{timeStr}</span>
      </span>
      <span className="inline-flex shrink-0 items-center rounded-sm px-1 py-0.5 text-xs/none leading-none bg-muted/10 text-muted font-mono">
        {offset}
      </span>
    </span>
  );
}
