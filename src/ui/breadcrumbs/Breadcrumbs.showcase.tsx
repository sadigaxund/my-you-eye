import type { ShowcaseEntry } from "../../showcase/types";
import { Breadcrumbs } from ".";

const entry: ShowcaseEntry = {
  title: "Breadcrumbs",
  group: "navigation",
  demos: [
    {
      name: "Default",
      render: () => (
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Products", href: "/products" },
            { label: "Widgets" },
          ]}
        />
      ),
    },
    {
      name: "Custom separator",
      render: () => (
        <Breadcrumbs
          separator="›"
          items={[
            { label: "Dashboard", href: "/" },
            { label: "Settings" },
          ]}
        />
      ),
    },
  ],
};
export default entry;
