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
        <div className="relative h-72">
          <ConnectionLine from={{ x: 40, y: 35 }} to={{ x: 260, y: 75 }} variant="bezier" state="connected" />
          <ConnectionLine from={{ x: 40, y: 105 }} to={{ x: 260, y: 145 }} variant="stepped" state="connected" />
          <ConnectionLine from={{ x: 40, y: 180 }} to={{ x: 260, y: 130 }} variant="straight" state="default" />
          <Dot x={40} y={35} state="connected" />
          <Dot x={260} y={75} state="connected" />
          <Dot x={40} y={105} state="connected" />
          <Dot x={260} y={145} state="connected" />
          <Dot x={40} y={180} state="default" />
          <Dot x={260} y={130} state="default" />
          <div className="absolute left-3 top-[18px] text-xs text-muted">Bezier</div>
          <div className="absolute left-3 top-[90px] text-xs text-muted">Stepped</div>
          <div className="absolute left-3 top-[162px] text-xs text-muted">Straight</div>
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
          <div className="absolute left-3 top-[18px] text-xs text-muted">default</div>
          <div className="absolute left-3 top-[53px] text-xs text-muted">connected</div>
          <div className="absolute left-3 top-[88px] text-xs text-muted">highlighted</div>
        </div>
      ),
    },
  ],
};
export default entry;
