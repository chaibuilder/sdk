import { useBuilderProp } from "./useBuilderProp.ts";
import { LayoutVariant } from "../constants/LAYOUT_MODE.ts";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

const layoutVariantAtom = atomWithStorage<LayoutVariant>("_layout_variant_mode", "DUAL_SIDE_PANEL");

export const useLayoutVariant = () => {
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const propsLayoutVariant = useBuilderProp("layoutVariant", "DUAL_SIDE_PANEL");
  const variant = layoutVariant || propsLayoutVariant;
  return [variant, setLayoutVariant] as const;
};
