import type { ShowcaseEntry } from "../../showcase/types";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from ".";
import { ScrollArea } from "../scroll-area";

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
