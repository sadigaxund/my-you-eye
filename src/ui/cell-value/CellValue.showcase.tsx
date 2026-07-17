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
            <TableRow><TableCell>URL</TableCell><TableCell><CellValue type="url" value="https://example.com/path/abc123" replacements={[{ pattern: "abc123", label: "..." }]} /></TableCell></TableRow>
            <TableRow><TableCell>URL + masking</TableCell><TableCell><CellValue type="url" value="https://api.example.com/v2/sk-live-AbCdEf123456" replacements={[{ pattern: "sk-live-AbCdEf123456", label: "[redacted]" }]} /></TableCell></TableRow>
            <TableRow><TableCell>JSON</TableCell><TableCell><CellValue type="json" value={{ name: "foo", count: 42, nested: { key: true } }} /></TableCell></TableRow>
            <TableRow><TableCell>Null</TableCell><TableCell><CellValue type="null" /></TableCell></TableRow>
            <TableRow><TableCell>Badge</TableCell><TableCell><CellValue type="badge" value="Active" badgeVariant="success" /></TableCell></TableRow>
            <TableRow><TableCell>Status</TableCell><TableCell><CellValue type="status" value="Running" statusVariant="info" statusPulse /></TableCell></TableRow>
          </TableBody>
        </Table>
      ),
    },
  ],
};
export default entry;
