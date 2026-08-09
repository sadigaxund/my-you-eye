import type { ShowcaseEntry } from "../../showcase/types";
import { Link } from ".";

const entry: ShowcaseEntry = {
  title: "Link",
  group: "navigation",
  description: "A styled <a> — the primitive underneath any real, navigable link (OutroScene's link list, prose, cards).",
  demos: [
    {
      name: "Variants",
      render: () => (
        <div className="flex gap-6">
          <Link href="https://example.com" target="_blank" rel="noopener noreferrer">Primary link</Link>
          <Link href="https://example.com" target="_blank" rel="noopener noreferrer" variant="muted">Muted link</Link>
        </div>
      ),
    },
    {
      name: "In a sentence",
      render: () => (
        <p className="text-sm text-fg max-w-sm">
          Read the <Link href="https://example.com">full changelog</Link> for details, or <Link href="https://example.com" variant="muted">unsubscribe</Link> at any time.
        </p>
      ),
    },
  ],
};
export default entry;
