import type { ReactNode } from "react";

export type ShowcaseGroup = "inputs" | "display" | "feedback" | "overlay" | "navigation" | "data" | "patterns";

export interface ShowcaseEntry {
  title: string;
  group: ShowcaseGroup;
  demos: { name: string; render: () => ReactNode }[];
}
