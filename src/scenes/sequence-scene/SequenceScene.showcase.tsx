import type { ReactNode } from "react";
import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { PinnedFrame } from "../../showcase/PinnedFrame";
import { buildSequence } from "../../motion/core";
import { SequenceScene } from ".";
import { sceneSteps, sceneDuration } from "../timing";
import type { SequenceScene as SequenceSceneData } from "../schema";

const FPS = 30;

const scene: SequenceSceneData = {
  kind: "sequence",
  title: "Checkout flow",
  participants: [
    { id: "client", label: "Client" },
    { id: "api", label: "API" },
    { id: "db", label: "DB" },
  ],
  messages: [
    { type: "message", say: "The client submits the order.", from: "client", to: "api", label: "POST /orders" },
    { type: "message", say: "The API validates it against the database.", from: "api", to: "db", label: "SELECT" },
    { type: "message", say: "The database returns the row.", from: "db", to: "api", label: "row", kind: "data" },
    { type: "note", say: "Inventory is reserved here.", on: ["api"], text: "Reserve inventory" },
    { type: "message", say: "The API confirms the order.", from: "api", to: "client", label: "200 OK", kind: "data" },
  ],
};

const ranges = buildSequence(sceneSteps(scene), FPS, scene.pace);
const total = sceneDuration(scene, FPS);
const step2 = ranges["step-2"];

function Frame({ children }: { children: ReactNode }) {
  return <div className="aspect-video w-full overflow-hidden rounded-ui border border-border">{children}</div>;
}

const entry: ShowcaseEntry = {
  title: "SequenceScene",
  group: "scenes",
  description: "Wraps SequenceDiagram, one message or note per step. Activation bars are derived, never authored.",
  demos: [
    {
      name: "Playing",
      render: () => (
        <MotionPreview durationInFrames={total} fps={FPS}>
          <Frame><SequenceScene scene={scene} /></Frame>
        </MotionPreview>
      ),
    },
    {
      name: `Pinned mid-message, step 3 (frame ${step2.endFrame + 3}/${total})`,
      description: "api→db and db→api are settled, the note is up, and the api→client reply is drawing in.",
      render: () => (
        <PinnedFrame frame={step2.endFrame + 3} durationInFrames={total}>
          <Frame><SequenceScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
    {
      name: `Pinned at rest (frame ${total}/${total})`,
      description: "Everything is drawn: api has two activation bars (split by its own call to db), db has one.",
      render: () => (
        <PinnedFrame frame={total} durationInFrames={total}>
          <Frame><SequenceScene scene={scene} /></Frame>
        </PinnedFrame>
      ),
    },
  ],
};
export default entry;
