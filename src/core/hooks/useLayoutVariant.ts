import { useBuilderProp } from "./useBuilderProp.ts";
import { LAYOUT_VARIANTS, LayoutVariant } from "../constants/LAYOUT_VARIANTS.ts";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

const layoutVariantAtom = atomWithStorage<LayoutVariant>("__layout_variant", LAYOUT_VARIANTS.SINGLE_SIDE_PANEL);

export const useLayoutVariant = () => {
  const [layoutVariant, setLayoutVariant] = useAtom(layoutVariantAtom);
  const propsLayoutVariant = useBuilderProp("layoutVariant", LAYOUT_VARIANTS.SINGLE_SIDE_PANEL);
  const variant = layoutVariant || propsLayoutVariant;
  return [variant, setLayoutVariant] as const;
};
