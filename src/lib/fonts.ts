export const fontOptions = [
  { value: "sans", label: "Sans (Inter)" },
  { value: "serif", label: "Serif (Georgia)" },
  { value: "mono", label: "Mono (JetBrains)" },
  { value: "ubuntu", label: "Ubuntu" },
  { value: "titillium", label: "Titillium Web" },
  { value: "consolas", label: "Consolas" },
  { value: "jetbrains", label: "JetBrains Nerd" },
  { value: "plus-jakarta", label: "Plus Jakarta Sans" },
  { value: "comic", label: "Comic Sans" },
] as const;

export type FontMode = (typeof fontOptions)[number]["value"];
