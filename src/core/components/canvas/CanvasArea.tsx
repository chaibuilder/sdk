import React, { lazy, Suspense } from "react";
import { CanvasTopBar } from "./topbar/CanvasTopBar";
import { useAtom } from "jotai";
import { addBlocksModalAtom } from "../../atoms/blocks";
import { Skeleton } from "../../../ui";
import { StaticCanvas } from "./static/StaticCanvas";
import { ErrorBoundary } from "../ErrorBoundary";

const AddBlocksPanel = lazy(() => import("../sidepanels/panels/add-blocks/AddBlocks"));

const CanvasArea: React.FC = () => {
  const [addBlocks, setAddBlocks] = useAtom(addBlocksModalAtom);

  return (
    <div className="flex h-full w-full flex-col">
      <CanvasTopBar />
      <div className="relative h-full overflow-hidden bg-slate-800/90 px-2 bg-[linear-gradient(to_right,#222_0.5px,transparent_0.5px),linear-gradient(to_bottom,#222_0.5px,transparent_0.5px)] bg-[size:12px_12px]">
        <Suspense fallback={<Skeleton className="h-full" />}>
          <ErrorBoundary>
            <StaticCanvas />
          </ErrorBoundary>
        </Suspense>
        {addBlocks ? (
          <div
            onClick={() => setAddBlocks(false)}
            className={"absolute inset-0 z-50 flex items-center bg-black/30 backdrop-blur-sm"}>
            <div
              onClick={(e) => e.stopPropagation()}
              className="mx-auto h-[90%] w-[90%] max-w-3xl rounded-md bg-white p-4 shadow-lg shadow-black/10 xl:w-[65%]">
              <AddBlocksPanel />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CanvasArea;
