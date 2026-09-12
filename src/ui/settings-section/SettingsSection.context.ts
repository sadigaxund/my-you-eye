import { createContext, useContext } from "react";
import type { SettingsControlWidth } from "../settings-row/SettingsRow";

export interface SettingsSectionContextValue {
  controlWidth: SettingsControlWidth;
}

// Internal — not exported from the folder index. `SettingsRow` deep-imports
// this module directly (same pattern as `../graph-node/grid`) so a row can
// pick up the section's shared control width without the section handing it
// down as a prop on every child.
export const SettingsSectionContext = createContext<SettingsSectionContextValue | null>(null);

export function useSettingsSection(): SettingsSectionContextValue | null {
  return useContext(SettingsSectionContext);
}
