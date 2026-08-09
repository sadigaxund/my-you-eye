// Per-kind checks for the seven "content" scene kinds (everything except
// diagram/sequence, which carry the heavy reference-integrity checks in
// validate.diagram.ts, and chart/stat, in validate.charts.ts).

import {
  isRecord, isString, isFiniteNumber,
  pushError, pushWarning,
  requireString, optionalString, optionalEnum, requireArray,
  checkPercentPoint, checkPercentRect,
  checkDuplicateStepIds, warnIfNoSay,
} from "./validate.helpers";
import type { ValidationIssue } from "./validate.helpers";

const MAX_BULLETS = 7;
const MAX_FOCUS_LINES = 25;

export function validateTitle(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  requireString(issues, `${path}.title`, scene.title, "title");
  optionalString(issues, `${path}.subtitle`, scene.subtitle, "subtitle");
  optionalString(issues, `${path}.chapter`, scene.chapter, "chapter");
  optionalEnum(issues, `${path}.align`, scene.align, "align", ["center", "left"] as const);
}

export function validateBullets(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.heading`, scene.heading, "heading");
  const bullets = requireArray(issues, `${path}.bullets`, scene.bullets, "bullets");
  if (!bullets) return;
  checkDuplicateStepIds(issues, `${path}.bullets`, bullets);
  warnIfNoSay(issues, path, bullets);
  if (bullets.length > MAX_BULLETS) {
    pushWarning(issues, `${path}.bullets`, `${bullets.length} bullets is a lot for one screen — consider splitting past ~${MAX_BULLETS}`);
  }
  bullets.forEach((b, i) => {
    const bPath = `${path}.bullets[${i}]`;
    if (!isRecord(b)) { pushError(issues, bPath, "bullet must be an object"); return; }
    requireString(issues, `${bPath}.text`, b.text, "text");
    optionalEnum(issues, `${bPath}.emphasis`, b.emphasis, "emphasis", ["none", "strong"] as const);
    if (b.children != null) {
      if (!Array.isArray(b.children) || b.children.some((c) => !isString(c))) {
        pushError(issues, `${bPath}.children`, "children must be an array of strings");
      }
    }
  });
}

/** Running "source on screen" per code step, mirroring `timing.ts`'s
 * fallback logic, so `focus`/`annotate` bounds are checked against the
 * actual code that step is showing rather than the scene's initial `code`. */
function codeStepSources(code: string, steps: unknown[]): string[] {
  let running = code;
  return steps.map((step) => {
    if (isRecord(step) && isString(step.code)) running = step.code;
    return running;
  });
}

export function validateCode(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const code = requireString(issues, `${path}.code`, scene.code, "code");
  optionalString(issues, `${path}.lang`, scene.lang, "lang");
  optionalString(issues, `${path}.file`, scene.file, "file");
  const steps = requireArray(issues, `${path}.steps`, scene.steps, "steps");
  if (!steps) return;
  checkDuplicateStepIds(issues, `${path}.steps`, steps);
  warnIfNoSay(issues, path, steps);
  const sources = codeStepSources(code ?? "", steps);

  steps.forEach((step, i) => {
    const sPath = `${path}.steps[${i}]`;
    if (!isRecord(step)) { pushError(issues, sPath, "step must be an object"); return; }
    const lineCount = sources[i].length === 0 ? 0 : sources[i].split("\n").length;

    if (step.focus != null) {
      const focus = step.focus;
      if (!Array.isArray(focus) || focus.length !== 2 || !isFiniteNumber(focus[0]) || !isFiniteNumber(focus[1])) {
        pushError(issues, `${sPath}.focus`, "focus must be a [start, end] line range");
      } else {
        const [start, end] = focus;
        if (start > end) pushError(issues, `${sPath}.focus`, `start (${start}) must be <= end (${end})`);
        if (start < 1) pushError(issues, `${sPath}.focus`, `start (${start}) must be >= 1 (1-based)`);
        if (end > lineCount) pushError(issues, `${sPath}.focus`, `end (${end}) is past the last line (${lineCount}) of the code on screen at this step`);
        if (end - start + 1 > MAX_FOCUS_LINES) {
          pushWarning(issues, `${sPath}.focus`, `focusing ${end - start + 1} lines is a lot to read on screen at once — consider narrowing past ~${MAX_FOCUS_LINES}`);
        }
      }
    }
    if (step.annotate != null) {
      if (!Array.isArray(step.annotate)) {
        pushError(issues, `${sPath}.annotate`, "annotate must be an array");
      } else {
        step.annotate.forEach((a, ai) => {
          const aPath = `${sPath}.annotate[${ai}]`;
          if (!isRecord(a)) { pushError(issues, aPath, "annotation must be an object"); return; }
          requireString(issues, `${aPath}.text`, a.text, "text");
          if (!isFiniteNumber(a.line) || a.line < 1 || a.line > lineCount) {
            pushError(issues, `${aPath}.line`, `line ${JSON.stringify(a.line)} is out of bounds for the code on screen at this step (1..${lineCount})`);
          }
        });
      }
    }
    if (step.highlight != null && (!Array.isArray(step.highlight) || step.highlight.some((h) => !isString(h)))) {
      pushError(issues, `${sPath}.highlight`, "highlight must be an array of strings");
    }
  });
}

export function validateTerminal(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const entries = requireArray(issues, `${path}.entries`, scene.entries, "entries");
  optionalString(issues, `${path}.cwd`, scene.cwd, "cwd");
  optionalString(issues, `${path}.user`, scene.user, "user");
  optionalString(issues, `${path}.host`, scene.host, "host");
  optionalString(issues, `${path}.title`, scene.title, "title");
  optionalEnum(issues, `${path}.prompt`, scene.prompt, "prompt", ["$", ">", "#", "❯"] as const);
  if (!entries) return;
  checkDuplicateStepIds(issues, `${path}.entries`, entries);
  warnIfNoSay(issues, path, entries);
  entries.forEach((e, i) => {
    const ePath = `${path}.entries[${i}]`;
    if (!isRecord(e)) { pushError(issues, ePath, "entry must be an object"); return; }
    optionalString(issues, `${ePath}.command`, e.command, "command");
    optionalString(issues, `${ePath}.output`, e.output, "output");
    optionalString(issues, `${ePath}.language`, e.language, "language");
    optionalString(issues, `${ePath}.spinner`, e.spinner, "spinner");
    if (e.exitCode != null && !isFiniteNumber(e.exitCode)) pushError(issues, `${ePath}.exitCode`, "exitCode must be a number");
  });
}

function validateComparePane(scene: Record<string, unknown>, path: string, field: "before" | "after", issues: ValidationIssue[]): void {
  const pane = scene[field];
  const pPath = `${path}.${field}`;
  if (!isRecord(pane)) { pushError(issues, pPath, `${field} is required`); return; }
  requireString(issues, `${pPath}.label`, pane.label, "label");
  optionalEnum(issues, `${pPath}.content`, pane.content, "content", ["code", "text", "image"] as const);
  if (pane.content === "code") {
    requireString(issues, `${pPath}.code`, pane.code, "code");
    optionalString(issues, `${pPath}.lang`, pane.lang, "lang");
  } else if (pane.content === "text") {
    requireString(issues, `${pPath}.text`, pane.text, "text");
  } else if (pane.content === "image") {
    requireString(issues, `${pPath}.src`, pane.src, "src");
    optionalString(issues, `${pPath}.alt`, pane.alt, "alt");
  }
}

export function validateCompare(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalEnum(issues, `${path}.mode`, scene.mode, "mode", ["columns", "wipe"] as const);
  optionalString(issues, `${path}.heading`, scene.heading, "heading");
  optionalString(issues, `${path}.say`, scene.say, "say");
  validateComparePane(scene, path, "before", issues);
  validateComparePane(scene, path, "after", issues);
}

export function validateWalkthrough(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  requireString(issues, `${path}.image`, scene.image, "image");
  optionalEnum(issues, `${path}.frame`, scene.frame, "frame", ["browser", "window", "phone"] as const);
  optionalString(issues, `${path}.url`, scene.url, "url");
  optionalString(issues, `${path}.title`, scene.title, "title");
  const steps = requireArray(issues, `${path}.steps`, scene.steps, "steps");
  if (!steps) return;
  checkDuplicateStepIds(issues, `${path}.steps`, steps);
  warnIfNoSay(issues, path, steps);
  steps.forEach((step, i) => {
    const sPath = `${path}.steps[${i}]`;
    if (!isRecord(step)) { pushError(issues, sPath, "step must be an object"); return; }
    if (step.to != null) checkPercentPoint(issues, `${sPath}.to`, step.to);
    if (step.spotlight != null) checkPercentRect(issues, `${sPath}.spotlight`, step.spotlight);
    optionalEnum(issues, `${sPath}.action`, step.action, "action", ["none", "click", "double-click", "drag"] as const);
    optionalString(issues, `${sPath}.type`, step.type, "type");
    optionalString(issues, `${sPath}.annotate`, step.annotate, "annotate");
  });
}

export function validateOutro(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.title`, scene.title, "title");
  optionalString(issues, `${path}.subtitle`, scene.subtitle, "subtitle");
  optionalString(issues, `${path}.cta`, scene.cta, "cta");
  if (scene.links != null) {
    if (!Array.isArray(scene.links)) {
      pushError(issues, `${path}.links`, "links must be an array");
    } else {
      scene.links.forEach((l, i) => {
        const lPath = `${path}.links[${i}]`;
        if (!isRecord(l)) { pushError(issues, lPath, "link must be an object"); return; }
        requireString(issues, `${lPath}.label`, l.label, "label");
        requireString(issues, `${lPath}.url`, l.url, "url");
      });
    }
  }
}
