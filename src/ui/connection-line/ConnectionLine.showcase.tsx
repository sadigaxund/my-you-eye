import type { ShowcaseEntry } from "../../showcase/types";
import { ConnectionLine } from ".";
import { Port } from "../port";

function Dot({ x, y, state }: { x: number; y: number; state?: "default" | "connected" | "highlighted" }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)" }}>
      <Port state={state} />
    </div>
  );
}

function Label({ x, y, children }: { x: number; y: number; children: string }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: "translateX(-50%)" }} className="text-xs text-muted">
      {children}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "ConnectionLine",
  group: "canvas",
  demos: [
    {
      name: "Path variants",
      render: () => (
        <div className="relative h-72">
          <ConnectionLine from={{ x: 40, y: 40 }} to={{ x: 260, y: 80 }} variant="bezier" state="connected" />
          <ConnectionLine from={{ x: 40, y: 110 }} to={{ x: 260, y: 150 }} variant="stepped" state="connected" />
          <ConnectionLine from={{ x: 40, y: 185 }} to={{ x: 260, y: 135 }} variant="straight" state="default" />
          <Dot x={40} y={40} state="connected" />
          <Dot x={260} y={80} state="connected" />
          <Dot x={40} y={110} state="connected" />
          <Dot x={260} y={150} state="connected" />
          <Dot x={40} y={185} state="default" />
          <Dot x={260} y={135} state="default" />
          <Label x={40} y={22}>Bezier</Label>
          <Label x={40} y={92}>Stepped</Label>
          <Label x={40} y={167}>Straight</Label>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="relative h-40">
          <ConnectionLine from={{ x: 40, y: 30 }} to={{ x: 260, y: 30 }} state="default" />
          <ConnectionLine from={{ x: 40, y: 65 }} to={{ x: 260, y: 65 }} state="connected" />
          <ConnectionLine from={{ x: 40, y: 100 }} to={{ x: 260, y: 100 }} state="highlighted" />
          <Dot x={40} y={30} state="default" />
          <Dot x={260} y={30} state="default" />
          <Dot x={40} y={65} state="connected" />
          <Dot x={260} y={65} state="connected" />
          <Dot x={40} y={100} state="highlighted" />
          <Dot x={260} y={100} state="highlighted" />
          <Label x={40} y={12}>default</Label>
          <Label x={40} y={47}>connected</Label>
          <Label x={40} y={82}>highlighted</Label>
        </div>
      ),
    },
  ],
};
export default entry;
