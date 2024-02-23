// @ts-nochecks

import React, { useEffect, useMemo, useRef, useState } from "react";
import { first, isEmpty } from "lodash";
import { useAtom } from "jotai";
import {
  useBuilderProp,
  useCanvasWidth,
  useHighlightBlockId,
  usePreviewMode,
  useSelectedBlock,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../hooks";
import { IframeInitialContent } from "../IframeInitialContent";
import { canvasIframeAtom, networkModeAtom } from "../../../atoms/ui";
import { useCanvasScale } from "./useCanvasScale";
import { Canvas, getElementByDataBlockId } from "./Canvas.tsx";
import { ChaiFrame } from "../../../frame";
import { KeyboardHandler } from "../KeyboarHandler.tsx";
import { BlockActionsStatic } from "../BlockFloatingActions.tsx";
import { HeadTags } from "./HeadTags.tsx";
import { Skeleton } from "../../../../ui";
import { ChaiBlock } from "../../../types/ChaiBlock";
import { StaticBlocksRenderer } from "./StaticBlocksRenderer.tsx"; // const FrameComponent = Frame.default;

// const FrameComponent = Frame.default;

const getElementByStyleId = (doc: any, styleId: string): HTMLElement =>
  doc.querySelector(`[data-style-id="${styleId}"]`) as HTMLElement;

const StaticCanvas = (): React.JSX.Element => {
  const [networkMode] = useAtom(networkModeAtom);
  const [preview] = usePreviewMode();
  const [width] = useCanvasWidth();
  const [, setIds] = useSelectedBlockIds();
  const selectedBlock: any = useSelectedBlock();
  const [, highlight] = useHighlightBlockId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const scale = useCanvasScale(dimension);
  const [initialWidth, setInitialWidth] = useState(0);
  const [selectedElements, setSelectedElements] = useState<HTMLElement[]>([]);
  const [, setSelectedStyleElements] = useState<HTMLElement[] | null[]>([]);
  const [, setCanvasIframe] = useAtom(canvasIframeAtom);
  const [stylingBlocks, setStylingBlocks] = useSelectedStylingBlocks();
  const loadingCanvas = useBuilderProp("loadingCanvas", false);

  useEffect(() => {
    const { clientWidth, clientHeight } = wrapperRef.current as HTMLDivElement;
    setDimension({ width: clientWidth, height: clientHeight });
    if (initialWidth === 0) {
      setInitialWidth(clientWidth);
    }
  }, [wrapperRef, width, initialWidth]);

  const isInViewport = (element: HTMLElement, offset = 0) => {
    const { top } = element.getBoundingClientRect();
    return top + offset >= 0 && top - offset <= window.innerHeight;
  };

  useEffect(() => {
    if (selectedBlock && selectedBlock.type !== "Multiple" && iframeRef.current) {
      const blockElement = getElementByDataBlockId(iframeRef.current.contentDocument, selectedBlock._id);
      if (blockElement) {
        if (!isInViewport(blockElement)) {
          iframeRef.current?.contentWindow?.scrollTo({ top: blockElement.offsetTop, behavior: "smooth" });
        }
        setSelectedElements([blockElement]);
      }
    }
  }, [selectedBlock]);

  useEffect(() => {
    if (!isEmpty(stylingBlocks) && iframeRef.current) {
      const selectedStyleElement = getElementByStyleId(
        iframeRef.current.contentDocument,
        (first(stylingBlocks) as { id: string }).id,
      );
      if (selectedStyleElement) {
        setSelectedStyleElements([selectedStyleElement]);
      } else {
        setSelectedStyleElements([null]);
      }
    } else {
      setSelectedStyleElements([null]);
    }
  }, [stylingBlocks]);

  const iframeContent: string = useMemo(() => {
    let initialHTML = IframeInitialContent;
    if (networkMode === "offline") {
      initialHTML = initialHTML.replace(
        "https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio",
        "/offline/tailwind.cdn.js",
      );
      initialHTML = initialHTML.replace("https://unpkg.com/aos@next/dist/aos.css", "/offline/aos.css");
      initialHTML = initialHTML.replace("https://unpkg.com/aos@next/dist/aos.js", "/offline/aos.js");
    }
    return initialHTML;
  }, [networkMode]);

  return (
    <div
      onClick={() => {
        setIds([]);
        setStylingBlocks([]);
      }}
      onMouseLeave={() => setTimeout(() => highlight(""), 300)}
      className="relative mx-auto h-full w-full bg-black/80"
      style={initialWidth > 0 && !isEmpty(scale) ? { width: preview ? "100%" : initialWidth } : {}}
      ref={wrapperRef}>
      {/*// @ts-ignore*/}
      <ChaiFrame
        contentDidMount={() => setCanvasIframe(iframeRef.current as HTMLIFrameElement)}
        ref={iframeRef as any}
        id="canvas-iframe"
        style={{ width: `${width}px`, ...scale }}
        className="relative mx-auto box-content h-full max-w-full shadow-md transition-all duration-300 ease-linear"
        initialContent={iframeContent}>
        <KeyboardHandler />
        <BlockActionsStatic
          block={selectedBlock as unknown as ChaiBlock}
          selectedBlockElement={first(selectedElements)}
        />
        <HeadTags model="page" />
        <Canvas>
          {loadingCanvas ? (
            <div className="h-full p-4">
              <Skeleton className="h-full" />
            </div>
          ) : (
            <StaticBlocksRenderer />
          )}
          <div className="h-60"></div>
        </Canvas>
      </ChaiFrame>
    </div>
  );
};

export { StaticCanvas };
