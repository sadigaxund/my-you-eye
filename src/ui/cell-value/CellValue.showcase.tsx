import type { ShowcaseEntry } from "../../showcase/types";
import { CellValue } from ".";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "../table";

const entry: ShowcaseEntry = {
  title: "CellValue",
  group: "data",
  demos: [
    {
      name: "Data types in a table",
      render: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Column</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>Text</TableCell><TableCell><CellValue type="text" value="Hello world" /></TableCell></TableRow>
            <TableRow><TableCell>Boolean true</TableCell><TableCell><CellValue type="boolean" value={true} /></TableCell></TableRow>
            <TableRow><TableCell>Boolean false</TableCell><TableCell><CellValue type="boolean" value={false} /></TableCell></TableRow>
            <TableRow><TableCell>Email</TableCell><TableCell><CellValue type="email" value="user@example.com" /></TableCell></TableRow>
            <TableRow><TableCell>URL</TableCell><TableCell><CellValue type="url" value="https://example.com/path/abc123" replacements={[{ pattern: "https://example.com/path/abc123", label: "example.com/path" }]} /></TableCell></TableRow>
            <TableRow><TableCell>URL as label</TableCell><TableCell><CellValue type="url" value="https://api.example.com/v2/docs?ref=abc" replacements={[{ pattern: "https://api.example.com/v2/docs?ref=abc", label: "API Docs →" }]} /></TableCell></TableRow>
            <TableRow><TableCell>JSON</TableCell><TableCell><CellValue type="json" value={{ name: "foo", count: 42, nested: { key: true } }} /></TableCell></TableRow>
            <TableRow><TableCell>Null</TableCell><TableCell><CellValue type="null" /></TableCell></TableRow>
            <TableRow><TableCell>Badge</TableCell><TableCell><CellValue type="badge" value="Active" badgeVariant="success" /></TableCell></TableRow>
            <TableRow><TableCell>Status</TableCell><TableCell><CellValue type="status" value="Running" statusVariant="info" statusPulse /></TableCell></TableRow>
          </TableBody>
        </Table>
      ),
    },
    {
      name: "Numeric types",
      render: () => (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead align="right">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>Number</TableCell><TableCell align="right"><CellValue type="number" value={1234567.89} /></TableCell></TableRow>
            <TableRow><TableCell>Percentage</TableCell><TableCell align="right"><CellValue type="percentage" value={0.123} /></TableCell></TableRow>
            <TableRow><TableCell>Bytes</TableCell><TableCell align="right"><CellValue type="bytes" value={2048} /></TableCell></TableRow>
            <TableRow><TableCell>Bytes (large)</TableCell><TableCell align="right"><CellValue type="bytes" value={1073741824} /></TableCell></TableRow>
            <TableRow><TableCell>Duration</TableCell><TableCell align="right"><CellValue type="duration" value={3661} /></TableCell></TableRow>
            <TableRow><TableCell>Duration (seconds)</TableCell><TableCell align="right"><CellValue type="duration" value={45} /></TableCell></TableRow>
            <TableRow><TableCell>Date (old)</TableCell><TableCell align="right"><CellValue type="date" value="2026-06-01" /></TableCell></TableRow>
            <TableRow><TableCell>Date (today)</TableCell><TableCell align="right"><CellValue type="date" value="2026-07-17" /></TableCell></TableRow>
            <TableRow><TableCell>Datetime</TableCell><TableCell align="right"><CellValue type="datetime" value="2026-07-17T12:00:00Z" /></TableCell></TableRow>
            <TableRow><TableCell>Array</TableCell><TableCell><CellValue type="array" value={["admin", "editor", "viewer"]} /></TableCell></TableRow>
          </TableBody>
        </Table>
      ),
    },
  ],
};
export default entry;
