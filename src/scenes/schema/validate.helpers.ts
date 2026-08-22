// Shared primitives for the scene schema's runtime validator (validate.ts
// and its per-kind siblings). The validator works over `unknown` — a scene
// is authored data, not something TypeScript checked before it got here —
// so every check is a defensive runtime probe, not a type assertion.

export interface ValidationIssue {
  /** JSON-ish accessor, e.g. `scenes[2].steps[0].flow[1]`, so an author can
   * jump straight to the problem. */
  path: string;
  message: string;
  severity: "error" | "warning";
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function isString(v: unknown): v is string {
  return typeof v === "string";
}

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function pushError(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message, severity: "error" });
}

export function pushWarning(issues: ValidationIssue[], path: string, message: string): void {
  issues.push({ path, message, severity: "warning" });
}

/** Checks a required string field, erroring if absent/wrong type. Returns
 * the string (or undefined if invalid) so callers can chain further checks. */
export function requireString(issues: ValidationIssue[], path: string, value: unknown, field: string): string | undefined {
  if (!isString(value) || value.length === 0) {
    pushError(issues, path, `${field} is required and must be a non-empty string`);
    return undefined;
  }
  return value;
}

export function optionalString(issues: ValidationIssue[], path: string, value: unknown, field: string): void {
  if (value != null && !isString(value)) pushError(issues, path, `${field} must be a string if present`);
}

export function optionalEnum<T extends string>(
  issues: ValidationIssue[],
  path: string,
  value: unknown,
  field: string,
  allowed: readonly T[],
): void {
  if (value != null && (!isString(value) || !(allowed as readonly string[]).includes(value))) {
    pushError(issues, path, `${field} must be one of ${allowed.map((a) => `"${a}"`).join(", ")} (got ${JSON.stringify(value)})`);
  }
}

/** Requires an array field, erroring if absent/wrong type. `minLength`
 * defaults to 1 — most authored lists ("bullets", "nodes", "entries" …) are
 * meaningless empty. Pass 0 to allow an empty array. */
export function requireArray(
  issues: ValidationIssue[],
  path: string,
  value: unknown,
  field: string,
  minLength = 1,
): unknown[] | undefined {
  if (!Array.isArray(value)) {
    pushError(issues, path, `${field} must be an array`);
    return undefined;
  }
  if (value.length < minLength) {
    pushError(issues, path, `${field} must have at least ${minLength} item${minLength === 1 ? "" : "s"}`);
  }
  return value;
}

/** Percent-of-frame coordinate check (`PercentPoint`/`PercentRect` fields) — every value 0–100. */
export function checkPercentField(issues: ValidationIssue[], path: string, value: unknown, field: string): void {
  if (!isFiniteNumber(value) || value < 0 || value > 100) {
    pushError(issues, path, `${field} must be a number between 0 and 100 (got ${JSON.stringify(value)})`);
  }
}

export function checkPercentPoint(issues: ValidationIssue[], path: string, value: unknown): void {
  if (!isRecord(value)) { pushError(issues, path, "must be a { x, y } percent point"); return; }
  checkPercentField(issues, `${path}.x`, value.x, "x");
  checkPercentField(issues, `${path}.y`, value.y, "y");
}

export function checkPercentRect(issues: ValidationIssue[], path: string, value: unknown): void {
  if (!isRecord(value)) { pushError(issues, path, "must be a { x, y, width, height } percent rect"); return; }
  checkPercentField(issues, `${path}.x`, value.x, "x");
  checkPercentField(issues, `${path}.y`, value.y, "y");
  checkPercentField(issues, `${path}.width`, value.width, "width");
  checkPercentField(issues, `${path}.height`, value.height, "height");
}

/** Duplicate-id check for a `steps`-shaped array. Ids are optional (they
 * auto-derive from index), so only collisions among *set* ids are an error. */
export function checkDuplicateStepIds(issues: ValidationIssue[], path: string, steps: unknown[]): void {
  const seen = new Set<string>();
  steps.forEach((step, i) => {
    if (!isRecord(step)) return;
    const id = step.id;
    if (id == null) return;
    if (!isString(id)) { pushError(issues, `${path}[${i}].id`, "id must be a string"); return; }
    if (seen.has(id)) pushError(issues, `${path}[${i}].id`, `duplicate step id "${id}" within this scene`);
    seen.add(id);
  });
}

/** Warns when none of a step array's items set `say` — the scene falls back
 * to a default per-step duration rather than one derived from narration. */
export function warnIfNoSay(issues: ValidationIssue[], path: string, steps: unknown[]): void {
  const anySay = steps.some((s) => isRecord(s) && isString(s.say) && s.say.length > 0);
  if (!anySay) pushWarning(issues, path, "no step sets \"say\" — every step in this scene will get a default (content-less) duration");
}
