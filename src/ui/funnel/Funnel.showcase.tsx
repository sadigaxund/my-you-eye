import type { ShowcaseEntry } from "../../showcase/types";
import { Funnel } from ".";

const stages = [
  { label: "Visited pricing page", value: 12400 },
  { label: "Started signup", value: 5200 },
  { label: "Verified email", value: 3800 },
  { label: "Completed onboarding", value: 2100 },
];

const twoStage = [
  { label: "Trial started", value: 900 },
  { label: "Converted to paid", value: 210 },
];

const longLabels = [
  { label: "Viewed the enterprise pricing comparison table", value: 4000 },
  { label: "Requested a sales conversation", value: 900 },
  { label: "Signed the annual contract", value: 260 },
];

const entry: ShowcaseEntry = {
  title: "Funnel",
  group: "charts",
  description: "Stage conversion, on the sequential ramp (ordered data, not categorical identity). Stages reveal top-to-bottom as `progress` sweeps 0→1.",
  demos: [
    {
      name: "Four stages",
      render: () => <Funnel stages={stages} title="Signup funnel" />,
    },
    {
      name: "Two stages",
      render: () => <Funnel stages={twoStage} title="Trial conversion" />,
    },
    {
      name: "Long stage labels",
      render: () => <Funnel stages={longLabels} title="Enterprise sales funnel" />,
    },
    {
      name: "Empty",
      render: () => <Funnel stages={[]} title="Signup funnel" />,
    },
    {
      name: "Draw-on progress (50%)",
      render: () => <Funnel stages={stages} progress={0.5} title="Signup funnel" />,
    },
  ],
};
export default entry;
