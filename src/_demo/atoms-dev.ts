import { DesignTokens } from "@/types/types";
import { atomWithStorage } from "jotai/utils";

export const lsBlocksAtom = atomWithStorage("chai-builder-blocks", []);
export const lsThemeAtom = atomWithStorage("chai-builder-theme", {});
export const lsDesignTokensAtom = atomWithStorage<DesignTokens>("chai-builder-design-tokens", {
  ["btn"]: {
    name: "Button",
    value:
      "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  },
  ["btn-primary"]: {
    name: "Button-Primary",
    value: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
  },
  ["btn-secondary"]: {
    name: "Button-Secondary",
    value: "bg-secondary text-secondary-foreground shadow hover:bg-secondary/90",
  },
  ["btn-destructive"]: {
    name: "Button-Destructive",
    value: "bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
  },
  ["btn-outline"]: {
    name: "Button-Outline",
    value: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
  },
  ["btn-ghost"]: {
    name: "Button-Ghost",
    value: "hover:bg-accent hover:text-accent-foreground",
  },
  ["btn-link"]: {
    name: "Button-Link",
    value: "text-primary underline-offset-4 hover:underline",
  },
  ["card"]: {
    name: "Card",
    value: "rounded-xl border bg-card text-card-foreground shadow",
  },
  ["heading-1"]: {
    name: "Heading-1",
    value: "text-3xl font-bold tracking-tighter xl:text-4xl 2xl:text-5xl",
  },
  ["heading-2"]: {
    name: "Heading-2",
    value: "text-2xl font-bold tracking-tighter xl:text-3xl 2xl:text-4xl",
  },
  ["heading-3"]: {
    name: "Heading-3",
    value: "text-xl font-bold tracking-tighter xl:text-2xl 2xl:text-3xl",
  },
  ["heading-4"]: {
    name: "Heading-4",
    value: "text-lg font-bold tracking-tighter xl:text-xl 2xl:text-2xl",
  },
  ["heading-5"]: {
    name: "Heading-5",
    value: "text-base font-bold tracking-tighter xl:text-lg 2xl:text-xl",
  },
  ["heading-6"]: {
    name: "Heading-6",
    value: "text-sm font-bold tracking-tighter xl:text-base 2xl:text-lg",
  },
});
export const lsAiContextAtom = atomWithStorage("chai-builder-ai-context", "");
