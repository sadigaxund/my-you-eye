import type { ShowcaseEntry } from "../../showcase/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from ".";
import { CellType } from "../cell-type";
import { StatusDot } from "../status-dot";

const rows = [
  { name: "Alpha", role: "Admin", status: "success" as const, sessions: 128 },
  { name: "Beta", role: "Editor", status: "warning" as const, sessions: 42 },
  { name: "Gamma", role: "Viewer", status: "neutral" as const, sessions: 7 },
];

const longRows = [
  { name: "Alpha", note: "Owns the checkout flow, the payments webhook handler, and the fraud-review queue." },
  { name: "Beta", note: "Short note." },
  { name: "Gamma", note: "Backfilling the old analytics warehouse into the new event pipeline before the Q3 cutover." },
];

const entry: ShowcaseEntry = {
  title: "Table",
  group: "data",
  parent: "Table",
  description: "The raw compositional table primitives (Table/TableHeader/TableBody/TableRow/TableHead/TableCell) — DataTable is the data-driven pattern built on top of these for typical use. Reach for Table directly when you need bespoke markup a data-driven API can't express.",
  demos: [
    {
      name: "Composition",
      description: "align is per-cell: left by default, center for a glyph column, right for numbers.",
      render: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead align="center">Status</TableHead>
              <TableHead align="right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell align="center"><StatusDot variant={r.status} size="sm" /></TableCell>
                <TableCell align="right" className="font-mono tabular-nums">{r.sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Variants",
      render: () => (
        <Table variant="striped">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead align="right">Sessions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.name}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.role}</TableCell>
                <TableCell align="right" className="font-mono tabular-nums">{r.sessions}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Density",
      description: "density lives on TableHead/TableCell (the parts that actually have height/padding) — Table and TableRow don't take a density prop themselves since they have no independent height to control.",
      render: () => (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-muted mb-1 font-mono">normal</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead align="right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell align="right" className="font-mono tabular-nums">{r.sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div>
            <p className="text-xs text-muted mb-1 font-mono">compact</p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead density="compact">Name</TableHead>
                  <TableHead density="compact" align="right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.name}>
                    <TableCell density="compact">{r.name}</TableCell>
                    <TableCell density="compact" align="right" className="font-mono tabular-nums">{r.sessions}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ),
    },
    {
      name: "Truncation & expand",
      description: "TableCell doesn't truncate on its own — it's a plain <td>. Put a CellType inside it (as DataTable does internally) and long content gets the same truncate + chevron + click-to-expand-popover behavior every other CellType consumer gets, anchored to the cell's own measured width.",
      render: () => (
        <div className="max-w-sm">
          <Table variant="striped">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {longRows.map((r) => (
                <TableRow key={r.name}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell className="max-w-0"><CellType type="text" value={r.note} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ),
    },
    {
      name: "Sticky header",
      description: "TableHeader's sticky background (bg-surface-opaque) is guaranteed opaque so rows never show through as they scroll underneath, in every theme.",
      render: () => (
        <div className="rounded-ui border border-border overflow-auto max-h-40 [scrollbar-gutter:stable]">
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead align="right">Sessions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...rows, ...rows, ...rows].map((r, i) => (
                <TableRow key={i}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell align="right" className="font-mono tabular-nums">{r.sessions}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ),
    },
  ],
};
export default entry;
