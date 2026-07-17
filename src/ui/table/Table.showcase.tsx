import type { ShowcaseEntry } from "../../showcase/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from ".";
import { ScrollArea } from "../scroll-area";

const sampleRows = [
  { name: "John Doe", role: "Admin", status: "Active" },
  { name: "Jane Smith", role: "Editor", status: "Active" },
  { name: "Bob Johnson", role: "Viewer", status: "Inactive" },
];

const numericRows = [
  { label: "Revenue", value: 1234567, change: 0.12 },
  { label: "Users", value: 89234, change: -0.03 },
  { label: "Sessions", value: 452189, change: 0.07 },
];

const manyRows = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  name: `Row ${i + 1}`,
  value: Math.random() * 10000,
}));

const entry: ShowcaseEntry = {
  title: "Table",
  group: "data",
  demos: [
    {
      name: "Striped + compact",
      render: () => (
        <Table variant="striped" density="compact">
          <TableHeader>
            <TableRow>
              <TableHead density="compact">Name</TableHead>
              <TableHead density="compact">Role</TableHead>
              <TableHead density="compact">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.map((row, i) => (
              <TableRow key={i} density="compact">
                <TableCell density="compact">{row.name}</TableCell>
                <TableCell density="compact">{row.role}</TableCell>
                <TableCell density="compact">{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Column alignment (numbers right)",
      render: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead align="right">Value</TableHead>
              <TableHead align="right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {numericRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.label}</TableCell>
                <TableCell align="right" className="font-mono tabular-nums">{row.value.toLocaleString()}</TableCell>
                <TableCell align="right" className={row.change >= 0 ? "text-success" : "text-danger"}>
                  {(row.change * 100).toFixed(1)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Sticky header (scroll down)",
      render: () => (
        <ScrollArea className="max-h-48 border border-border rounded-ui">
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Name</TableHead>
                <TableHead align="right">Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {manyRows.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell align="right" className="font-mono tabular-nums">{row.value.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      ),
    },
  ],
};
export default entry;
