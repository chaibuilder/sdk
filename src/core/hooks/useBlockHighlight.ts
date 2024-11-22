//module-level variable to track the last highlighted block

import { useAtom } from "jotai";
import { canvasIframeAtom } from "../atoms/ui";
import { useMemo } from "react";

//module-level variable to track the last highlighted block
let lastHighlighted: HTMLElement | null = null;

export const useBlockHighlight = () => {
  const [iframe] = useAtom<HTMLIFrameElement>(canvasIframeAtom);
  const innerDoc = useMemo(() => iframe?.contentDocument || iframe?.contentWindow?.document, [iframe]);
  const highlightBlock = (elementOrID: HTMLElement | string) => {
    // Remove highlight from previous block
    if (lastHighlighted) {
      lastHighlighted.removeAttribute("data-highlighted");
    }
    // Find and highlight new bloc
    if (typeof elementOrID !== "string") {
      elementOrID.setAttribute("data-highlighted", "true");
      lastHighlighted = elementOrID;
    } else if (typeof elementOrID === "string") {
      const element = innerDoc.querySelector(`[data-block-id="${elementOrID}"]`) as HTMLElement;
      if (element) {
        element.setAttribute("data-highlighted", "true");
        lastHighlighted = element;
      }
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
