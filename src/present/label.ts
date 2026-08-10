// A human label per scene, for the Presenter's overview grid and the
// SpeakerView header — display-only chrome, never rendered into a video
// frame, so it deliberately isn't part of the scene schema (TODO.md D5).

import type { Scene } from "../scenes";

const KIND_LABEL: Record<Scene["kind"], string> = {
  title: "Title",
  bullets: "Bullets",
  code: "Code",
  terminal: "Terminal",
  diagram: "Diagram",
  sequence: "Sequence",
  chart: "Chart",
  stat: "Stats",
  compare: "Compare",
  walkthrough: "Walkthrough",
  outro: "Outro",
};

/** The most identifying bit of authored text a scene carries, whichever
 * field its kind happens to use for it. */
function scenePrimaryText(scene: Scene): string | undefined {
  switch (scene.kind) {
    case "title": return scene.title;
    case "bullets": return scene.heading;
    case "code": return scene.file;
    case "terminal": return scene.title ?? scene.cwd;
    case "diagram": return scene.title;
    case "sequence": return scene.title;
    case "chart": return scene.title;
    case "stat": return scene.heading;
    case "compare": return scene.heading;
    case "walkthrough": return scene.title;
    case "outro": return scene.title;
    default: {
      const exhaustive: never = scene;
      throw new Error(`scenePrimaryText: unhandled scene kind ${(exhaustive as Scene).kind}`);
    }
  }
}

/** Human label for a scene, e.g. "Diagram — Request path" or just "Title"
 * when the scene carries no distinguishing text. */
export function sceneLabel(scene: Scene): string {
  const text = scenePrimaryText(scene);
  return text ? `${KIND_LABEL[scene.kind]} — ${text}` : KIND_LABEL[scene.kind];
}
