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

const W = 300;

const entry: ShowcaseEntry = {
  title: "ConnectionLine",
  group: "canvas",
  demos: [
    {
      name: "Path variants",
      render: () => (
        <div className="flex justify-center">
          <div className="relative" style={{ width: W, height: 288 }}>
            <ConnectionLine from={{ x: 20, y: 40 }} to={{ x: W - 20, y: 80 }} variant="bezier" state="connected" />
            <ConnectionLine from={{ x: 20, y: 110 }} to={{ x: W - 20, y: 150 }} variant="stepped" state="connected" />
            <ConnectionLine from={{ x: 20, y: 185 }} to={{ x: W - 20, y: 135 }} variant="straight" state="default" />
            <Dot x={20} y={40} state="connected" />
            <Dot x={W - 20} y={80} state="connected" />
            <Dot x={20} y={110} state="connected" />
            <Dot x={W - 20} y={150} state="connected" />
            <Dot x={20} y={185} state="default" />
            <Dot x={W - 20} y={135} state="default" />
            <Label x={20} y={22}>Bezier</Label>
            <Label x={20} y={92}>Stepped</Label>
            <Label x={20} y={167}>Straight</Label>
          </div>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="flex justify-center">
          <div className="relative" style={{ width: W, height: 205 }}>
            <ConnectionLine from={{ x: 20, y: 30 }} to={{ x: W - 20, y: 30 }} state="default" />
            <ConnectionLine from={{ x: 20, y: 65 }} to={{ x: W - 20, y: 65 }} state="connected" />
            <ConnectionLine from={{ x: 20, y: 100 }} to={{ x: W - 20, y: 100 }} state="highlighted" />
            <ConnectionLine from={{ x: 20, y: 140 }} to={{ x: W - 20, y: 140 }} state="pending" />
            <Dot x={20} y={30} state="default" />
            <Dot x={W - 20} y={30} state="default" />
            <Dot x={20} y={65} state="connected" />
            <Dot x={W - 20} y={65} state="connected" />
            <Dot x={20} y={100} state="highlighted" />
            <Dot x={W - 20} y={100} state="highlighted" />
            <Dot x={20} y={140} state="default" />
            <Dot x={W - 20} y={140} state="default" />
            <Label x={20} y={12}>default</Label>
            <Label x={20} y={47}>connected</Label>
            <Label x={20} y={82}>highlighted</Label>
            <Label x={20} y={122}>pending</Label>
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
