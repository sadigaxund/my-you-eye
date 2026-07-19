import { useState, useCallback, useMemo } from "react";
import type {
  PaperState, FrostedBlurState, FrostedGradState, MetallicState,
  TextureKey, SubMode,
} from "./svg-utils";
import {
  DEFAULT_PAPER, DEFAULT_FROSTED_BLUR, DEFAULT_FROSTED_GRAD, DEFAULT_METALLIC,
  paperSvg, metallicSvg, frostedBlurSvg, frostedGradSvg, dataUri,
} from "./svg-utils";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function Slider({ label, value, min, max, step, onChange, format }: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  return (
    <div className="mb-3">
      <label className="flex justify-between text-xs text-muted mb-1">
        <span>{label}</span>
        <span className="font-mono text-fg">{format ? format(value) : value}</span>
      </label>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(clamp(parseFloat(e.target.value), min, max))}
        className="w-full" />
    </div>
  );
}

function Preview({ bg, uri, tile, opacity }: { bg: string; uri: string; tile: number; opacity: number }) {
  return (
    <div className="flex-1 rounded-ui overflow-hidden relative border border-border">
      <div className="absolute inset-0" style={{ background: bg }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: `url("${uri}")`, backgroundSize: `${tile}px`, opacity, mixBlendMode: "hard-light" }} />
    </div>
  );
}

function generateTsx(texture: string, subMode: string, uri: string, tile: number, opacity: number): string {
  const label = texture === "frosted" ? `frosted (${subMode})` : texture;
  const indent = "  ";
  return `{/* ${label} \u00b7 tile ${tile}px \u00b7 ${Math.round(opacity * 100)}% opacity \u00b7 hard-light */}
<div${indent}
${indent}aria-hidden
${indent}className="absolute inset-0 pointer-events-none"
${indent}style={{
${indent}${indent}backgroundImage: \`url("${uri}")\`,
${indent}${indent}backgroundSize: "${tile}px",
${indent}${indent}opacity: ${opacity},
${indent}${indent}mixBlendMode: "hard-light" as const,
${indent}}}
/>`;
}

