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

const entry: ShowcaseEntry = {
  title: "ConnectionLine",
  group: "canvas",
  demos: [
    {
      name: "Path variants",
      render: () => (
        <div className="relative h-56 border border-border rounded-ui">
          <ConnectionLine from={{ x: 40, y: 40 }} to={{ x: 260, y: 40 }} variant="bezier" state="connected" />
          <ConnectionLine from={{ x: 40, y: 80 }} to={{ x: 260, y: 80 }} variant="stepped" state="connected" />
          <ConnectionLine from={{ x: 40, y: 120 }} to={{ x: 260, y: 120 }} variant="straight" state="default" />
          <Dot x={40} y={40} state="connected" />
          <Dot x={260} y={40} state="connected" />
          <Dot x={40} y={80} state="connected" />
          <Dot x={260} y={80} state="connected" />
          <Dot x={40} y={120} state="default" />
          <Dot x={260} y={120} state="default" />
          <div className="absolute left-12 top-[26px] text-xs text-muted">Bezier</div>
          <div className="absolute left-12 top-[66px] text-xs text-muted">Stepped</div>
          <div className="absolute left-12 top-[106px] text-xs text-muted">Straight</div>
        </div>
      ),
    },
    {
      name: "States",
      render: () => (
        <div className="relative h-36 border border-border rounded-ui">
          <ConnectionLine from={{ x: 40, y: 30 }} to={{ x: 260, y: 30 }} state="default" />
          <ConnectionLine from={{ x: 40, y: 65 }} to={{ x: 260, y: 65 }} state="connected" />
          <ConnectionLine from={{ x: 40, y: 100 }} to={{ x: 260, y: 100 }} state="highlighted" />
          <Dot x={40} y={30} state="default" />
          <Dot x={260} y={30} state="default" />
          <Dot x={40} y={65} state="connected" />
          <Dot x={260} y={65} state="connected" />
          <Dot x={40} y={100} state="highlighted" />
          <Dot x={260} y={100} state="highlighted" />
          <div className="absolute left-12 top-[18px] text-xs text-muted">default</div>
          <div className="absolute left-12 top-[53px] text-xs text-muted">connected</div>
          <div className="absolute left-12 top-[88px] text-xs text-muted">highlighted</div>
        </div>
      ),
    },
  ],
};
export default entry;
