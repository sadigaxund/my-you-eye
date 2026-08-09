// Chart + stat checks. Chart shape validation is dispatched on `chart.type`
// (mirroring the `ChartSpec` discriminated union); the reference-integrity
// checks here are `ChartStep.series` names against whichever series/slice
// labels that chart type actually declares, and `ChartStep.focus` against
// `chart.categories` for the two types that have one.

import {
  isRecord, isString, isFiniteNumber,
  pushError, pushWarning,
  requireString, optionalString, optionalEnum, requireArray,
  checkDuplicateStepIds, warnIfNoSay,
} from "./validate.helpers";
import type { ValidationIssue } from "./validate.helpers";

const NUMBER_FORMATS = ["number", "percent", "bytes", "currency", "duration", "compact"] as const;
const CHART_TYPES = ["bar", "line", "pie", "gauge", "heatmap", "scatter", "funnel"] as const;

function checkStringArray(issues: ValidationIssue[], path: string, value: unknown, field: string): string[] | undefined {
  const arr = requireArray(issues, path, value, field, 0);
  if (!arr) return undefined;
  if (arr.some((v) => !isString(v))) { pushError(issues, path, `${field} must be an array of strings`); return undefined; }
  return arr as string[];
}

function checkNumberArray(issues: ValidationIssue[], path: string, value: unknown, field: string): number[] | undefined {
  if (!Array.isArray(value) || value.some((v) => !isFiniteNumber(v))) {
    pushError(issues, path, `${field} must be an array of numbers`);
    return undefined;
  }
  return value as number[];
}

/** Returns the set of "series-like" labels this chart type exposes — the
 * bar/line/scatter `series[].label`, or pie's `slices[].label`. Heatmap,
 * gauge and funnel have no such concept. */
function seriesLabelsOf(chart: Record<string, unknown>): Set<string> | undefined {
  if (chart.type === "bar" || chart.type === "line" || chart.type === "scatter") {
    if (!Array.isArray(chart.series)) return undefined;
    return new Set(chart.series.filter(isRecord).map((s) => s.label).filter(isString));
  }
  if (chart.type === "pie") {
    if (!Array.isArray(chart.slices)) return undefined;
    return new Set(chart.slices.filter(isRecord).map((s) => s.label).filter(isString));
  }
  return undefined;
}

function validateBarOrLine(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const categories = checkStringArray(issues, `${path}.categories`, chart.categories, "categories");
  const series = requireArray(issues, `${path}.series`, chart.series, "series");
  optionalEnum(issues, `${path}.format`, chart.format, "format", NUMBER_FORMATS);
  if (chart.type === "bar") {
    optionalEnum(issues, `${path}.orientation`, chart.orientation, "orientation", ["vertical", "horizontal"] as const);
    optionalEnum(issues, `${path}.mode`, chart.mode, "mode", ["grouped", "stacked"] as const);
  }
  if (!series || !categories) return;
  series.forEach((s, i) => {
    const sPath = `${path}.series[${i}]`;
    if (!isRecord(s)) { pushError(issues, sPath, "series item must be an object"); return; }
    requireString(issues, `${sPath}.label`, s.label, "label");
    const data = checkNumberArray(issues, `${sPath}.data`, s.data, "data");
    if (data && data.length !== categories.length) {
      pushError(issues, `${sPath}.data`, `data has ${data.length} points but categories has ${categories.length} — they must match`);
    }
  });
}

function validatePie(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const slices = requireArray(issues, `${path}.slices`, chart.slices, "slices");
  if (chart.donut != null && typeof chart.donut !== "boolean") pushError(issues, `${path}.donut`, "donut must be a boolean");
  optionalString(issues, `${path}.centerLabel`, chart.centerLabel, "centerLabel");
  optionalString(issues, `${path}.centerValue`, chart.centerValue, "centerValue");
  slices?.forEach((s, i) => {
    const sPath = `${path}.slices[${i}]`;
    if (!isRecord(s)) { pushError(issues, sPath, "slice must be an object"); return; }
    requireString(issues, `${sPath}.label`, s.label, "label");
    if (!isFiniteNumber(s.value)) pushError(issues, `${sPath}.value`, "value must be a number");
  });
}