export function Tuner() {
  const [tab, setTab] = useState<"preview" | "code">("preview");
  const [activeTexture, setActiveTexture] = useState<TextureKey>("paper");
  const [subMode, setSubMode] = useState<SubMode>("blur");
  const [paper, setPaper] = useState<PaperState>(DEFAULT_PAPER);
  const [frostedBlur, setFrostedBlur] = useState<FrostedBlurState>(DEFAULT_FROSTED_BLUR);
  const [frostedGrad, setFrostedGrad] = useState<FrostedGradState>(DEFAULT_FROSTED_GRAD);
  const [metallic, setMetallic] = useState<MetallicState>(DEFAULT_METALLIC);

  const currentSvg = useMemo(() => {
    switch (activeTexture) {
      case "paper": return paperSvg(paper);
      case "metallic": return metallicSvg(metallic);
      case "frosted": return subMode === "blur" ? frostedBlurSvg(frostedBlur) : frostedGradSvg(frostedGrad);
    }
  }, [activeTexture, subMode, paper, frostedBlur, frostedGrad, metallic]);

  const currentState = useMemo(() => {
    switch (activeTexture) {
      case "paper": return { tile: paper.tile, opacity: paper.opacity };
      case "metallic": return { tile: metallic.tile, opacity: metallic.opacity };
      case "frosted": return subMode === "blur"
        ? { tile: frostedBlur.tile, opacity: frostedBlur.opacity }
        : { tile: frostedGrad.tile, opacity: frostedGrad.opacity };
    }
  }, [activeTexture, subMode, paper, frostedBlur, frostedGrad, metallic]);

  const uri = useMemo(() => dataUri(currentSvg), [currentSvg]);

  const tsxCode = useMemo(() =>
    generateTsx(activeTexture, subMode, uri, currentState.tile, currentState.opacity),
    [activeTexture, subMode, uri, currentState]);

  const updater = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T) =>
    (v: number) => setter(prev => ({ ...prev, [key]: v })),
  []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[320px_1fr] gap-6 items-start max-lg:grid-cols-1">
        <div className="bg-bg border border-border rounded-ui p-4 sticky top-4">
          <div className="flex gap-2 mb-3">
            {(["paper", "frosted", "metallic"] as TextureKey[]).map(k => (
              <button key={k} onClick={() => setActiveTexture(k)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-ui border border-border capitalize
                  ${activeTexture === k ? "bg-fg text-bg" : "bg-bg text-fg"}`}>
                {k}
              </button>
            ))}
          </div>
          {activeTexture === "paper" && <>
            <Slider label="Grain frequency" value={paper.freq} min={0.1} max={2} step={0.01}
              onChange={updater(setPaper, "freq")} format={v => v.toFixed(2)} />
            <Slider label="Octaves" value={paper.octaves} min={1} max={5} step={1}
              onChange={updater(setPaper, "octaves")} />
            <Slider label="Contrast stretch" value={paper.stretch} min={1} max={6} step={0.1}
              onChange={updater(setPaper, "stretch")} format={v => v.toFixed(1)} />
          </>}
          {activeTexture === "metallic" && <>
            <Slider label="Streak freq (along)" value={metallic.freqX} min={0.1} max={1.5} step={0.01}
              onChange={updater(setMetallic, "freqX")} format={v => v.toFixed(2)} />
            <Slider label="Cross-grain freq" value={metallic.freqY} min={0.001} max={0.05} step={0.001}
              onChange={updater(setMetallic, "freqY")} format={v => v.toFixed(3)} />
            <Slider label="Streak angle (°)" value={metallic.angle} min={0} max={180} step={1}
              onChange={updater(setMetallic, "angle")} />
            <Slider label="Octaves" value={metallic.octaves} min={1} max={5} step={1}
              onChange={updater(setMetallic, "octaves")} />
            <Slider label="Contrast stretch" value={metallic.stretch} min={1} max={6} step={0.1}
              onChange={updater(setMetallic, "stretch")} format={v => v.toFixed(1)} />
          </>}
          {activeTexture === "frosted" && <>
            <div className="flex gap-2 mb-3">
              {(["blur", "gradient"] as SubMode[]).map(m => (
                <button key={m} onClick={() => setSubMode(m)}
                  className={`flex-1 px-2 py-1 text-xs rounded-ui border border-border
                    ${subMode === m ? "bg-fg text-bg" : "bg-bg text-fg"}`}>
                  {m === "blur" ? "Noise" : "Gradient"}
                </button>
              ))}
            </div>
            {subMode === "blur" ? <>
              <Slider label="Noise frequency" value={frostedBlur.freq} min={0.003} max={0.05} step={0.001}
                onChange={updater(setFrostedBlur, "freq")} format={v => v.toFixed(3)} />
              <Slider label="Octaves" value={frostedBlur.octaves} min={1} max={4} step={1}
                onChange={updater(setFrostedBlur, "octaves")} />
              <Slider label="Contrast stretch" value={frostedBlur.stretch} min={1} max={6} step={0.1}
                onChange={updater(setFrostedBlur, "stretch")} format={v => v.toFixed(1)} />
            </> : <>
              <Slider label="Feather (%)" value={frostedGrad.feather} min={20} max={90} step={1}
                onChange={updater(setFrostedGrad, "feather")} />
              <Slider label="Blob intensity" value={frostedGrad.blobOpacity} min={0.2} max={1} step={0.05}
                onChange={updater(setFrostedGrad, "blobOpacity")} format={v => v.toFixed(2)} />
            </>}
          </>}
          <hr className="border-border my-3" />
          <Slider label="Tile size (px)" value={currentState.tile} min={60} max={500} step={10}
            onChange={v => {
              switch (activeTexture) {
                case "paper": setPaper(p => ({ ...p, tile: v })); break;
                case "metallic": setMetallic(p => ({ ...p, tile: v })); break;
                case "frosted": {
                  if (subMode === "blur") setFrostedBlur(p => ({ ...p, tile: v }));
                  else setFrostedGrad(p => ({ ...p, tile: v }));
                  break;
                }
              }
            }} />
          <Slider label="Layer opacity" value={currentState.opacity} min={0.03} max={0.7} step={0.01}
            onChange={v => {
              switch (activeTexture) {
                case "paper": setPaper(p => ({ ...p, opacity: v })); break;
                case "metallic": setMetallic(p => ({ ...p, opacity: v })); break;
                case "frosted": {
                  if (subMode === "blur") setFrostedBlur(p => ({ ...p, opacity: v }));
                  else setFrostedGrad(p => ({ ...p, opacity: v }));
                  break;
                }
              }
            }} format={v => v.toFixed(2)} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            {(["preview", "code"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1 text-xs rounded-ui border border-border capitalize
                  ${tab === t ? "bg-fg text-bg" : "bg-bg text-fg"}`}>
                {t}
              </button>
            ))}
          </div>
          {tab === "preview" ? (
            <div className="flex gap-4 flex-1 min-h-[420px]">
              <Preview bg="oklch(0.99 0 0)" uri={uri} tile={currentState.tile} opacity={currentState.opacity} />
              <Preview bg="oklch(0.12 0 0)" uri={uri} tile={currentState.tile} opacity={currentState.opacity} />
            </div>
          ) : (
            <pre className="flex-1 min-h-[420px] font-mono text-xs p-3 bg-bg border border-border rounded-ui overflow-auto whitespace-pre">{tsxCode}</pre>
          )}
        </div>
      </div>
    </div>
  );
}
