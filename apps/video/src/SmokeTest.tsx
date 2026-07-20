import { Button, Card, CardHeader, CardTitle, CardContent } from "my-you-eye";

export function SmokeTest() {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg)",
        fontFamily: "sans-serif",
      }}
    >
      <Card variant="elevated" style={{ maxWidth: 420 }}>
        <CardHeader>
          <CardTitle>Remotion PoC</CardTitle>
        </CardHeader>
        <CardContent>
          <p style={{ marginBottom: 16, color: "var(--color-muted)", fontSize: 14 }}>
            Static components render correctly inside Remotion compositions.
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