function validateGauge(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  if (!isFiniteNumber(chart.value)) pushError(issues, `${path}.value`, "value must be a number");
  if (chart.min != null && !isFiniteNumber(chart.min)) pushError(issues, `${path}.min`, "min must be a number");
  if (chart.max != null && !isFiniteNumber(chart.max)) pushError(issues, `${path}.max`, "max must be a number");
  optionalString(issues, `${path}.label`, chart.label, "label");
  optionalEnum(issues, `${path}.format`, chart.format, "format", NUMBER_FORMATS);
  if (chart.bands != null) {
    if (!Array.isArray(chart.bands)) { pushError(issues, `${path}.bands`, "bands must be an array"); return; }
    let prevUpTo = -Infinity;
    chart.bands.forEach((b, i) => {
      const bPath = `${path}.bands[${i}]`;
      if (!isRecord(b)) { pushError(issues, bPath, "band must be an object"); return; }
      if (!isFiniteNumber(b.upTo)) { pushError(issues, `${bPath}.upTo`, "upTo must be a number"); return; }
      if (b.upTo < prevUpTo) pushError(issues, `${bPath}.upTo`, `bands must be ascending by upTo (${b.upTo} follows ${prevUpTo})`);
      prevUpTo = b.upTo;
      optionalEnum(issues, `${bPath}.status`, b.status, "status", ["success", "warning", "danger"] as const);
    });
  }
}

function validateHeatmap(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const columns = checkStringArray(issues, `${path}.columns`, chart.columns, "columns");
  const rows = checkStringArray(issues, `${path}.rows`, chart.rows, "rows");
  optionalEnum(issues, `${path}.format`, chart.format, "format", NUMBER_FORMATS);
  if (!Array.isArray(chart.values)) { pushError(issues, `${path}.values`, "values must be a row-major number[][]"); return; }
  if (!rows || !columns) return;
  if (chart.values.length !== rows.length) {
    pushError(issues, `${path}.values`, `values has ${chart.values.length} rows but rows has ${rows.length} — they must match`);
  }
  chart.values.forEach((row, i) => {
    if (!Array.isArray(row) || row.some((v) => !isFiniteNumber(v))) {
      pushError(issues, `${path}.values[${i}]`, "each row must be an array of numbers");
    } else if (row.length !== columns.length) {
      pushError(issues, `${path}.values[${i}]`, `row has ${row.length} values but columns has ${columns.length} — the matrix must be rectangular`);
    }
  });
}

function validateScatter(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const series = requireArray(issues, `${path}.series`, chart.series, "series");
  if (chart.trend != null && typeof chart.trend !== "boolean") pushError(issues, `${path}.trend`, "trend must be a boolean");
  optionalEnum(issues, `${path}.format`, chart.format, "format", NUMBER_FORMATS);
  series?.forEach((s, i) => {
    const sPath = `${path}.series[${i}]`;
    if (!isRecord(s)) { pushError(issues, sPath, "series item must be an object"); return; }
    requireString(issues, `${sPath}.label`, s.label, "label");
    if (!Array.isArray(s.data)) { pushError(issues, `${sPath}.data`, "data must be an array of {x, y} points"); return; }
    s.data.forEach((p, pi) => {
      if (!isRecord(p) || !isFiniteNumber(p.x) || !isFiniteNumber(p.y)) {
        pushError(issues, `${sPath}.data[${pi}]`, "point must be a {x, y} pair of numbers");
      }
    });
  });
}

function validateFunnel(chart: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  const stages = requireArray(issues, `${path}.stages`, chart.stages, "stages");
  optionalEnum(issues, `${path}.format`, chart.format, "format", NUMBER_FORMATS);
  stages?.forEach((s, i) => {
    const sPath = `${path}.stages[${i}]`;
    if (!isRecord(s)) { pushError(issues, sPath, "stage must be an object"); return; }
    requireString(issues, `${sPath}.label`, s.label, "label");
    if (!isFiniteNumber(s.value)) pushError(issues, `${sPath}.value`, "value must be a number");
  });
}

