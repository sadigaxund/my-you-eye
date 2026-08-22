import { Fragment, useRef } from "react";
import type { ReactNode } from "react";
import { cn } from "../../lib/cn";
import { ResizeHandle } from "./SplitPane.ResizeHandle";
import { resizePair, MIN_FRACTION } from "./SplitPane.fractions";

export interface SplitLeaf {
  type: "leaf";
  id: string;
  /** Opaque consumer payload handed back to renderLeaf. */
  data?: unknown;
}

export interface SplitBranch {
  type: "branch";
  id: string;
  direction: "row" | "column";
  /** Parallel fractions, one per child, summing to ~1. Children share the
   *  space LEFT OVER by the fixed-width dividers, so fractions are exact
   *  ratios rather than absolute pixels. */
  sizes: number[];
  children: SplitNode[];
}

export type SplitNode = SplitLeaf | SplitBranch;

// No ref forwarded, deliberately (AGENTS.md §2.3's domain-props exception,
// same family rationale as the charts): a tree whose root may be a consumer-
// rendered leaf has no single "the element" for a ref to land on. Size the
// pane from outside via className on branch roots / your own leaf wrapper.
export interface SplitPaneProps {
  node: SplitNode;
  renderLeaf: (leaf: SplitLeaf) => ReactNode;
  onResize: (branchId: string, sizes: number[]) => void;
  onEqualize?: (branchId: string) => void;
  /** Applied to every BRANCH root (leaves are consumer-rendered). Size the
   *  pane from outside (e.g. h-full w-full). */
  className?: string;
}

interface Ctx {
  renderLeaf: (leaf: SplitLeaf) => ReactNode;
  onResize: (branchId: string, sizes: number[]) => void;
  onEqualize?: (branchId: string) => void;
  className?: string;
}

function NodeView({ node, ctx }: { node: SplitNode; ctx: Ctx }): ReactNode {
  if (node.type === "leaf") return ctx.renderLeaf(node);
  return <BranchView node={node} ctx={ctx} />;
}

// A branch renders as nested flex row/column with a draggable divider
// between every pair of siblings (#8). Divider drags adjust the two
// adjacent fractions with both sides clamped to MIN_FRACTION; keyboard
// arrows on a handle nudge ±8/32px and double-click equalizes.
function BranchView({ node, ctx }: { node: SplitBranch; ctx: Ctx }) {
  const ref = useRef<HTMLDivElement | null>(null);

  const drag = (i: number) => (deltaPx: number) => {
    const el = ref.current;
    if (!el) return;
    const size = node.direction === "row" ? el.clientWidth : el.clientHeight;
    if (size <= 0) return;
    const next = resizePair(node.sizes, i, deltaPx / size);
    if (next) ctx.onResize(node.id, next);
  };

  return (
    <div
      ref={ref}
      data-branch-id={node.id}
      className={cn("flex min-h-0 min-w-0", node.direction === "row" ? "flex-row" : "flex-col", ctx.className)}
    >
      {node.children.map((child, i) => (
        <Fragment key={child.id}>
          {i > 0 && (
            <ResizeHandle
              direction={node.direction}
              aria-label={`Resize panes ${i} and ${i + 1}`}
              onDrag={drag(i - 1)}
              onDoubleClick={() =>
                ctx.onEqualize
                  ? ctx.onEqualize(node.id)
                  : ctx.onResize(
                      node.id,
                      node.children.map(() => 1 / node.children.length),
                    )
              }
            />
          )}
          {/* flexGrow carries the fraction; flexBasis 0 makes sibling sizes
              exact ratios of the post-divider remainder. */}
          <div
            style={{ flexGrow: Math.max(node.sizes[i], MIN_FRACTION), flexBasis: 0 }}
            className="relative flex min-h-0 min-w-0"
          >
            <NodeView node={child} ctx={ctx} />
          </div>
        </Fragment>
      ))}
    </div>
  );
}

export function SplitPane(props: SplitPaneProps) {
  return <NodeView node={props.node} ctx={props} />;
}
SplitPane.displayName = "SplitPane";
