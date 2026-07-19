import { TexturedSurface as TexturedSurfaceBase, texturedSurfaceVariants } from "./TexturedSurface";
import { ParamTable } from "./ParamTable";

export const TexturedSurface = Object.assign(TexturedSurfaceBase, { ParamTable });
export type { TexturedSurfaceProps } from "./TexturedSurface";
export { texturedSurfaceVariants };
