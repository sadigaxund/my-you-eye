import { useSequence, useTimeline } from "../../motion/core";
import { Terminal } from "../../ui/terminal";
import type { TerminalEntry } from "../../ui/terminal";
import { sceneSteps, stepName } from "../timing";
import type { TerminalScene as TerminalSceneData, TerminalStep } from "../schema";

export interface TerminalSceneProps {
  scene: TerminalSceneData;
}

type PhaseKey = "command" | "spinner" | "output" | "exit";
type PhaseWindows = Partial<Record<PhaseKey, { start: number; end: number }>>;

function clamp01(n: number): number {
  return Math.max(0, Math.min(1, n));
}

/** Splits one entry's local 0→1 progress into ordered sub-phases — command
 * types in, then the spinner (if any) holds, then output appears, then the
 * exit-code badge lands — weighted so a longer command gets proportionally
 * more of the window than the badge's brief final beat. */
function phaseWindows(entry: TerminalStep): PhaseWindows {
  const segments: { key: PhaseKey; weight: number }[] = [];
  if (entry.command != null) segments.push({ key: "command", weight: 2 });
  if (entry.spinner != null) segments.push({ key: "spinner", weight: 1 });
  if (entry.output != null) segments.push({ key: "output", weight: 1 });
  if (entry.exitCode != null) segments.push({ key: "exit", weight: 0.5 });

  const total = segments.reduce((sum, s) => sum + s.weight, 0) || 1;
  const windows: PhaseWindows = {};
  let acc = 0;
  for (const seg of segments) {
    const start = acc / total;
    acc += seg.weight;
    windows[seg.key] = { start, end: acc / total };
  }
  return windows;
}

/** Builds the partially-revealed `TerminalEntry` for whichever entry is
 * currently running, from its own phase windows and local progress. */
function currentEntryView(entry: TerminalStep, localProgress: number): TerminalEntry {
  const windows = phaseWindows(entry);

  const command = entry.command != null && windows.command
    ? entry.command.slice(0, Math.floor(entry.command.length * clamp01((localProgress - windows.command.start) / (windows.command.end - windows.command.start))))
    : entry.command;

  const spinnerVisible = windows.spinner != null && localProgress >= windows.spinner.start && localProgress < windows.spinner.end;
  const outputVisible = windows.output != null && localProgress >= windows.output.start;
  const exitVisible = windows.exit != null && localProgress >= windows.exit.start;

  return {
    command,
    spinner: spinnerVisible ? entry.spinner : undefined,
    output: outputVisible ? entry.output : undefined,
    language: entry.language,
    exitCode: exitVisible ? entry.exitCode : undefined,
    cwd: entry.cwd,
    user: entry.user,
    host: entry.host,
    promptGlyph: entry.promptGlyph,
  };
}

/**
 * Wraps `Terminal`, revealing one entry per step (TODO.md Phase E): the
 * command types in, then the spinner (if set) holds, then output appears,
 * then the exit-code badge lands — all within that entry's own
 * `SequenceRange` from `useSequence(sceneSteps(scene), ...)`. Entries before
 * the current step render fully settled (spinner cleared — it's a transient
 * "this is running" cue, not a permanent part of the transcript); entries
 * after it aren't rendered yet. `Terminal` itself owns every visual (prompt
 * chrome, exit badge, output syntax highlighting) — this scene only decides
 * how much of each entry to hand it on a given frame.
 */
export function TerminalScene({ scene }: TerminalSceneProps) {
  const ranges = useSequence(sceneSteps(scene), scene.pace);
  const { frame } = useTimeline();

  let currentIndex = 0;
  scene.entries.forEach((entry, i) => {
    if (frame >= ranges[stepName(entry.id, i)].startFrame) currentIndex = i;
  });

  const visible: TerminalEntry[] = [];
  for (let i = 0; i <= currentIndex; i++) {
    const entry = scene.entries[i];
    if (i < currentIndex) {
      visible.push({
        command: entry.command,
        output: entry.output,
        language: entry.language,
        exitCode: entry.exitCode,
        cwd: entry.cwd,
        user: entry.user,
        host: entry.host,
        promptGlyph: entry.promptGlyph,
      });
      continue;
    }
    const range = ranges[stepName(entry.id, i)];
    const span = Math.max(1, range.endFrame - range.startFrame);
    visible.push(currentEntryView(entry, clamp01((frame - range.startFrame) / span)));
  }

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg px-panel-xl text-fg">
      <Terminal
        className="w-full max-w-3xl"
        entries={visible}
        prompt={scene.prompt}
        cwd={scene.cwd}
        user={scene.user}
        host={scene.host}
        title={scene.title}
        scheme={scene.scheme}
        chrome={scene.chrome}
        rows={scene.rows}
      />
    </div>
  );
}
