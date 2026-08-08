import type { ShowcaseEntry } from "../../showcase/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "Card",
  group: "display",
  description: "A container with header, title, content, and footer slots for grouping related content.",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <Card variant="default">
            <CardHeader><CardTitle>Default</CardTitle></CardHeader>
            <CardContent>This is a default card with a border.</CardContent>
          </Card>
          <Card variant="outlined">
            <CardHeader><CardTitle>Outlined</CardTitle></CardHeader>
            <CardContent>This card has a thicker border.</CardContent>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle>Elevated</CardTitle></CardHeader>
            <CardContent>This card has a shadow.</CardContent>
          </Card>
        </div>
      ),
    },
    {
      name: "With footer actions",
      render: () => (
        <div className="flex justify-center"><Card className="max-w-sm">
          <CardHeader><CardTitle>Confirm action</CardTitle></CardHeader>
          <CardContent>Are you sure you want to delete this item?</CardContent>
          <CardFooter className="flex justify-end gap-inline">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </CardFooter>
        </Card></div>
      ),
    },
    {
      name: "Size",
      description: "size on CardHeader/CardContent/CardFooter controls padding (sm/md/lg, token-sourced from --spacing-panel-sm/-panel/-panel-lg). md is the default and matches Alert's default padding for a consistent density across the library; the old hardcoded p-6 is still available as lg.",
      render: () => (
        <div className="flex flex-col gap-4 max-w-sm mx-auto">
          <Card>
            <CardHeader size="sm"><CardTitle>Small</CardTitle></CardHeader>
            <CardContent size="sm">Tighter padding for dense layouts.</CardContent>
          </Card>
          <Card>
            <CardHeader size="md"><CardTitle>Medium (default)</CardTitle></CardHeader>
            <CardContent size="md">The default density, aligned with Alert.</CardContent>
          </Card>
          <Card>
            <CardHeader size="lg"><CardTitle>Large</CardTitle></CardHeader>
            <CardContent size="lg">Roomier padding — matches the previous default.</CardContent>
          </Card>
        </div>
      ),
    },
  ],
};
export default entry;
