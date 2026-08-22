import { useMemo, useState } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { FindWidget } from ".";
import type { FindOptions } from ".";

const SAMPLE = "the quick brown fox jumps over the lazy dog".split(" ");

function LiveFindDemo() {
  const [query, setQuery] = useState("the");
  const [activeMatch, setActiveMatch] = useState(0);
  const [options, setOptions] = useState<FindOptions>({ caseSensitive: false, wholeWord: false, regex: false });

  // Demo engine: naive word scan standing in for whatever the consumer wires
  // (CodeMirror's @codemirror/search in the motivating case).
  const matches = useMemo(() => {
    if (!query) return [];
    try {
      const re = new RegExp(
        options.regex ? query : query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        options.caseSensitive ? "g" : "gi",
      );
      return SAMPLE.map((w, i) => (options.wholeWord ? (re.test(w) ? i : -1) : (re.test(w) ? i : -1))).filter((i) => i >= 0);
    } catch {
      return [];
    }
  }, [query, options]);

  const clamped = matches.length === 0 ? 0 : activeMatch % matches.length;

  return (
    <div className="relative mx-auto h-48 max-w-xl overflow-hidden rounded-ui border border-border bg-surface">
      <FindWidget
        query={query}
        onQueryChange={(q) => { setQuery(q); setActiveMatch(0); }}
        matchCount={matches.length}
        activeMatch={clamped}
        options={options}
        onOptionsChange={setOptions}
        onNext={() => setActiveMatch((i) => (matches.length ? (i + 1) % matches.length : 0))}
        onPrevious={() => setActiveMatch((i) => (matches.length ? (i - 1 + matches.length) % matches.length : 0))}
        onClose={() => setQuery("")}
      />
      <p className="p-4 pt-24 text-sm leading-relaxed">
        {SAMPLE.map((word, i) => (
          <span key={i} className={matches.includes(i) ? (i === matches[clamped] ? "rounded-sm bg-primary/25" : "rounded-sm bg-primary/10") : ""}>
            {word}{" "}
          </span>
        ))}
      </p>
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "FindWidget",
  group: "overlay",
  description:
    "Floating find/replace card docking to a container's top-right corner — engine-agnostic and fully controlled; the consumer owns the search state.",
  demos: [
    {
      name: "Live demo over sample text",
      description:
        "Enter = next, Shift+Enter = previous, Escape closes. Toggle replace via the chevron. The counter announces politely to screen readers.",
      render: () => <LiveFindDemo />,
    },
  ],
};
export default entry;
