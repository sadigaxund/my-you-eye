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
  description: "A label/value list (a definition list) for record-detail views, the non-tabular counterpart to Table and DataTable.",
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
      description: "striped is a real variant, so the call site no longer needs a [&>div:nth-child(odd)] hack.",
      render: () => <DataList items={items} striped />,
    },
    {
      name: "Label width",
      description: "labelWidth (\"sm\" | \"md\" | \"lg\") puts the dt column on a two-column CSS grid at 8rem, 9rem or 11rem instead of the old hardcoded w-36. The same three rows render at all three widths with a divider on the label column: \"ID\" always fits, \"Deployment target region\" fits from \"md\" up, and \"Autoscaling group desired capacity\" still truncates at \"lg\" while showing visibly more of itself as the column widens.",
      render: () => {
        const labelWidthItems = [
          { label: "ID", value: "usr_8213", type: "text" as const },
          { label: "Deployment target region", value: "us-east-1", type: "text" as const },
          { label: "Autoscaling group desired capacity", value: 12, type: "number" as const },
        ];
        const WIDTH_PX = { sm: "128px", md: "144px", lg: "176px" } as const;
        return (
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-4">
            {(["sm", "md", "lg"] as const).map((w) => (
              <div key={w} className="flex-1 min-w-0">
                <p className="text-xs text-muted mb-2 font-mono">
                  labelWidth=&quot;{w}&quot; <span className="text-muted/70">({WIDTH_PX[w]})</span>
                  {w === "md" && " — default"}
                </p>
                <DataList
                  labelWidth={w}
                  items={labelWidthItems}
                  className="rounded-ui border border-border [&_dt]:border-r [&_dt]:border-dashed [&_dt]:border-border [&_dt]:pr-2"
                />
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
