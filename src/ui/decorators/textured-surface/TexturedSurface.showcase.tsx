import type { ShowcaseEntry } from "../../../showcase/types";
import { TexturedSurface } from ".";
import { Button } from "../../button";
import { Tuner } from "./Tuner";

const entry: ShowcaseEntry = {
  title: "TexturedSurface",
  group: "decorators",
  demos: [
    {
      name: "Tuner",
      render: () => <Tuner />,
    },
    {
      name: "Paper grain",
      description: "Single TexturedSurface with default paper-grain at medium strength on the surface layer.",
      render: () => (
        <TexturedSurface texture="paper-grain" strength="medium" layer="surface" className="p-4">
          <p className="text-sm text-fg">paper-grain · medium · surface</p>
        </TexturedSurface>
      ),
    },
    {
      name: "Frosted glass",
      description: "Single TexturedSurface with frosted-glass at medium strength on the surface layer.",
      render: () => (
        <TexturedSurface texture="frosted-glass" strength="medium" layer="surface" className="p-4">
          <p className="text-sm text-fg">frosted-glass · medium · surface</p>
        </TexturedSurface>
      ),
    },
    {
      name: "Brushed aluminium",
      description: "Single TexturedSurface with brushed-aluminium at subtle strength on the elevated variant.",
      render: () => (
        <TexturedSurface texture="brushed-aluminium" strength="subtle" variant="elevated" className="p-4">
          <p className="text-sm text-fg">brushed-aluminium · subtle · elevated</p>
        </TexturedSurface>
      ),
    },
    {
      name: "Paper grain — full matrix",
      render: () => <TexturedSurface.ParamTable texture="paper-grain" />,
    },
    {
      name: "Frosted glass — full matrix",
      render: () => <TexturedSurface.ParamTable texture="frosted-glass" />,
    },
    {
      name: "Brushed aluminium — full matrix",
      render: () => <TexturedSurface.ParamTable texture="brushed-aluminium" />,
    },
    {
      name: "Theme-driven",
      render: () => (
        <div className="flex flex-col gap-4">
          <TexturedSurface variant="surface" className="p-4">
            <p className="text-fg">Surface — texture defined by the active theme's tokens.</p>
          </TexturedSurface>
          <TexturedSurface variant="elevated" className="p-4">
            <p className="text-fg">Elevated — same texture with shadow.</p>
          </TexturedSurface>
        </div>
      ),
    },
    {
      name: "Nested inline → theme",
      description: "An inline paper-grain (page layer) surface wrapping a texture=\"theme\" surface (surface layer). The theme child's own texture is now visible — it is no longer zeroed by the outer inline surface's suppression.",
      render: () => (
        <TexturedSurface texture="paper-grain" strength="medium" layer="page" className="p-6">
          <TexturedSurface texture="theme" layer="surface" variant="elevated" className="p-4">
            <p className="text-sm text-fg">theme · surface — nested inside an inline paper-grain page surface</p>
          </TexturedSurface>
        </TexturedSurface>
      ),
    },
    {
      name: "Composed",
      description: "Nested TexturedSurface: page background, surface container, foreground card.",
      render: () => (
        <TexturedSurface texture="paper-grain" strength="medium" layer="page" className="p-6">
          <div className="flex flex-col gap-4">
            <TexturedSurface texture="paper-grain" strength="medium" layer="surface" variant="elevated" className="p-4">
              <TexturedSurface texture="paper-grain" strength="medium" layer="foreground" variant="elevated" className="p-4 max-w-sm">
                <h4 className="text-sm font-semibold text-fg">Note Card</h4>
                <p className="text-xs text-muted mt-1">Card lightest, container medium, page heaviest.</p>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="primary">Action</Button>
                  <Button size="sm" variant="ghost">Cancel</Button>
                </div>
              </TexturedSurface>
            </TexturedSurface>
          </div>
        </TexturedSurface>
      ),
    },
  ],
};
export default entry;
