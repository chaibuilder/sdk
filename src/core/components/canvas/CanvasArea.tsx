import React, { Suspense } from "react";
import { Skeleton } from "../../../ui";
import StaticCanvas from "./static/StaticCanvas";
import { ErrorBoundary } from "react-error-boundary";
import { Resizable } from "re-resizable";
import { useBuilderProp, useCodeEditor } from "../../hooks";
import { FallbackError } from "../FallbackError.tsx";
import { noop } from "lodash-es";

const CodeEditor = React.lazy(() => import("./static/CodeEditor"));

const CanvasArea: React.FC = () => {
  const [codeEditor] = useCodeEditor();
  const onErrorFn = useBuilderProp("onError", noop);
  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative flex h-full flex-col overflow-hidden bg-gray-100/40 px-2">
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
      </div>
    </div>
  );
};

export default CanvasArea;
