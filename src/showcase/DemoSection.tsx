import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CodeBlock } from "../ui/code-block";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import type { TextureName } from "../ui/patterns/textured-surface";
import { cn } from "../lib/cn";
import type { RegistryDemo } from "./registry";

const overflowClass = (v: NonNullable<RegistryDemo["overflow"]>) =>
  v === "auto" ? "overflow-auto" : v === "hidden" ? "overflow-hidden" : "overflow-visible";

export function DemoSection({ demo, texture }: { demo: RegistryDemo; texture: TextureName }) {
  const hasSource = Boolean(demo.source);
  const ov = demo.overflow ?? "visible";

  const renderDemo = () => {
    if (demo.layout === "center") {
      return <div className={cn("flex items-center justify-center", overflowClass(ov))}>{demo.render()}</div>;
    }
    return <div className={overflowClass(ov)}>{demo.render()}</div>;
  };

  return (
    // mb-20 (not the old mb-12): each demo's own name/description sits
    // directly above its own render (mb-3 below), but that same caption is
    // also the first thing after the PREVIOUS demo's rendered box — with
    // too little separation there, a caption reads as belonging to the
    // demo above it instead of the one it's actually describing (owner
    // feedback: "the bottom descriptors are too close to the element").
    // Widening the gap between sections while keeping the caption-to-its-
    // own-demo gap comparatively tight is what makes the pairing
    // unambiguous — proximity communicates the grouping.
    <section className="mb-20">
      <div className="mb-3">
        <h3 className="inline-flex flex-col text-xs uppercase tracking-widest font-semibold text-fg before:content-[''] before:w-full before:h-px before:bg-border before:mb-1.5">
          {demo.name}
        </h3>
        {demo.description && (
          <p className="text-xs text-muted mt-1 max-w-[36ch]">{demo.description}</p>
        )}
      </div>

      {hasSource ? (
        <Tabs defaultValue="preview" variant="filing">
          <TabsList>
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <TabsContent value="preview">{renderDemo()}</TabsContent>
          <TabsContent value="code">
            <CodeBlock code={demo.source ?? ""} language="tsx" wrap={false} />
          </TabsContent>
        </Tabs>
      ) : (
        <TexturedSurface texture={texture} layer="surface" strength="subtle" color="--color-surface-elevated" radius="lg">
          <div className={cn("p-panel", overflowClass(ov))}>
            {renderDemo()}
          </div>
        </TexturedSurface>
      )}
    </section>
  );
}
