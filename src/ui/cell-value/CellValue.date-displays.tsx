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
  return <span title={d.toLocaleString()} className="cursor-help truncate inline-block max-w-full align-middle">{relativeTime(d)}</span>;
}

export function DateSystemDisplay({ value, dateFormat }: { value: unknown; dateFormat?: Intl.DateTimeFormatOptions }) {
  const d = parseDate(value);
  if (!d) return <span className="text-muted">—</span>;
  const fmt = dateFormat ?? { year: "numeric", month: "short", day: "numeric" };
  return <span className="truncate inline-block max-w-full align-middle">{d.toLocaleDateString(undefined, fmt)}</span>;
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
  const compact = d.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "numeric", minute: "2-digit",
  }) + ` ${offset}`;
  const meta = `${iso}\n${tzName} (${offset})\n${relativeTime(d)}`;
  return <span title={meta} className="cursor-help truncate inline-block max-w-full align-middle">{compact}</span>;
}
