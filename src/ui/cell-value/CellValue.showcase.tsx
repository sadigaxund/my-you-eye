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
              <TableHead className="w-0 whitespace-nowrap">Column</TableHead>
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
            <TableRow><TableCell>Image</TableCell><TableCell><CellValue type="image" value="https://picsum.photos/seed/cv/80/80" /></TableCell></TableRow>
            <TableRow><TableCell>Audio</TableCell><TableCell><CellValue type="audio" value="https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" /></TableCell></TableRow>
            <TableRow><TableCell>Tree (object)</TableCell><TableCell><CellValue type="tree" value={{ name: "Project X", active: true, score: 98.5, url: "https://example.com", tags: ["frontend", "api", "docs"], config: { timeout: 5000, retries: 3, flags: { cache: true, debug: false } } }} /></TableCell></TableRow>
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
              <TableHead className="w-0 whitespace-nowrap">Type</TableHead>
              <TableHead>Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow><TableCell>Number</TableCell><TableCell><CellValue type="number" value={1234567.89} /></TableCell></TableRow>
            <TableRow><TableCell>Percentage</TableCell><TableCell><CellValue type="percentage" value={0.123} /></TableCell></TableRow>
            <TableRow><TableCell>Bytes</TableCell><TableCell><CellValue type="bytes" value={2048} /></TableCell></TableRow>
            <TableRow><TableCell>Bytes (large)</TableCell><TableCell><CellValue type="bytes" value={1073741824} /></TableCell></TableRow>
            <TableRow><TableCell>Duration</TableCell><TableCell><CellValue type="duration" value={3661} /></TableCell></TableRow>
            <TableRow><TableCell>Duration (seconds)</TableCell><TableCell><CellValue type="duration" value={45} /></TableCell></TableRow>
            <TableRow><TableCell>Date (Human)</TableCell><TableCell><CellValue type="date-human" value="2026-06-01" /></TableCell></TableRow>
            <TableRow><TableCell>Date (Human - now)</TableCell><TableCell><CellValue type="date-human" value={new Date().toISOString()} /></TableCell></TableRow>
            <TableRow><TableCell>Date (System)</TableCell><TableCell><CellValue type="date-system" value="2026-07-17" /></TableCell></TableRow>
            <TableRow><TableCell>Date (System - custom)</TableCell><TableCell><CellValue type="date-system" value="2026-07-17" dateFormat={{ weekday: "long", year: "numeric", month: "long", day: "numeric" }} /></TableCell></TableRow>
            <TableRow><TableCell>DateTime TZ</TableCell><TableCell><CellValue type="datetime-tz" value="2026-07-17T12:00:00Z" /></TableCell></TableRow>
            <TableRow><TableCell>Currency</TableCell><TableCell><CellValue type="currency" value={1234.56} /></TableCell></TableRow>
            <TableRow><TableCell>Currency (compact)</TableCell><TableCell><CellValue type="currency" value={1234567.89} compact /></TableCell></TableRow>
            <TableRow><TableCell>Signed</TableCell><TableCell><CellValue type="signed" value={42.5} /></TableCell></TableRow>
            <TableRow><TableCell>Signed negative</TableCell><TableCell><CellValue type="signed" value={-17.3} /></TableCell></TableRow>
            <TableRow><TableCell>Number (compact)</TableCell><TableCell><CellValue type="number" value={1234567} compact /></TableCell></TableRow>
            <TableRow><TableCell>Bytes (compact)</TableCell><TableCell><CellValue type="bytes" value={1073741824} compact /></TableCell></TableRow>
            <TableRow><TableCell>Array</TableCell><TableCell><CellValue type="array" value={["admin", "editor", "viewer"]} /></TableCell></TableRow>
          </TableBody>
        </Table>
      ),
    },
  ],
};
export default entry;
