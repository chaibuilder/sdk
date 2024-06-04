import React, { Suspense } from "react";
import { CanvasTopBar } from "./topbar/CanvasTopBar";
import { Skeleton } from "../../../ui";
import { StaticCanvas } from "./static/StaticCanvas";
import { ErrorBoundary } from "../ErrorBoundary";

const CanvasArea: React.FC = () => {
  return (
    <div className="flex h-full w-full flex-col">
      <CanvasTopBar />
      <div className="relative h-full overflow-hidden bg-slate-800/90 bg-[linear-gradient(to_right,#222_0.5px,transparent_0.5px),linear-gradient(to_bottom,#222_0.5px,transparent_0.5px)] bg-[size:12px_12px] px-2">
        <Suspense fallback={<Skeleton className="h-full" />}>
          <ErrorBoundary>
            <StaticCanvas />
          </ErrorBoundary>
        </Suspense>
      </div>
    </div>
  );
};

export default CanvasArea;
