// The reference video (TODO.md Phase G acceptance check): one `Video` data
// object — Title → Code (with a diff) → Diagram (with data flow) → Chart →
// Outro — rendered to a real MP4 by `VideoRoot` and playable live through
// `Presenter`/`PlayerEmbed`. Nothing here is a frame count, a color, or a
// className: every visual decision is the library's, per TODO.md D5.
import type { Video } from "my-you-eye/scenes";

const beforeCode = `async function getUser(id) {
  const res = await fetch(\`/api/users/\${id}\`);
  const user = await res.json();
  return user;
}`;

const afterCode = `async function getUser(id) {
  const cached = cache.get(id);
  if (cached) return cached;

  const res = await fetch(\`/api/users/\${id}\`, { signal: timeout(3000) });
  if (!res.ok) throw new UserFetchError(id, res.status);

  const user = await res.json();
  cache.set(id, user);
  return user;
}`;

export const referenceVideo: Video = {
  meta: {
    fps: 30,
    size: "1080p",
    theme: "default",
    appearance: "dark",
    font: "sans",
    title: "Hardening a fetch path",
    watermark: "@my-you-eye",
    progressBar: true,
    chapters: true,
  },
  scenes: [
    {
      kind: "title",
      transition: "none",
      chapter: "Part 1",
      title: "Hardening a fetch path",
      subtitle: "Caching, timeouts, and a proper error type",
    },
    {
      kind: "code",
      transition: "fade",
      file: "get-user.js",
      lang: "js",
      code: beforeCode,
      steps: [
        { say: "Here's the naive version — one fetch, no cache, no timeout.", typed: true },
        {
          say: "If the request hangs, this call hangs forever with it.",
          focus: [2, 2],
          highlight: ["fetch"],
        },
        {
          say: "We add a cache check up front, a request timeout, and a real error type on a bad response.",
          code: afterCode,
          focus: [2, 7],
        },
        {
          say: "Every successful response gets written back to the cache before we return it.",
          focus: [9, 10],
          annotate: [{ line: 9, text: "Cache the result for next time", side: "right" }],
        },
      ],
    },
    {
      kind: "diagram",
      transition: "slide",
      preset: "dataflow",
      title: "Where the cache sits",
      nodes: [
        { id: "caller", label: "caller", sublabel: "component" },
        { id: "getUser", label: "getUser()", accent: "primary" },
        { id: "cache", label: "cache", sublabel: "in-memory", accent: "success" },
        { id: "api", label: "api", sublabel: "/users/:id" },
      ],
      edges: [
        { from: "caller", to: "getUser", label: "call" },
        { from: "getUser", to: "cache", label: "check", kind: "sync" },
        { from: "cache", to: "getUser", label: "hit", kind: "data" },
        { from: "getUser", to: "api", label: "miss → fetch", kind: "async" },
        { from: "api", to: "getUser", label: "response", kind: "data" },
      ],
      steps: [
        { say: "A caller asks getUser for a user by id.", reveal: ["caller", "getUser"], connect: ["caller->getUser"] },
        { say: "getUser checks the cache first.", reveal: ["cache"], connect: ["getUser->cache"] },
        {
          say: "On a hit, the cached value flows straight back — no network round trip.",
          connect: ["cache->getUser"],
          flow: ["cache->getUser"],
        },
        {
          say: "On a miss, the request goes out to the API and the response is cached on the way back.",
          reveal: ["api"],
          connect: ["getUser->api", "api->getUser"],
          flow: ["getUser->api", "api->getUser"],
        },
      ],
    },
    {
      kind: "chart",
      transition: "fade",
      title: "p95 latency, before / after",
      subtitle: "milliseconds",
      chart: {
        type: "bar",
        categories: ["Cold cache", "Warm cache"],
        series: [
          { label: "Before", data: [420, 410] },
          { label: "After", data: [430, 12] },
        ],
        format: "number",
      },
      steps: [
        { say: "Cold-cache latency barely moves — there's nothing to cache yet.", series: ["Before", "After"] },
        {
          say: "Warm cache is the whole point: a cache hit returns in about 12 milliseconds.",
          focus: "Warm cache",
          callout: { value: 12, label: "Warm · After (ms)", format: "number" },
        },
      ],
    },
    {
      kind: "outro",
      transition: "wipe",
      title: "That's the fetch path, hardened",
      subtitle: "Cache, timeout, typed errors",
      links: [
        { label: "Source", url: "https://github.com/example/repo" },
        { label: "Docs", url: "https://example.com/docs" },
      ],
      cta: "Subscribe for the retry-queue follow-up",
    },
  ],
};
