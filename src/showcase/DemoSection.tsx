import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CodeBlock } from "../ui/code-block";
import { TexturedSurface } from "../ui/decorators/textured-surface";
import { cn } from "../lib/cn";
import type { RegistryDemo } from "./registry";
import type { ShowcaseTexture } from "./types";

const overflowClass = (v: NonNullable<RegistryDemo["overflow"]>) =>
  v === "auto" ? "overflow-auto" : v === "hidden" ? "overflow-hidden" : "overflow-visible";

export function DemoSection({ demo, texture }: { demo: RegistryDemo; texture: ShowcaseTexture }) {
  const hasSource = Boolean(demo.source);
  const ov = demo.overflow ?? "visible";

  const renderDemo = () => {
    if (demo.layout === "center") {
      return <div className={cn("flex items-center justify-center", overflowClass(ov))}>{demo.render()}</div>;
    }
    return <div className={overflowClass(ov)}>{demo.render()}</div>;
  };

  return (
    <section className="mb-12">
      <div className="mb-2">
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
