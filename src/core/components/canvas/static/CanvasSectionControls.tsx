import { filter, map } from "lodash-es";
import { ChevronDown, ChevronUp, Menu, Plus, Trash, X } from "lucide-react";
import {
  useBlockHighlight,
  useBlocksStore,
  useBlocksStoreUndoableActions,
  useBuilderProp,
  useRemoveBlocks,
} from "../../../hooks";
import { useEffect } from "react";
import { useState } from "react";
import { isNumber, trimEnd, trimStart } from "lodash";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../../../ui";
import { CHAI_BUILDER_EVENTS, emitChaiBuilderMsg } from "../../../events";

// * Getting iframe zoom value from scale
const getZoomFromScale = (scale) => {
  try {
    const transform = scale?.transform || "scale(1)";
    const scaleValue = trimStart(trimEnd(transform, ")"), "scale(") || "1";
    return parseFloat(scaleValue) || 1;
  } catch (error) {
    return 1;
  }
};

// * Section controller menu position calculation
const useCanvasSectionControl = ({ scale, dimension, iframeRef }) => {
  const showCanvasSectionControls = useBuilderProp("showCanvasSectionControls", true);
  const [blocks] = useBlocksStore();
  const [pos, setPos] = useState({ x: -24, y: 0 });
  const rootBlocks = filter(blocks, (block) => !block?._parent);

  const zoom = getZoomFromScale(scale);
  const canvas = iframeRef?.current?.contentWindow?.document?.querySelector('[data-block-id="canvas"]');

  // * This effect listens for scroll events within the iframe content window and updates y position state.
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = iframeRef?.current?.contentWindow?.document?.documentElement?.scrollTop || 0;
      setPos((prev) => ({ ...prev, y: scrollY }));
    };

    const contentWindow = iframeRef?.current?.contentWindow;
    contentWindow?.addEventListener("scroll", handleScroll);
    return () => {
      contentWindow?.removeEventListener("scroll", handleScroll);
    };
  }, [iframeRef, rootBlocks]);

  // * This effect calculates and sets the x position of the canvas section controls based on the wrapper width, iframe width, and zoom scale.
  useEffect(() => {
    setTimeout(() => {
      if (!isNumber(iframeRef?.current?.clientWidth) || !isNumber(dimension?.width)) return;
      const wrapperWidth = dimension?.width;
      const frameWidth = iframeRef?.current?.clientWidth * zoom;
      const posX = Math.abs(wrapperWidth - frameWidth) / 2;
      setPos((prev) => ({ ...prev, x: posX - 24 }));
    }, 1000);
    return () => setPos((prev) => ({ ...prev, x: null }));
  }, [dimension, scale, iframeRef]);

  const canShow = canvas && isNumber(pos.x) && isNumber(pos.y) && showCanvasSectionControls;

  return {
    zoom,
    canvas,
    rootBlocks,
    posX: canShow ? pos.x : 0,
    posY: canShow ? pos.y * zoom : 0,
    showControl: canShow,
  };
};

const SectionControllerMenuContent = ({
  id,
  index,
  isFirstSection,
  isLastSection,
}: {
  id: string;
  index: number;
  isFirstSection: boolean;
  isLastSection: boolean;
}) => {
  const { moveBlocks } = useBlocksStoreUndoableActions();
  const removeBlock = useRemoveBlocks();

  const moveSectionUp = () => {
    if (isFirstSection) return;
    moveBlocks([id], null, index - 1);
  };

  const moveSectionDown = () => {
    if (isLastSection) return;
    moveBlocks([id], null, index + 1);
  };

  const removeSection = () => {
    removeBlock([id]);
  };

  const addNewSectionBelow = () => {
    emitChaiBuilderMsg({ name: CHAI_BUILDER_EVENTS.OPEN_ADD_BLOCK, data: { position: index + 1 } });
  };

  return (
    <div className="flex flex-col space-y-1">
      <button
        onClick={moveSectionUp}
        disabled={isFirstSection}
        className={`rounded-full p-1 text-white ${isFirstSection ? "cursor-not-allowed bg-gray-300" : "bg-blue-500 duration-300 hover:bg-blue-700"}`}>
        <ChevronUp className="h-3 w-3 stroke-[3]" />
      </button>
      <button
        onClick={moveSectionDown}
        disabled={isLastSection}
        className={`rounded-full p-1 text-white ${isLastSection ? "cursor-not-allowed bg-gray-300" : "bg-blue-500 duration-300 hover:bg-blue-700"}`}>
        <ChevronDown className="h-3 w-3 stroke-[3]" />
      </button>
      <button
        onClick={removeSection}
        className={`rounded-full p-1 text-white ${false ? "cursor-not-allowed bg-gray-300" : "bg-blue-500 duration-300 hover:bg-blue-700"}`}>
        <Trash className="h-3 w-3 stroke-[3]" />
      </button>
      <button
        onClick={addNewSectionBelow}
        className={`rounded-full p-1 text-white ${false ? "cursor-not-allowed bg-gray-300" : "bg-blue-500 duration-300 hover:bg-blue-700"}`}>
        <Plus className="h-3 w-3 stroke-[3]" />
      </button>
    </div>
  );
};

const SectionControllerMenuButton = (props) => {
  const { highlightBlock, clearHighlight } = useBlockHighlight();
  const { id } = props;
  return (
    <div className="flex h-full items-center justify-center">
      <Tooltip delayDuration={100} onOpenChange={(open) => (open ? highlightBlock(id) : clearHighlight())}>
        <TooltipTrigger>
          <div className="rounded-full bg-black/40 p-1 text-white duration-300 hover:bg-black/60">
            <Menu className="h-2.5 w-2.5 stroke-[3]" />
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="m-0 bg-transparent p-0">
          <SectionControllerMenuContent {...props} />
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

/**
 *
 * @param param
 * @returns
 * @description
 * This function is responsible for rendering the canvas section controls,
 * including buttons for moving sections up and down, removing sections, and adding new sections.
 * It also handles the display of section controller menu buttons for each section.
 */
export const CanvasSectionControls = ({ scale, dimension, iframeRef }) => {
  const { rootBlocks, zoom, posX, posY, showControl } = useCanvasSectionControl({ scale, dimension, iframeRef });
  if (!showControl) return;

  return (
    <div className="absolute" style={{ transform: `translateY(${-posY}px) translateX(${posX}px)` }}>
      {map(rootBlocks, (block, index) => {
        const id = block?._id;
        const blockNode = iframeRef?.current?.contentWindow?.document?.querySelector(`[data-block-id="${id}"]`);
        if (!blockNode) return null;

        const blockHeight = blockNode.getBoundingClientRect().height;

        return (
          <div key={id} style={{ height: blockHeight * zoom }}>
            <SectionControllerMenuButton
              id={id}
              index={index}
              isFirstSection={index === 0}
              isLastSection={index + 1 === rootBlocks?.length}
            />
          </div>
        );
      })}
    </div>
  );
};
