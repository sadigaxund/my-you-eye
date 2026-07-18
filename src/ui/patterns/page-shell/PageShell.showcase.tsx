import type { ShowcaseEntry } from "../../../showcase/types";
import { PageShell } from ".";
import { Button } from "../../button";
import { Card, CardContent } from "../../card";

const entry: ShowcaseEntry = {
  title: "PageShell",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <div className="mx-auto max-w-lg">
          <PageShell
            title="Dashboard"
            description="Welcome back, here's your overview."
          >
            <Card><CardContent className="p-8 text-center text-muted">Main content area</CardContent></Card>
          </PageShell>
        </div>
      ),
    },
    {
      name: "With actions",
      render: () => (
        <div className="mx-auto max-w-lg">
          <PageShell
            title="Users"
            description="Manage your team members."
            actions={<><Button variant="secondary">Export</Button><Button>Add user</Button></>}
          >
            <Card><CardContent className="p-8 text-center text-muted">User list here</CardContent></Card>
          </PageShell>
        </div>
      ),
    },
  ],
};
export default entry;
