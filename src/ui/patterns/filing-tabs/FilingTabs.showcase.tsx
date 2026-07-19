import type { ShowcaseEntry } from "../../../showcase/types";
import { FilingTabs, FilingTabsList, FilingTabsTrigger, FilingTabsContent } from ".";

const entry: ShowcaseEntry = {
  title: "FilingTabs",
  group: "patterns",
  demos: [
    {
      name: "Default",
      render: () => (
        <FilingTabs defaultValue="tab1">
          <FilingTabsList>
            <FilingTabsTrigger value="tab1">Account</FilingTabsTrigger>
            <FilingTabsTrigger value="tab2">Password</FilingTabsTrigger>
            <FilingTabsTrigger value="tab3">Notifications</FilingTabsTrigger>
          </FilingTabsList>
          <FilingTabsContent value="tab1" className="p-4">
            <p className="text-sm text-fg">Account settings panel with seamless tab-to-content transition.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab2" className="p-4">
            <p className="text-sm text-fg">Password settings — active tab merges into this panel.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab3" className="p-4">
            <p className="text-sm text-fg">Notification preferences with filing tab styling.</p>
          </FilingTabsContent>
        </FilingTabs>
      ),
    },
    {
      name: "Many tabs",
      render: () => (
        <FilingTabs defaultValue="tab2">
          <FilingTabsList>
            <FilingTabsTrigger value="tab1">Overview</FilingTabsTrigger>
            <FilingTabsTrigger value="tab2">Billing</FilingTabsTrigger>
            <FilingTabsTrigger value="tab3">Integrations</FilingTabsTrigger>
            <FilingTabsTrigger value="tab4">Team</FilingTabsTrigger>
            <FilingTabsTrigger value="tab5">Advanced</FilingTabsTrigger>
          </FilingTabsList>
          <FilingTabsContent value="tab1" className="p-4">
            <p className="text-sm text-fg">Overview panel.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab2" className="p-4">
            <p className="text-sm text-fg">Billing panel — middle tab active, notches render on both sides.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab3" className="p-4">
            <p className="text-sm text-fg">Integrations panel.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab4" className="p-4">
            <p className="text-sm text-fg">Team panel.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab5" className="p-4">
            <p className="text-sm text-fg">Advanced settings.</p>
          </FilingTabsContent>
        </FilingTabs>
      ),
    },
    {
      name: "First tab active",
      render: () => (
        <FilingTabs defaultValue="tab1">
          <FilingTabsList>
            <FilingTabsTrigger value="tab1">Active</FilingTabsTrigger>
            <FilingTabsTrigger value="tab2">Inactive</FilingTabsTrigger>
            <FilingTabsTrigger value="tab3">Inactive</FilingTabsTrigger>
          </FilingTabsList>
          <FilingTabsContent value="tab1" className="p-4">
            <p className="text-sm text-fg">First tab active — left notch is at the container edge.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab2" className="p-4">
            <p className="text-sm text-fg">Second panel.</p>
          </FilingTabsContent>
          <FilingTabsContent value="tab3" className="p-4">
            <p className="text-sm text-fg">Third panel.</p>
          </FilingTabsContent>
        </FilingTabs>
      ),
    },
  ],
};
export default entry;
