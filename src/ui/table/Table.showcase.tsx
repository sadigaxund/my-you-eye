import type { ShowcaseEntry } from "../../showcase/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from ".";

const sampleRows = [
  { name: "John Doe", role: "Admin", status: "Active" },
  { name: "Jane Smith", role: "Editor", status: "Active" },
  { name: "Bob Johnson", role: "Viewer", status: "Inactive" },
];

const entry: ShowcaseEntry = {
  title: "Table",
  group: "data",
  demos: [
    {
      name: "Default",
      render: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleRows.map((row, i) => (
              <TableRow key={i}>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.role}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ),
    },
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
  ],
};
export default entry;
