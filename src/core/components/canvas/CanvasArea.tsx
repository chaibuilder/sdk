import { noop } from "lodash-es";
import { Resizable } from "re-resizable";
import React, { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Skeleton } from "../../../ui";
import { useBuilderProp, useCodeEditor } from "../../hooks";
import { useKeyEventWatcher } from "../../hooks/useKeyEventWatcher.ts";
import { FallbackError } from "../FallbackError.tsx";
import { Breadcrumb } from "./Breadcrumb.tsx";
import StaticCanvas from "./static/StaticCanvas";

const CodeEditor = React.lazy(() => import("./static/CodeEditor"));

const CanvasArea: React.FC = () => {
  const [codeEditor] = useCodeEditor();
  const onErrorFn = useBuilderProp("onError", noop);
  useKeyEventWatcher();

  return (
    <div className="flex h-full max-h-full w-full flex-1 flex-col">
      <div className="relative flex h-full max-h-full flex-col overflow-hidden bg-gray-100/40 px-2">
        <Suspense fallback={<Skeleton className="h-full" />}>
          <ErrorBoundary fallback={<FallbackError />} onError={onErrorFn}>
            <StaticCanvas />
          </ErrorBoundary>
        </Suspense>
        {codeEditor ? (
          <Suspense fallback={<Skeleton className="h-full" />}>
            <Resizable enable={{ top: true, bottom: false }} className="max-h-[400px] min-h-[200px]">
              <CodeEditor />
            </Resizable>
          </Suspense>
        ) : null}
        <Breadcrumb />
      </div>
    </div>
  );
};

export default CanvasArea;
