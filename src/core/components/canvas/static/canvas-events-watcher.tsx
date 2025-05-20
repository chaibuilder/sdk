import { treeRefAtom } from "@/core/atoms/ui";
import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useFrame } from "@/core/frame";
import { useBlockHighlight, useSelectedBlockIds, useSelectedStylingBlocks } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { useAtom } from "jotai";
import { first, isEmpty } from "lodash-es";
import { useEffect } from "react";
import { getElementByDataBlockId } from "./chai-canvas";

export const CanvasEventsWatcher = () => {
  const [, setIds] = useSelectedBlockIds();
  const [styleIds, setSelectedStylingBlocks] = useSelectedStylingBlocks();
  const { document } = useFrame();
  const { clearHighlight } = useBlockHighlight();
  const [ids] = useSelectedBlockIds();
  const [treeRef] = useAtom(treeRefAtom);

  useEffect(() => {
    setTimeout(() => {
      if (!isEmpty(styleIds)) {
        return;
      }
      const element = getElementByDataBlockId(document, first(ids) as string);
      if (element) {
        const styleProp = element.getAttribute("data-style-prop") as string;
        if (styleProp) {
          const styleId = element.getAttribute("data-style-id") as string;
          const blockId = element.getAttribute("data-block-parent") as string;
          setSelectedStylingBlocks([{ id: styleId, prop: styleProp, blockId }]);
        }
      }
    }, 100);
  }, [document, ids, setSelectedStylingBlocks, styleIds]);
  // Add cleanup effect
  useEffect(() => {
    return () => clearHighlight();
  }, [clearHighlight]);

  usePubSub(CHAI_BUILDER_EVENTS.CANVAS_BLOCK_SELECTED, (data) => {
    if (!data) return;
    const { blockId } = data as { blockId: string };
    if (!ids.includes(blockId)) {
      treeRef?.closeAll();
    }
    setIds([blockId]);
  });

  usePubSub(CHAI_BUILDER_EVENTS.CANVAS_BLOCK_STYLE_SELECTED, (data) => {
    if (!data) return;
    const { blockId, styleId, styleProp } = data as { blockId: string; styleId: string; styleProp: string };
    if (!blockId) return;
    if (!ids.includes(blockId)) {
      treeRef?.closeAll();
    }
    setSelectedStylingBlocks([{ id: styleId, prop: styleProp, blockId }]);
    setIds([blockId]);
  });

  usePubSub(CHAI_BUILDER_EVENTS.CLEAR_CANVAS_SELECTION, () => {
    clearHighlight();
    setIds([]);
    setSelectedStylingBlocks([]);
  });

  return null;
};
