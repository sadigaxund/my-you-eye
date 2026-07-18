import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { CodeBlock } from "../ui/code-block";
import type { RegistryDemo } from "./registry";

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
            <div className="border border-border rounded-ui p-panel flex items-center justify-center overflow-visible">
              {demo.render()}
            </div>
          </TabsContent>
          <TabsContent value="code">
            <CodeBlock code={demo.source ?? ""} language="tsx" />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="border border-border rounded-ui p-panel flex items-center justify-center overflow-visible">
          {demo.render()}
        </div>
      )}
    </section>
  );
}
