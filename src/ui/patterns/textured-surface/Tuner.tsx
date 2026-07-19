import { useState, useCallback, useMemo } from "react";
import type { TextureKey, SubMode } from "./svg-utils";
import {
  DEFAULT_PAPER, DEFAULT_FROSTED_BLUR, DEFAULT_FROSTED_GRAD, DEFAULT_METALLIC,
} from "./svg-utils";
import { PaperGrain, BrushedAluminium, FrostedGlassNoise, FrostedGlassGradient } from "./texture-factory";
import type { Texture } from "./texture-factory";
import { Preview } from "./Tuner.Preview";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../../select";
import { CodeBlock } from "../../code-block";

const TEXTURE_LABELS: Record<TextureKey, string> = {
  "paper-grain": "Paper Grain",
  "frosted-glass": "Frosted Glass",
  "brushed-aluminium": "Brushed Aluminium",
};

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

function buildCode(texture: Texture, opacity: number): string {
  const pct = Math.round(opacity * 100);
  const expr = texture.codeStyle(opacity);
  return `import { ${texture.constructor.name} } from "./texture-factory";

{/* ${texture.label} · ${texture.tile}px · ${pct}% · hard-light */}
<div
  aria-hidden
  className="absolute inset-0 pointer-events-none"
  style={${expr}}
/>`;
}

export function Tuner() {
  const [mode, setMode] = useState<"preview" | "code">("preview");
  const [activeTexture, setActiveTexture] = useState<TextureKey>("paper-grain");
  const [subMode, setSubMode] = useState<SubMode>("blur");
  const [paper, setPaper] = useState<PaperState>(DEFAULT_PAPER);
  const [frostedBlur, setFrostedBlur] = useState<FrostedBlurState>(DEFAULT_FROSTED_BLUR);
  const [frostedGrad, setFrostedGrad] = useState<FrostedGradState>(DEFAULT_FROSTED_GRAD);
  const [metallic, setMetallic] = useState<MetallicState>(DEFAULT_METALLIC);

  const texture = useMemo<Texture>(() => {
    switch (activeTexture) {
      case "paper-grain": return new PaperGrain(paper);
      case "brushed-aluminium": return new BrushedAluminium(metallic);
      case "frosted-glass": return subMode === "blur" ? new FrostedGlassNoise(frostedBlur) : new FrostedGlassGradient(frostedGrad);
    }
  }, [activeTexture, subMode, paper, frostedBlur, frostedGrad, metallic]);

  const stateOpacity = useMemo(() => {
    switch (activeTexture) {
      case "paper-grain": return paper.opacity;
      case "brushed-aluminium": return metallic.opacity;
      case "frosted-glass": {
        const s = subMode === "blur" ? frostedBlur : frostedGrad;
        return s.opacity;
      }
    }
  }, [activeTexture, subMode, paper, frostedBlur, frostedGrad, metallic]);

  const stateTile = useMemo(() => {
    switch (activeTexture) {
      case "paper-grain": return paper.tile;
      case "brushed-aluminium": return metallic.tile;
      case "frosted-glass": {
        const s = subMode === "blur" ? frostedBlur : frostedGrad;
        return s.tile;
      }
    }
  }, [activeTexture, subMode, paper, frostedBlur, frostedGrad, metallic]);

  const tsxCode = useMemo(() =>
    buildCode(texture, stateOpacity), [texture, stateOpacity]);

  const updater = useCallback(<T,>(setter: React.Dispatch<React.SetStateAction<T>>, key: keyof T) =>
    (v: number) => setter(prev => ({ ...prev, [key]: v })), []);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-[320px_1fr] gap-6 items-start max-lg:grid-cols-1">
        <div className="bg-bg border border-border rounded-ui p-4 sticky top-4 h-[480px] overflow-y-auto min-w-0">
          <div className="mb-3">
            <Select value={activeTexture} onValueChange={v => setActiveTexture(v as TextureKey)}>
              <SelectTrigger size="sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["paper-grain", "frosted-glass", "brushed-aluminium"] as TextureKey[]).map(k => (
                  <SelectItem key={k} value={k}>{TEXTURE_LABELS[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {activeTexture === "paper-grain" && <>
            <Slider label="Grain frequency" value={paper.freq} min={0.1} max={2} step={0.01}
              onChange={updater(setPaper, "freq")} format={v => v.toFixed(2)} />
            <Slider label="Octaves" value={paper.octaves} min={1} max={5} step={1}
              onChange={updater(setPaper, "octaves")} />
            <Slider label="Contrast stretch" value={paper.stretch} min={1} max={6} step={0.1}
              onChange={updater(setPaper, "stretch")} format={v => v.toFixed(1)} />
          </>}
          {activeTexture === "brushed-aluminium" && <>
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
          {activeTexture === "frosted-glass" && <>
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
          <Slider label="Tile size (px)" value={stateTile} min={60} max={500} step={10}
            onChange={v => {
              switch (activeTexture) {
                case "paper-grain": setPaper(p => ({ ...p, tile: v })); break;
                case "brushed-aluminium": setMetallic(p => ({ ...p, tile: v })); break;
                case "frosted-glass": {
                  if (subMode === "blur") setFrostedBlur(p => ({ ...p, tile: v }));
                  else setFrostedGrad(p => ({ ...p, tile: v }));
                  break;
                }
              }
            }} />
          <Slider label="Layer opacity" value={stateOpacity} min={0.03} max={0.7} step={0.01}
            onChange={v => {
              switch (activeTexture) {
                case "paper-grain": setPaper(p => ({ ...p, opacity: v })); break;
                case "brushed-aluminium": setMetallic(p => ({ ...p, opacity: v })); break;
                case "frosted-glass": {
                  if (subMode === "blur") setFrostedBlur(p => ({ ...p, opacity: v }));
                  else setFrostedGrad(p => ({ ...p, opacity: v }));
                  break;
                }
              }
            }} format={v => v.toFixed(2)} />
        </div>
        <div className="flex flex-col gap-3 min-w-0">
          <div className="flex gap-2">
            {(["preview", "code"] as const).map(m => (
              <button key={m} onClick={() => setMode(m)}
                className={`px-3 py-1 text-xs rounded-ui border border-border capitalize
                  ${mode === m ? "bg-fg text-bg" : "bg-bg text-fg"}`}>
                {m}
              </button>
            ))}
          </div>
          {mode === "preview" ? (
            <div className="flex gap-4 h-[440px] min-w-0">
              <Preview bg="oklch(0.99 0 0)" uri={texture.uri} tile={stateTile} opacity={stateOpacity}
                angle={texture instanceof BrushedAluminium ? (texture as BrushedAluminium).angle : 0}
                seamBlend={texture instanceof BrushedAluminium && Math.abs((texture as BrushedAluminium).angle) > 0.5} />
              <Preview bg="oklch(0.12 0 0)" uri={texture.uri} tile={stateTile} opacity={stateOpacity}
                angle={texture instanceof BrushedAluminium ? (texture as BrushedAluminium).angle : 0}
                seamBlend={texture instanceof BrushedAluminium && Math.abs((texture as BrushedAluminium).angle) > 0.5} />
            </div>
          ) : (
            <div className="flex gap-4 h-[440px] min-w-0">
              <div className="flex-1 min-w-0">
                <CodeBlock code={tsxCode} language="tsx" header="Light" className="h-full" wrap={false} />
              </div>
              <div className="flex-1 min-w-0">
                <CodeBlock code={tsxCode} language="tsx" header="Dark" className="h-full" wrap={false} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
