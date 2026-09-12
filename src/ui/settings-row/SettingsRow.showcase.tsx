import type { ShowcaseEntry } from "../../showcase/types";
import { SettingsRow } from ".";
import { SettingsSection } from "../settings-section";
import { Switch } from "../switch";
import { Input } from "../input";

const entry: ShowcaseEntry = {
  title: "SettingsRow",
  group: "inputs",
  parent: "Settings",
  description:
    "Label and description on the left, a right-aligned control that stacks below on narrow widths.",
  demos: [
    {
      name: "Control widths",
      description: "Each width matches its control's content instead of stretching them all alike.",
      render: () => (
        <SettingsSection title="Sizing" description="One row per controlWidth value.">
          <SettingsRow label="Auto" description="Sized to the control's own content." controlWidth="auto">
            <Switch />
          </SettingsRow>
          <SettingsRow label="Extra small" description="Short numeric fields." controlWidth="xs">
            <Input type="number" defaultValue={80} aria-label="Extra small control" />
          </SettingsRow>
          <SettingsRow label="Small" description="Short enums and codes." controlWidth="sm">
            <Input defaultValue="en-US" aria-label="Small control" />
          </SettingsRow>
          <SettingsRow label="Medium" description="The default width for most controls." controlWidth="md">
            <Input defaultValue="Editor workspace" aria-label="Medium control" />
          </SettingsRow>
          <SettingsRow label="Large" description="Longer free text." controlWidth="lg">
            <Input defaultValue="https://example.com/webhook" aria-label="Large control" />
          </SettingsRow>
          <SettingsRow label="Full" description="Stretches to fill the row." controlWidth="full">
            <Input defaultValue="Stretches across the remaining row width" aria-label="Full width control" />
          </SettingsRow>
        </SettingsSection>
      ),
    },
    {
      name: "Stacked (narrow container)",
      description: "A narrow enclosing container forces the label above the control.",
      render: () => (
        <div className="flex flex-col gap-6">
          <div className="max-w-xs">
            <SettingsSection title="Narrow (stackAt sm)">
              <SettingsRow label="Display name" description="Shown on your public profile." controlWidth="md">
                <Input defaultValue="Ada Lovelace" aria-label="Display name" />
              </SettingsRow>
            </SettingsSection>
          </div>
          <div className="max-w-sm">
            <SettingsSection title="Narrow (stackAt md)">
              <SettingsRow
                label="Support email"
                description="Where account notices are sent."
                controlWidth="md"
                stackAt="md"
              >
                <Input defaultValue="support@example.com" aria-label="Support email" />
              </SettingsRow>
            </SettingsSection>
          </div>
        </div>
      ),
    },
    {
      name: "Label as click target",
      description: "With htmlFor, the whole left column — label and description — toggles the Switch.",
      render: () => (
        <SettingsSection title="Notifications">
          <SettingsRow
            label="Weekly digest"
            description="A summary of activity across every project you belong to, sent every Monday morning. Click anywhere in this text to toggle it."
            htmlFor="weekly-digest"
            controlWidth="auto"
          >
            <Switch id="weekly-digest" defaultChecked />
          </SettingsRow>
        </SettingsSection>
      ),
    },
  ],
};
export default entry;
