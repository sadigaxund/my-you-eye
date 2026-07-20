import { Stagger } from "@lib/motion";

const steps = [
  { label: "Step 1", description: "Initialize the project" },
  { label: "Step 2", description: "Set up the environment" },
  { label: "Step 3", description: "Install dependencies" },
  { label: "Step 4", description: "Configure the build" },
  { label: "Step 5", description: "Write the code" },
  { label: "Step 6", description: "Deploy to production" },
];

export const StaggerDemo = () => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#0f172a",
      fontFamily: "system-ui, sans-serif",
      gap: 24,
    }}
  >
    <Stagger delay={10} staggerDelay={15}>
      {steps.map((step) => (
        <div
          key={step.label}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#38bdf8",
            }}
          >
            {step.label}
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#94a3b8",
            }}
          >
            {step.description}
          </div>
        </div>
      ))}
    </Stagger>
  </div>
);
