import type { ShowcaseEntry } from "../../showcase/types";
import { Link } from ".";

const entry: ShowcaseEntry = {
  title: "Link",
  group: "navigation",
  description: "A styled <a>, the primitive underneath any real navigable link: OutroScene's link list, prose, cards.",
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
      name: "underline={false}",
      description: "Drops the hover underline for links that are already a card or a nav row.",
      render: () => (
        <div className="flex gap-4">
          <Link
            href="https://example.com"
            variant="muted"
            underline={false}
            className="flex w-48 flex-col gap-1 rounded-ui border border-border px-4 py-3 hover:bg-secondary"
          >
            <span className="block text-xs uppercase tracking-wide opacity-muted">Previous</span>
            <span className="block text-sm font-medium text-fg">← Typography &amp; Tokens</span>
          </Link>
          <Link
            href="https://example.com"
            variant="muted"
            underline={false}
            className="flex w-48 flex-col gap-1 rounded-ui border border-border px-4 py-3 text-right hover:bg-secondary"
          >
            <span className="block text-xs uppercase tracking-wide opacity-muted">Next</span>
            <span className="block text-sm font-medium text-fg">Markdown →</span>
          </Link>
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
