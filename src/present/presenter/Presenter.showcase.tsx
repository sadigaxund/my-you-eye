import type { ShowcaseEntry } from "../../showcase/types";
import { Presenter } from ".";
import type { Video } from "../../scenes";

const demoVideo: Video = {
  meta: { fps: 30, theme: "default", appearance: "dark" },
  scenes: [
    {
      kind: "title",
      title: "How the scheduler works",
      subtitle: "A live walkthrough",
      notes: "Welcome the audience, set expectations for a short walkthrough.",
    },
    {
      kind: "diagram",
      preset: "architecture",
      title: "Request path",
      notes:
        "This pane is live, not a recording — hover a node to see its edges light up, click one to focus its neighborhood and dim the rest.",
      nodes: [
        { id: "client", label: "Client", sublabel: "browser" },
        { id: "api", label: "api", sublabel: "gateway", status: "success", accent: "primary" },
        { id: "queue", label: "queue", metric: "1.2k/s", status: "success" },
        { id: "worker", label: "worker", sublabel: "×3", accent: "success" },
      ],
      edges: [
        { from: "client", to: "api", label: "HTTPS" },
        { from: "api", to: "queue", label: "enqueue" },
        { from: "queue", to: "worker" },
      ],
      steps: [
        { say: "A client calls into the API gateway.", reveal: ["client", "api"], connect: ["client->api"] },
        { say: "The gateway enqueues work behind it.", reveal: ["queue"], connect: ["api->queue"] },
        { say: "Workers pick jobs off the queue.", reveal: ["worker"], connect: ["queue->worker"], flow: ["queue->worker"] },
      ],
    },
    {
      kind: "outro",
      title: "That's the request path.",
      cta: "Try hovering and clicking the diagram nodes above.",
    },
  ],
};

const entry: ShowcaseEntry = {
  title: "Presenter",
  group: "scenes",
  description:
    "Step-through presentation of a Video: Space or → advances, ← reverses, Esc opens the overview, f fullscreens. Clicking the stage does nothing, so a live scene keeps its own pointer events.",
  demos: [
    {
      name: "Click-through presenter",
      render: () => (
        <div className="h-[600px] w-full overflow-hidden rounded-ui border border-border">
          <Presenter video={demoVideo} />
        </div>
      ),
    },
  ],
};
export default entry;
