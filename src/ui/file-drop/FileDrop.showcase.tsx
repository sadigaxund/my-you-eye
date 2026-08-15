import type { ShowcaseEntry } from "../../showcase/types";
import { FileDrop, fileDropVariants } from ".";

const entry: ShowcaseEntry = {
  title: "FileDrop",
  group: "inputs",
  description: "A drag-and-drop file target with click-to-browse, type/size validation and inline feedback.",
  demos: [
    {
      name: "Default",
      render: () => <div className="flex justify-center"><FileDrop className="max-w-sm" onDrop={(files) => console.log(files)} /></div>,
    },
    {
      name: "Sizes",
      render: () => (
        <div className="flex flex-col items-center gap-4">
          <FileDrop size="sm" className="w-full max-w-sm" onDrop={(files) => console.log(files)} />
          <FileDrop size="md" className="w-full max-w-sm" onDrop={(files) => console.log(files)} />
          <FileDrop size="lg" className="w-full max-w-sm" onDrop={(files) => console.log(files)} />
        </div>
      ),
    },
    {
      name: "States",
      description:
        "dragging / error / success are driven by the component's own drag + validation lifecycle; the exported fileDropVariants pins each one for review.",
      render: () => (
        <div className="flex flex-col items-center gap-4">
          <FileDrop className="w-full max-w-sm" />
          <FileDrop className={`w-full max-w-sm ${fileDropVariants({ state: "dragging" })}`} />
          <FileDrop className={`w-full max-w-sm ${fileDropVariants({ state: "error" })}`} />
          <FileDrop className={`w-full max-w-sm ${fileDropVariants({ state: "success" })}`} />
        </div>
      ),
    },
    {
      name: "Disabled",
      render: () => (
        <div className="flex justify-center">
          <FileDrop disabled className="max-w-sm" onDrop={(files) => console.log(files)} />
        </div>
      ),
    },
    {
      name: "Single image only",
      render: () => (
        <div className="flex justify-center">
        <FileDrop className="max-w-sm" multiple={false} accept="image/*" maxSize={5 * 1024 * 1024} onDrop={(files) => console.log(files)} />
        </div>
      ),
    },
  ],
};
export default entry;
