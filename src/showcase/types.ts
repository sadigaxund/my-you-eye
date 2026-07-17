import type { ReactNode } from "react";

export type ShowcaseGroup = "inputs" | "display" | "feedback" | "overlay" | "navigation" | "canvas" | "data" | "patterns" | "typography";

export interface ShowcaseEntry {
  title: string;
  group: ShowcaseGroup;
  demos: { name: string; render: () => ReactNode }[];
}
