import type { ShowcaseEntry } from "../../showcase/types";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from ".";
import { Button } from "../button";

const entry: ShowcaseEntry = {
  title: "Card",
  group: "display",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex flex-col gap-4 max-w-sm">
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
        <Card className="max-w-sm">
          <CardHeader><CardTitle>Confirm action</CardTitle></CardHeader>
          <CardContent>Are you sure you want to delete this item?</CardContent>
          <CardFooter className="flex justify-end gap-2">
            <Button variant="ghost" size="sm">Cancel</Button>
            <Button variant="danger" size="sm">Delete</Button>
          </CardFooter>
        </Card>
      ),
    },
  ],
};
export default entry;
