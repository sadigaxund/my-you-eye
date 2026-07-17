import type { ShowcaseEntry } from "../../showcase/types";
import { Image } from ".";

const SRC = "https://picsum.photos/seed/uikit/400/300";

const entry: ShowcaseEntry = {
  title: "Image",
  group: "display",
  demos: [
    {
      name: "Fit modes",
      render: () => (
        <div className="flex flex-wrap gap-3">
          {(["cover", "contain", "fill", "none"] as const).map((fit) => (
            <div key={fit} className="flex flex-col gap-1.5 items-center">
              <Image src={SRC} fit={fit} className="size-24 border border-border" />
              <span className="text-xs text-muted">{fit}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Border radius",
      render: () => (
        <div className="flex flex-wrap items-start gap-4">
          {(["none", "sm", "md", "lg", "full"] as const).map((r) => (
            <div key={r} className="flex flex-col gap-1.5 items-center">
              <Image src={SRC} radius={r} className="size-20" />
              <span className="text-xs text-muted">{r}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Aspect ratio",
      render: () => (
        <div className="flex flex-wrap items-start gap-4">
          {(["square", "video", "wide", "tall"] as const).map((a) => (
            <div key={a} className="flex flex-col gap-1.5 items-center">
              <Image src={SRC} aspect={a} className="w-24" />
              <span className="text-xs text-muted">{a}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      name: "Styles",
      render: () => (
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex flex-col gap-1.5 items-center">
            <Image src={SRC} className="size-20" />
            <span className="text-xs text-muted">Default</span>
          </div>
          <div className="flex flex-col gap-1.5 items-center">
            <Image src={SRC} bordered className="size-20" />
            <span className="text-xs text-muted">Bordered</span>
          </div>
          <div className="flex flex-col gap-1.5 items-center">
            <Image src={SRC} shadowed className="size-20" />
            <span className="text-xs text-muted">Shadowed</span>
          </div>
          <div className="flex flex-col gap-1.5 items-center">
            <Image src={SRC} radius="full" bordered shadowed className="size-20" />
            <span className="text-xs text-muted">Full combo</span>
          </div>
        </div>
      ),
    },
    {
      name: "With caption",
      render: () => (
        <div className="flex flex-wrap gap-4">
          <Image src="https://picsum.photos/seed/cap1/300/200" radius="md" caption="A scenic mountain view" className="w-48" />
          <Image src="https://picsum.photos/seed/cap2/300/200" radius="lg" bordered shadowed caption="City skyline at dusk" className="w-48" />
        </div>
      ),
    },
  ],
};
export default entry;
