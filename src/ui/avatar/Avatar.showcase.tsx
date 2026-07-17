import type { ShowcaseEntry } from "../../showcase/types";
import { Avatar } from ".";

function FrameDemo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted capitalize">{size}</span>
          <Avatar size={size} src={`https://http.cat/${size === "sm" ? "200" : size === "md" ? "201" : "202"}`} alt="Cat" fallback="C" />
        </div>
      ))}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "Avatar",
  group: "display",
  demos: [
    {
      name: "Sizes",
      render: () => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" fallback="JD" />
          <Avatar size="md" fallback="JD" />
          <Avatar size="lg" fallback="JD" />
        </div>
      ),
    },
    {
      name: "Fallback variants",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <Avatar size="md" fallback="AB" />
          <Avatar size="md" fallback="MK" />
          <Avatar size="md" fallback="JD" />
        </div>
      ),
    },
    {
      name: "With image",
      render: () => <FrameDemo />,
    },
    {
      name: "With ring",
      render: () => (
        <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-full ring-2 ring-primary ring-offset-2 ring-offset-bg">
            <Avatar size="md" src="https://http.cat/204" alt="Cat" fallback="C" />
          </div>
          <div className="rounded-full ring-2 ring-success ring-offset-2 ring-offset-bg">
            <Avatar size="md" src="https://http.cat/206" alt="Cat" fallback="C" />
          </div>
          <div className="rounded-full ring-2 ring-warning ring-offset-2 ring-offset-bg">
            <Avatar size="md" src="https://http.cat/301" alt="Cat" fallback="C" />
          </div>
        </div>
      ),
    },
    {
      name: "With status dot",
      render: () => (
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative">
            <Avatar size="lg" src="https://http.cat/302" alt="Cat" fallback="C" />
            <span className="absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-bg bg-success" />
          </div>
          <div className="relative">
            <Avatar size="lg" src="https://http.cat/304" alt="Cat" fallback="C" />
            <span className="absolute bottom-0 right-0 size-3 rounded-full ring-2 ring-bg bg-warning" />
          </div>
          <div className="relative">
            <Avatar size="md" fallback="OF" />
            <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-bg bg-danger" />
          </div>
        </div>
      ),
    },
  ],
};
export default entry;
