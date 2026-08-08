import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import type { TimelineValue } from "./types";

const TimelineContext = createContext<TimelineValue | null>(null);

export interface TimelineProviderProps {
  value: TimelineValue;
  children: ReactNode;
}

/** Internal — only drivers (DomDriver, RemotionDriver) call this directly. */
export function TimelineProvider({ value, children }: TimelineProviderProps) {
  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>;
}

/**
 * The ONLY place any motion primitive learns about time (AGENTS.md §9c rule
 * 1, strengthened by TODO.md D2 — no primitive may read wall-clock time or
 * call a Remotion hook itself). Must be called under a <MotionRoot> (or a
 * driver directly). Throws if no provider is found, so a missing driver
 * fails loudly instead of silently freezing every primitive at frame 0.
 */
export function useTimeline(): TimelineValue {
  const ctx = useContext(TimelineContext);
  if (!ctx) {
    throw new Error(
      'useTimeline() must be called within a <MotionRoot mode="live" | "video">. ' +
        "No TimelineContext found above this component — every motion primitive needs a driver in the tree.",
    );
  }
  return ctx;
}
