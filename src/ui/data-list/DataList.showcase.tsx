import type { ShowcaseEntry } from "../../showcase/types";
import { DataList } from ".";

const items = [
  { label: "Name", value: "John Doe", type: "text" as const },
  { label: "Email", value: "john@example.com", type: "email" as const },
  { label: "Active", value: true, type: "boolean" as const },
  { label: "Role", value: "Admin", type: "badge" as const, badgeVariant: "primary" as const },
  { label: "Status", value: "Online", type: "status" as const, statusVariant: "success" as const, statusPulse: true },
  { label: "Website", value: "https://example.com/john", type: "url" as const, replacements: [{ pattern: "john", label: "..." }] },
];

const numericItems = [
  { label: "Requests", value: 1284739, type: "number" as const },
  { label: "Errors", value: 42, type: "number" as const },
  { label: "Uptime", value: 0.9998, type: "percentage" as const },
];

const manyItems = Array.from({ length: 20 }, (_, i) => ({
  label: `Property ${i + 1}`,
  value: `Value ${i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna. Ut enim ad minim`,
  type: "text" as const,
}));

const entry: ShowcaseEntry = {
  title: "DataList",
  group: "data",
  parent: "Table",
  description: "A label/value list (definition list) for record-detail views — the non-tabular counterpart to Table/DataTable.",
  demos: [
    {
      name: "Density (normal vs compact)",
      description: "density is the current name; variant=\"compact\" still works as a deprecated alias.",
      render: () => (
        <div className="flex gap-6">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-2">density=&quot;normal&quot;</p>
            <DataList items={items} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted mb-2">density=&quot;compact&quot;</p>
            <DataList items={items} density="compact" />
          </div>
        </div>
      ),
    },
    {
      name: "Striped",
      description: "striped is a real variant now — no more call-site [&>div:nth-child(odd)] hack.",
      render: () => <DataList items={items} striped />,
    },
    {
      name: "Label width",
      description: "labelWidth (\"sm\" | \"md\" | \"lg\") sizes the dt column on a two-column CSS grid instead of a hardcoded w-36. Same three items rendered at all three widths, side by side: at \"sm\" the longer labels truncate with an ellipsis (the column is too narrow for them); \"lg\" gives them enough room that nothing truncates.",
      render: () => {
        const labelWidthItems = [
          { label: "ID", value: "usr_8213", type: "text" as const },
          { label: "Deployment target region", value: "us-east-1", type: "text" as const },
          { label: "Autoscaling group capacity", value: 12, type: "number" as const },
        ];
        return (
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
            {(["sm", "md", "lg"] as const).map((w) => (
              <div key={w} className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-2 font-mono">labelWidth=&quot;{w}&quot;{w === "md" && " (default)"}</p>
                <DataList labelWidth={w} items={labelWidthItems} className="rounded-ui border border-border" />
              </div>
            ))}
          </div>
        );
      },
    },
    {
      name: "Alignment",
      description: "Numeric values render with tabular-nums via CellType; dt/dd share a single grid row so the label and value baselines match at every row.",
      render: () => <DataList items={numericItems} />,
    },
    {
      name: "Scrolling",
      render: () => (
        <DataList items={manyItems} className="rounded-ui border border-border max-h-48" />
      ),
    },
  ],
};
export default entry;
