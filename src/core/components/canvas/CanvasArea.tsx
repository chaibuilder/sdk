import React, { Suspense } from "react";
import { CanvasTopBar } from "./topbar/CanvasTopBar";
import { Skeleton } from "../../../ui";
import { StaticCanvas } from "./static/StaticCanvas";
import { ErrorBoundary } from "../ErrorBoundary";
import { Resizable } from "re-resizable";
import { useCodeEditor } from "../../hooks";

const CodeEditor = React.lazy(() => import("./static/CodeEditor"));

const CanvasArea: React.FC = () => {
  const [codeEditor] = useCodeEditor();
  return (
    <div className="flex h-full w-full flex-col">
      <CanvasTopBar />
      <div className="relative flex h-full flex-col overflow-hidden bg-slate-800/90 bg-[linear-gradient(to_right,#222_0.5px,transparent_0.5px),linear-gradient(to_bottom,#222_0.5px,transparent_0.5px)] bg-[size:12px_12px] px-2">
        <Suspense fallback={<Skeleton className="h-full" />}>
          <ErrorBoundary>
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
