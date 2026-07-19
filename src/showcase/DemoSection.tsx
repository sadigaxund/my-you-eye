import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CodeBlock } from "../ui/code-block";
import { TexturedSurface } from "../ui/patterns/textured-surface";
import type { RegistryDemo } from "./registry";

function PreviewContainer({ layout, children }: { layout?: "fill" | "center"; children: React.ReactNode }) {
  const inner = layout === "center"
    ? <div className="flex items-center justify-center overflow-visible">{children}</div>
    : <div className="overflow-visible">{children}</div>;
  return (
    <TexturedSurface texture="theme" layer="surface" variant="elevated" className="border border-border rounded-ui p-panel overflow-visible">
      {inner}
    </TexturedSurface>
  );
}

export function DemoSection({ demo }: { demo: RegistryDemo }) {
  const hasSource = Boolean(demo.source);

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-inline mb-3">
        <div>
          <h3 className="text-sm font-medium text-fg">{demo.name}</h3>
          {demo.description && (
            <p className="text-sm text-muted mt-1">{demo.description}</p>
          )}
        </div>
      </div>

      {hasSource ? (
        <Tabs defaultValue="preview">
          <TabsList variant="pills" className="mb-3">
            <TabsTrigger variant="pills" value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger variant="pills" value="code">
              Code
            </TabsTrigger>
          </TabsList>
          <TabsContent value="preview">
            <PreviewContainer layout={demo.layout}>
              {demo.render()}
            </PreviewContainer>
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock code={demo.source ?? ""} language="tsx" wrap={false} />
          </TabsContent>
        </Tabs>
      ) : (
        <PreviewContainer layout={demo.layout}>
          {demo.render()}
        </PreviewContainer>
      )}
    </section>
  );
}
