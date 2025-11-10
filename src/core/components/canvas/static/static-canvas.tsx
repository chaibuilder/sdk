// @ts-nochecks

import { BlockSelectionHighlighter } from "@/core/components/canvas/block-floating-actions";
import { IframeInitialContent } from "@/core/components/canvas/IframeInitialContent";
import { KeyboardHandler } from "@/core/components/canvas/keyboar-handler";
import { AddBlockAtBottom } from "@/core/components/canvas/static/add-block-at-bottom";
import { Canvas } from "@/core/components/canvas/static/chai-canvas";
import { HeadTags } from "@/core/components/canvas/static/head-tags";
import { ResizableCanvasWrapper } from "@/core/components/canvas/static/resizable-canvas-wrapper";
import { StaticBlocksRenderer } from "@/core/components/canvas/static/static-blocks-renderer";
import { useCanvasScale } from "@/core/components/canvas/static/use-canvas-scale";
import { ChaiFrame } from "@/core/frame";
import { useBuilderProp, useCanvasDisplayWidth, useHighlightBlockId } from "@/core/hooks";
import { useCanvasIframe } from "@/core/hooks/use-canvas-iframe";
import { Skeleton } from "@/ui/shadcn/components/ui/skeleton";
import { isEmpty } from "lodash-es";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Provider } from "react-wrap-balancer";
import { useDragAndDrop, useDropIndicator } from "../dnd/drag-and-drop/hooks";
import { CanvasEventsWatcher } from "./canvas-events-watcher";

const StaticCanvas = () => {
  const [width] = useCanvasDisplayWidth();
  const [, highlight] = useHighlightBlockId();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const scale = useCanvasScale(dimension);
  const [, setCanvasIframe] = useCanvasIframe();
  const loadingCanvas = useBuilderProp("loading", false);
  const htmlDir = useBuilderProp("htmlDir", "ltr");
  const { onDragOver, onDrop } = useDragAndDrop();
  const dropIndicator = useDropIndicator();

  const setNewWidth = useCallback(
    (newWidth: number) => {
      setDimension((prev) => ({ ...prev, width: newWidth }));
    },
    [setDimension],
  );

  useEffect(() => {
    if (!wrapperRef.current) return;
    const { clientWidth, clientHeight } = wrapperRef.current as HTMLDivElement;
    setDimension({ width: clientWidth, height: clientHeight });
  }, [wrapperRef, width]);

  const iframeContent: string = useMemo(() => {
    let initialHTML = IframeInitialContent;
    initialHTML = initialHTML.replace("__HTML_DIR__", htmlDir);
    return initialHTML;
  }, [htmlDir]);

  return (
    <ResizableCanvasWrapper onMount={setNewWidth} onResize={setNewWidth}>
      <div
        onMouseLeave={() => setTimeout(() => highlight(""), 300)}
        className="relative mx-auto h-full w-full overflow-hidden"
        onDragOver={onDragOver}
        onDrop={onDrop}
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
          <BlockSelectionHighlighter />
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
            </Canvas>
            <CanvasEventsWatcher />
          </Provider>
          {dropIndicator.isVisible && (
            <div
              id="placeholder"
              className={`pointer-events-none absolute z-[99999] max-w-full transition-all duration-150 ${
                dropIndicator.isEmpty
                  ? "border-2 border-dashed border-green-500 bg-green-500/10"
                  : "rounded-full bg-green-500"
              }`}
              style={{
                top: dropIndicator.top,
                left: dropIndicator.left,
                width: dropIndicator.width,
                height: dropIndicator.height,
              }}
            />
          )}
        </ChaiFrame>
      </div>
    </ResizableCanvasWrapper>
  );
};

export default StaticCanvas;
