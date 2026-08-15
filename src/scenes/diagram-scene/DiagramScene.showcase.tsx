import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { buildSequence } from "../../motion/core";
import { DiagramScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { DiagramScene as DiagramSceneData } from "../schema";

const FPS = 30;

const archScene: DiagramSceneData = {
  kind: "diagram",
  preset: "architecture",
  title: "Request path",
  nodes: [
    { id: "client", label: "Client", sublabel: "browser" },
    { id: "api", label: "api", sublabel: "gateway", status: "success", accent: "primary", group: "vpc" },
    { id: "queue", label: "queue", metric: "1.2k/s", status: "success", group: "vpc" },
    { id: "worker", label: "worker", sublabel: "×3", accent: "success", group: "vpc" },
    { id: "db", label: "db", sublabel: "postgres", status: "success", group: "vpc" },
  ],
  edges: [
    { from: "client", to: "api", label: "HTTPS" },
    { from: "api", to: "queue", label: "enqueue" },
    { from: "queue", to: "worker" },
    { from: "worker", to: "db", kind: "data", label: "write" },
  ],
  groups: [{ id: "vpc", label: "VPC · us-east-1" }],
  steps: [
    { say: "A client calls into the API gateway.", reveal: ["client", "api"], connect: ["client->api"] },
    { say: "The gateway enqueues work behind it, inside the VPC.", reveal: ["vpc", "queue"], connect: ["api->queue"] },
    { say: "Workers pick jobs off the queue and write to the database.", reveal: ["worker", "db"], connect: ["queue->worker", "worker->db"], flow: ["queue->worker"] },
    { say: "Here's the whole path end to end — focus on the hot loop.", focus: ["api", "queue", "worker"] },
    { say: "The gateway is rate-limited.", annotate: [{ target: "api", text: "Rate-limited at 500 rps", side: "top" }] },
  ],
};

const stateScene: DiagramSceneData = {
  kind: "diagram",
  preset: "state",
  title: "Fetch state machine",
  nodes: [
    { id: "idle", label: "idle" },
    { id: "loading", label: "loading" },
    { id: "success", label: "success" },
    { id: "error", label: "error" },
  ],
  edges: [
    { from: "idle", to: "loading", label: "fetch" },
    { from: "loading", to: "success", label: "200" },
    { from: "loading", to: "error", kind: "error", label: "5xx" },
    { from: "error", to: "idle", label: "retry" },
  ],
  steps: [
    { say: "Idle waits for a fetch to start.", reveal: ["idle"] },
    { say: "Fetching moves us to loading.", reveal: ["loading"], connect: ["idle->loading"] },
    { say: "A 200 response lands in success; a 5xx lands in error.", reveal: ["success", "error"], connect: ["loading->success", "loading->error"] },
    { say: "An error retries back to idle.", connect: ["error->idle"] },
  ],
};

const dataflowScene: DiagramSceneData = {
  kind: "diagram",
  preset: "dataflow",
  title: "Event pipeline",
  nodes: [
    { id: "producer", label: "producer" },
    { id: "topic", label: "topic", sublabel: "events" },
    { id: "consumer", label: "consumer" },
  ],
  edges: [
    { from: "producer", to: "topic" },
    { from: "topic", to: "consumer" },
  ],
  steps: [
    { say: "Events stream continuously from producer to consumer.", reveal: ["producer", "topic", "consumer"], connect: ["producer->topic", "topic->consumer"], flow: ["producer->topic", "topic->consumer"] },
  ],
};

const archRanges = buildSequence(sceneSteps(archScene), FPS, archScene.pace);
const archTotal = sceneDuration(archScene, FPS);
const stateTotal = sceneDuration(stateScene, FPS);
const dataflowTotal = sceneDuration(dataflowScene, FPS);

const step0 = archRanges["step-0"];
const step1 = archRanges["step-1"];
const step2 = archRanges["step-2"];
const step3 = archRanges["step-3"];
const step4 = archRanges["step-4"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "DiagramScene",
  group: "scenes",
  description: "Canvas, GraphGroups, GraphNodes and a ConnectionLayer, revealed step by step from diagram data.",
  demos: [
    {
      name: "Architecture — playing",
      render: () => (
        <MotionPreview durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-connect, step 0 (frame ${step0.startFrame + 3}/${archTotal})`,
      description: "client and api are revealed; their edge is partway drawn, so no arrowhead or label yet.",
      render: () => (
        <PinnedFrame frame={step0.startFrame + 3} durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with the VPC group revealed, step 1 end (frame ${step1.endFrame - 1}/${archTotal})`,
      description: "The VPC region — computed from its member nodes' bounds — and the queue node are settled.",
      render: () => (
        <PinnedFrame frame={step1.endFrame - 1} durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with flow tokens in transit, step 2 (frame ${step2.startFrame + Math.round((step2.endFrame - step2.startFrame) / 2)}/${archTotal})`,
      description: "worker and db are revealed, both new edges drawing, two Trace tokens crossing queue→worker.",
      render: () => (
        <PinnedFrame frame={step2.startFrame + Math.round((step2.endFrame - step2.startFrame) / 2)} durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with a focus spotlight, step 3 (frame ${step3.endFrame - 1}/${archTotal})`,
      description: "api, queue and worker stay at full opacity; client, db and the VPC group dim to opacity-dim.",
      render: () => (
        <PinnedFrame frame={step3.endFrame - 1} durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned with an Annotation callout, step 4 (frame ${step4.endFrame - 1}/${archTotal})`,
      description: "A leader line points at the api node, rendered inside Canvas's layer so it pans and zooms with it.",
      render: () => (
        <PinnedFrame frame={step4.endFrame - 1} durationInFrames={archTotal} fps={FPS}>
          <Frame><DiagramScene scene={archScene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: "State machine (\"state\" preset)",
      render: () => (
        <MotionPreview durationInFrames={stateTotal} fps={FPS}>
          <Frame><DiagramScene scene={stateScene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: "Dataflow (\"dataflow\" preset)",
      render: () => (
        <MotionPreview durationInFrames={dataflowTotal} fps={FPS}>
          <Frame><DiagramScene scene={dataflowScene} /></Frame>
        </MotionPreview>
      ),
    },
  ],
};
export default entry;
