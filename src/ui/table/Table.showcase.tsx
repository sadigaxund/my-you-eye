import type { ShowcaseEntry } from "../../showcase/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from ".";

const rows = [
  { name: "Alpha", role: "Admin", sessions: 128 },
  { name: "Beta", role: "Editor", sessions: 42 },
  { name: "Gamma", role: "Viewer", sessions: 7 },
];

const entry: ShowcaseEntry = {
  title: "Table",
  group: "data",
  parent: "Table",
  description: "The raw compositional table primitives (Table/TableHeader/TableBody/TableRow/TableHead/TableCell) — DataTable is the data-driven pattern built on top of these for typical use. Reach for Table directly when you need bespoke markup a data-driven API can't express.",
  demos: [
    {
      name: "Composition",
      render: () => (
        <Table>
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