export function validateChart(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.title`, scene.title, "title");
  optionalString(issues, `${path}.subtitle`, scene.subtitle, "subtitle");

  const chart = scene.chart;
  if (!isRecord(chart)) { pushError(issues, `${path}.chart`, "chart is required"); return; }
  const chartPath = `${path}.chart`;
  optionalEnum(issues, `${chartPath}.type`, chart.type, "type", CHART_TYPES);

  switch (chart.type) {
    case "bar": case "line": validateBarOrLine(chart, chartPath, issues); break;
    case "pie": validatePie(chart, chartPath, issues); break;
    case "gauge": validateGauge(chart, chartPath, issues); break;
    case "heatmap": validateHeatmap(chart, chartPath, issues); break;
    case "scatter": validateScatter(chart, chartPath, issues); break;
    case "funnel": validateFunnel(chart, chartPath, issues); break;
    default: break; // unknown type already flagged above
  }

  if (scene.steps == null) return;
  if (!Array.isArray(scene.steps)) { pushError(issues, `${path}.steps`, "steps must be an array"); return; }
  checkDuplicateStepIds(issues, `${path}.steps`, scene.steps);
  warnIfNoSay(issues, path, scene.steps);

  const seriesLabels = seriesLabelsOf(chart);
  const categories = chart.type === "bar" || chart.type === "line" ? chart.categories : undefined;
  const categorySet = Array.isArray(categories) ? new Set(categories.filter(isString)) : undefined;

  scene.steps.forEach((step, i) => {
    const sPath = `${path}.steps[${i}]`;
    if (!isRecord(step)) { pushError(issues, sPath, "step must be an object"); return; }
    if (step.series != null) {
      if (!Array.isArray(step.series)) {
        pushError(issues, `${sPath}.series`, "series must be an array of series names");
      } else if (!seriesLabels) {
        pushError(issues, `${sPath}.series`, `chart type "${String(chart.type)}" has no series to reveal`);
      } else {
        step.series.forEach((name, ni) => {
          if (!isString(name) || !seriesLabels.has(name)) {
            pushError(issues, `${sPath}.series[${ni}]`, `"${String(name)}" does not match any series label`);
          }
        });
      }
    }
    if (step.focus != null) {
      if (!isString(step.focus)) {
        pushError(issues, `${sPath}.focus`, "focus must be a category label string");
      } else if (categorySet && !categorySet.has(step.focus)) {
        pushError(issues, `${sPath}.focus`, `"${step.focus}" does not match any category`);
      }
    }
    if (step.callout != null) {
      const cPath = `${sPath}.callout`;
      if (!isRecord(step.callout)) { pushError(issues, cPath, "callout must be an object"); return; }
      if (!isFiniteNumber(step.callout.value)) pushError(issues, `${cPath}.value`, "value must be a number");
      requireString(issues, `${cPath}.label`, step.callout.label, "label");
      optionalEnum(issues, `${cPath}.format`, step.callout.format, "format", NUMBER_FORMATS);
    }
  });
}

export function validateStat(scene: Record<string, unknown>, path: string, issues: ValidationIssue[]): void {
  optionalString(issues, `${path}.heading`, scene.heading, "heading");
  if (scene.columns != null && ![2, 3, 4, 5, 6].includes(scene.columns as number)) {
    pushError(issues, `${path}.columns`, "columns must be one of 2, 3, 4, 5, 6");
  }
  const stats = requireArray(issues, `${path}.stats`, scene.stats, "stats");
  if (!stats) return;
  checkDuplicateStepIds(issues, `${path}.stats`, stats);
  warnIfNoSay(issues, path, stats);
  stats.forEach((s, i) => {
    const sPath = `${path}.stats[${i}]`;
    if (!isRecord(s)) { pushError(issues, sPath, "stat must be an object"); return; }
    requireString(issues, `${sPath}.label`, s.label, "label");
    if (s.value == null && s.text == null) {
      pushWarning(issues, sPath, "neither value nor text is set — this tile will render empty");
    }
    if (s.value != null && !isFiniteNumber(s.value)) pushError(issues, `${sPath}.value`, "value must be a number");
    optionalString(issues, `${sPath}.text`, s.text, "text");
    optionalEnum(issues, `${sPath}.format`, s.format, "format", NUMBER_FORMATS);
    if (s.delta != null && !isFiniteNumber(s.delta)) pushError(issues, `${sPath}.delta`, "delta must be a number");
    if (s.positiveIsGood != null && typeof s.positiveIsGood !== "boolean") pushError(issues, `${sPath}.positiveIsGood`, "positiveIsGood must be a boolean");
    if (s.sparkline != null) checkNumberArray(issues, `${sPath}.sparkline`, s.sparkline, "sparkline");
  });
}
