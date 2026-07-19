import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CodeBlock } from "../ui/code-block";
import type { RegistryDemo } from "./registry";

export function DemoSection({ demo }: { demo: RegistryDemo }) {
  const hasSource = Boolean(demo.source);

  const renderDemo = () => {
    if (demo.layout === "center") {
      return <div className="flex items-center justify-center overflow-visible">{demo.render()}</div>;
    }
    return <div className="overflow-visible">{demo.render()}</div>;
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
        <div className="border border-border rounded-ui bg-surface-elevated p-panel overflow-visible">
          {renderDemo()}
        </div>
      )}
    </section>
  );
}
