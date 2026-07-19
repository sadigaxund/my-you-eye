import type { ShowcaseEntry } from "../../showcase/types";
import { Tabs, TabsList, TabsTrigger, TabsContent } from ".";

const entry: ShowcaseEntry = {
  title: "Tabs",
  group: "navigation",
  demos: [
    {
      name: "Underline",
      render: () => (
        <Tabs defaultValue="tab1">
          <TabsList variant="underline">
            <TabsTrigger variant="underline" value="tab1">Account</TabsTrigger>
            <TabsTrigger variant="underline" value="tab2">Settings</TabsTrigger>
            <TabsTrigger variant="underline" value="tab3">Billing</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1"><p className="text-sm text-muted pt-2">Account settings here.</p></TabsContent>
          <TabsContent value="tab2"><p className="text-sm text-muted pt-2">Preferences here.</p></TabsContent>
          <TabsContent value="tab3"><p className="text-sm text-muted pt-2">Billing info here.</p></TabsContent>
        </Tabs>
      ),
    },
    {
      name: "Pills",
      render: () => (
        <Tabs defaultValue="tab1">
          <TabsList variant="pills">
            <TabsTrigger variant="pills" value="tab1">Profile</TabsTrigger>
            <TabsTrigger variant="pills" value="tab2">Security</TabsTrigger>
            <TabsTrigger variant="pills" value="tab3">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1"><p className="text-sm text-muted pt-2">Profile info here.</p></TabsContent>
          <TabsContent value="tab2"><p className="text-sm text-muted pt-2">Security settings here.</p></TabsContent>
          <TabsContent value="tab3"><p className="text-sm text-muted pt-2">Notification preferences here.</p></TabsContent>
        </Tabs>
      ),
    },
    {
      name: "Filing",
      render: () => (
        <Tabs defaultValue="tab2" variant="filing">
          <TabsList>
            <TabsTrigger value="tab1">Account</TabsTrigger>
            <TabsTrigger value="tab2">Billing</TabsTrigger>
            <TabsTrigger value="tab3">Notifications</TabsTrigger>
          </TabsList>
          <TabsContent value="tab1"><p className="text-sm text-muted">Account settings here.</p></TabsContent>
          <TabsContent value="tab2"><p className="text-sm text-muted">Billing settings — active tab merges seamlessly into this panel.</p></TabsContent>
          <TabsContent value="tab3"><p className="text-sm text-muted">Notification preferences here.</p></TabsContent>
        </Tabs>
      ),
    },
  ],
};
export default entry;
