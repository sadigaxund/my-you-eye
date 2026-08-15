import type { ShowcaseEntry } from "../../showcase/types";
import { MotionPreview } from "../../showcase/MotionPreview";
import { Morph } from ".";

const entry: ShowcaseEntry = {
  title: "Morph",
  group: "motion",
  description:
    "Lerps position/size/opacity between two caller-supplied snapshots — a simplified FLIP, not shape morphing.",
  demos: [
    {
      name: "Between layout slots",
      description: "The same card content sliding from a small slot to a larger one.",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-32 w-full">
            <div className="absolute left-0 top-0 h-10 w-20 rounded-ui border border-dashed border-border" aria-hidden />
            <div className="absolute bottom-0 right-0 h-14 w-36 rounded-ui border border-dashed border-border" aria-hidden />
            <Morph from={{ x: 0, y: 0, width: 80, height: 40, opacity: 1 }} to={{ x: 200, y: 64, width: 140, height: 56, opacity: 1 }} duration="slow">
              <div className="flex size-full items-center justify-center rounded-ui bg-primary text-sm text-primary-fg">card</div>
            </Morph>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "Cross-fade two elements",
      description: "toChildren swaps the content mid-box — a different element in the same space.",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-16 w-full">
            <Morph
              from={{ x: 0, y: 0, width: 220, height: 48 }}
              to={{ x: 0, y: 0, width: 220, height: 48 }}
              toChildren={
                <div className="flex size-full items-center gap-inline rounded-ui bg-success px-panel text-sm text-success-fg">
                  <span aria-hidden>✓</span> build passed
                </div>
              }
              duration="slow"
            >
              <div className="flex size-full items-center gap-inline rounded-ui bg-secondary px-panel text-sm text-secondary-fg">
                <span aria-hidden>…</span> running build
              </div>
            </Morph>
          </div>
        </MotionPreview>
      ),
    },
    {
      name: "Row expanding into a panel",
      description: "Box grows and its content swaps in one motion — a row becoming its detail view.",
      render: () => (
        <MotionPreview durationInFrames={90} leadIn>
          <div className="relative h-40 w-full">
            <Morph
              from={{ x: 0, y: 0, width: 260, height: 32 }}
              to={{ x: 0, y: 0, width: 260, height: 140 }}
              toChildren={
                <div className="flex size-full flex-col gap-tight rounded-ui bg-surface-elevated p-panel shadow-elevated">
                  <span className="text-sm font-medium text-fg">Invoice #4021</span>
                  <span className="text-xs text-muted">Due Aug 30 · $1,240.00</span>
                  <span className="text-xs text-muted">3 line items</span>
                </div>
              }
              duration="slow"
            >
              <div className="flex size-full items-center justify-between rounded-ui bg-secondary px-panel text-sm text-secondary-fg">
                <span>Invoice #4021</span>
                <span className="text-xs text-muted">$1,240.00</span>
              </div>
            </Morph>
          </div>
        </MotionPreview>
      ),
    },
  ],
};

export default entry;
