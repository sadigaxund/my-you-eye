// Chrome overlay for the whole composition — progress bar, chapter ticks,
// persistent watermark (TODO.md Phase G "Chrome"), all driven by
// `VideoMeta.progressBar` / `.chapters` / `.watermark`. Reads the absolute
// composition frame directly via `useCurrentFrame()` because it is mounted
// as a sibling of `<TransitionSeries>`, not inside any scene's own
// `<TransitionSeries.Sequence>` — every scene's `SceneRenderer` sees frame 0
// as ITS OWN start (that's what lets a scene component not know it's inside
// a video at all), but chrome that spans the whole video needs the raw
// composition frame instead. That's the same "read the driver's own top
// level" pattern `RemotionDriver` uses, just at the video level rather than
// the scene level — `VideoRoot.tsx` is the only importer of this file.
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import type { Video } from "../scenes";
import { computeChapters, computeVideoDuration } from "./VideoRoot.duration";

export interface VideoChromeProps {
  video: Video;
  fps: number;
}

export function VideoChrome({ video, fps }: VideoChromeProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const meta = video.meta ?? {};
  const showProgress = meta.progressBar ?? true;
  // Chapter ticks render on top of the progress bar, so they're only
  // meaningful (and only rendered) when the bar itself is shown.
  const showChapters = showProgress && (meta.chapters ?? true);
  const total = durationInFrames || computeVideoDuration(video, fps);
  const pct = total > 0 ? (frame / total) * 100 : 0;
  const chapters = showChapters ? computeChapters(video, fps) : [];

  if (!showProgress && !meta.watermark) return null;

  return (
    <>
      {showProgress && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0">
          <div className="relative">
            <Progress value={pct} />
            {chapters.map((chapter) => (
              <span
                key={chapter.sceneIndex}
                className="absolute top-0 h-full w-px bg-bg/60"
                style={{ left: `${total > 0 ? (chapter.startFrame / total) * 100 : 0}%` }}
              />
            ))}
          </div>
        </div>
      )}
      {meta.watermark && (
        <div className="pointer-events-none absolute bottom-panel right-panel">
          <Badge variant="neutral">{meta.watermark}</Badge>
        </div>
      )}
    </>
  );
}
