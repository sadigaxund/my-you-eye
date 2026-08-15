import type { ShowcaseEntry } from "../../showcase/types";
import { DeviceFrame } from ".";

function FakeContent({ label }: { label: string }) {
  return (
    <div className="flex h-40 items-center justify-center bg-secondary/20 text-sm text-muted">
      {label}
    </div>
  );
}

const entry: ShowcaseEntry = {
  title: "DeviceFrame",
  group: "display",
  description: "Browser, window or phone chrome around arbitrary children, for putting UI on screen without a real screen recording.",
  demos: [
    {
      name: "Browser",
      render: () => (
        <div className="max-w-md mx-auto">
          <DeviceFrame variant="browser" url="https://example.com/dashboard">
            <FakeContent label="Page content" />
          </DeviceFrame>
        </div>
      ),
    },
    {
      name: "Window",
      render: () => (
        <div className="max-w-md mx-auto">
          <DeviceFrame variant="window" title="Settings — MyApp">
            <FakeContent label="Window content" />
          </DeviceFrame>
        </div>
      ),
    },
    {
      name: "Phone",
      render: () => (
        <div className="max-w-64 mx-auto">
          <DeviceFrame variant="phone">
            <div className="flex h-72 items-center justify-center bg-secondary/20 text-sm text-muted">
              App screen
            </div>
          </DeviceFrame>
        </div>
      ),
    },
  ],
};
export default entry;
