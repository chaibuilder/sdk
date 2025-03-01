// @ts-nochecks

import { useAtom } from "jotai";
import { first, isEmpty } from "lodash-es";
import { useEffect, useMemo, useRef, useState } from "react";
import { Provider } from "react-wrap-balancer";
import { Skeleton } from "../../../../ui";
import { canvasIframeAtom, networkModeAtom } from "../../../atoms/ui";
import { ChaiFrame } from "../../../frame";
import {
  useBuilderProp,
  useCanvasDisplayWidth,
  useHighlightBlockId,
  useSelectedBlock,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../hooks";
import { ChaiBlock } from "../../../types/ChaiBlock";
import { BlockFloatingSelector } from "../BlockFloatingActions.tsx";
import { IframeInitialContent } from "../IframeInitialContent";
import { KeyboardHandler } from "../KeyboarHandler.tsx";
import { AddBlockAtBottom } from "./AddBlockAtBottom.tsx";
import { Canvas, getElementByDataBlockId } from "./Canvas.tsx";
import { HeadTags } from "./HeadTags.tsx";
import { ResizableCanvasWrapper } from "./ResizableCanvasWrapper.tsx";
import { StaticBlocksRenderer } from "./StaticBlocksRenderer.tsx";
import { useCanvasScale } from "./useCanvasScale";

const getElementByStyleId = (doc: any, styleId: string): HTMLElement =>
  doc.querySelector(`[data-style-id="${styleId}"]`) as HTMLElement;

const StaticCanvas = () => {
  const [networkMode] = useAtom(networkModeAtom);
  const [width] = useCanvasDisplayWidth();
  const [, setIds] = useSelectedBlockIds();
  const selectedBlock: any = useSelectedBlock();
  const [, highlight] = useHighlightBlockId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const scale = useCanvasScale(dimension);
  const [selectedElements, setSelectedElements] = useState<HTMLElement[]>([]);
  const [, setSelectedStyleElements] = useState<HTMLElement[] | null[]>([]);
  const [, setCanvasIframe] = useAtom(canvasIframeAtom);
  const [stylingBlocks, setStylingBlocks] = useSelectedStylingBlocks();
  const loadingCanvas = useBuilderProp("loading", false);
  const htmlDir = useBuilderProp("htmlDir", "ltr");

  const setNewWidth = (newWidth: number) => {
    setDimension((prev) => ({ ...prev, width: newWidth }));
  };

  useEffect(() => {
    if (!wrapperRef.current) return;
    const { clientWidth, clientHeight } = wrapperRef.current as HTMLDivElement;
    setDimension({ width: clientWidth, height: clientHeight });
  }, [wrapperRef, width]);

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
    initialHTML = initialHTML.replace("__HTML_DIR__", htmlDir);
    if (networkMode === "offline") {
      initialHTML = initialHTML.replace("https://chaibuilder.com/offline/tailwind.cdn.js", "/offline/tailwind.cdn.js");
    }
    return initialHTML;
  }, [networkMode, htmlDir]);

  return (
    <ResizableCanvasWrapper onMount={setNewWidth} onResize={setNewWidth}>
      <div
        onClick={() => {
          setIds([]);
          setStylingBlocks([]);
        }}
        onMouseLeave={() => setTimeout(() => highlight(""), 300)}
        className="relative mx-auto h-full w-full overflow-hidden"
        ref={wrapperRef}>
        {/*// @ts-ignore*/}
        <ChaiFrame
          contentDidMount={() => setCanvasIframe(iframeRef.current as HTMLIFrameElement)}
          ref={iframeRef as any}
          id="canvas-iframe"
          style={{ ...scale, ...(isEmpty(scale) ? { width: `${width}px` } : {}) }}
          className="relative mx-auto box-content h-full w-full max-w-full shadow-lg transition-all duration-300 ease-linear"
          initialContent={iframeContent}>
          <KeyboardHandler />
          <BlockFloatingSelector
            block={selectedBlock as unknown as ChaiBlock}
            selectedBlockElement={first(selectedElements)}
          />
          <HeadTags />
          <Provider>
            <Canvas>
              {loadingCanvas ? (
                <div className="h-full p-4">
                  <Skeleton className="h-full" />
                </div>
              ) : (
                <StaticBlocksRenderer />
              )}
              <AddBlockAtBottom />
              <br />
              <br />
              <br />
            </Canvas>
          </Provider>
          <div
            id="placeholder"
            className="pointer-events-none absolute z-[99999] max-w-full bg-green-500 transition-transform"
          />
        </ChaiFrame>
      </div>
    </ResizableCanvasWrapper>
  );
};

export default StaticCanvas;
