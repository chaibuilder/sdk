import { useAtom } from "jotai";
import { canvasIframeAtom } from "../atoms/ui";

//module-level variable to track the last highlighted block
let lastHighlighted: HTMLElement | null = null;

export const useBlockHighlight = () => {
  const [iframe] = useAtom<HTMLIFrameElement>(canvasIframeAtom);

  const highlightBlock = (blockId: string) => {
    const innerDoc = iframe.contentDocument || iframe.contentWindow?.document;
    // Remove highlight from previous block
    if (lastHighlighted) {
      lastHighlighted.removeAttribute("data-highlighted");
    }
    // Find and highlight new block
    const chaiBlock = innerDoc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
    if (chaiBlock) {
      chaiBlock.setAttribute("data-highlighted", "true");
      lastHighlighted = chaiBlock;
    } else {
      lastHighlighted = null;
    }
  };

  const clearHighlight = () => {
    if (lastHighlighted) {
      lastHighlighted.removeAttribute("data-highlighted");
      lastHighlighted = null;
    }
  };

  return { highlightBlock, clearHighlight, lastHighlighted };
};
