// The public scene schema. A consuming project imports only from
// `my-you-eye/scenes` and writes one `Video` object — see `video.ts` for
// the contract and what is deliberately missing from it.

export type { Video, VideoMeta, VideoTheme, VideoSize } from "./video";
export { VIDEO_SIZES } from "./video";

export type {
  SceneBase,
  StepBase,
  SceneTransition,
  AccentColor,
  StatusKind,
  NumberFormat,
  LineRange,
  CodeAnnotation,
  DiagramAnnotation,
  PercentPoint,
  PercentRect,
  Beat,
  Pace,
} from "./steps";

export type {
  Scene,
  SceneKind,
  TitleScene,
  BulletScene,
  BulletItem,
  CodeScene,
  CodeStep,
  TerminalScene,
  TerminalStep,
  CompareScene,
  ComparePane,
  WalkthroughScene,
  WalkthroughStep,
  OutroScene,
  OutroLink,
} from "./scenes";

export type {
  DiagramScene,
  DiagramStep,
  DiagramNode,
  DiagramEdge,
  DiagramGroup,
  DiagramPreset,
  DiagramLayout,
  SequenceScene,
  SequenceStep,
  SequenceMessageStep,
  SequenceNoteStep,
  SequenceParticipantSpec,
} from "./scenes.diagram";

export type {
  ChartScene,
  ChartStep,
  ChartSpec,
  StatScene,
  StatItem,
} from "./scenes.data";
