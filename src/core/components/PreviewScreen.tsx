import React, { Suspense } from "react";
import { useBuilderProp, usePreviewMode } from "../hooks";
import { Button, Skeleton } from "../../ui";
import { cn } from "../lib.ts";

export const PreviewScreen = () => {
  const [isPreviewOn, setPreviewMode] = usePreviewMode();
  const previewComponent = useBuilderProp("previewComponent");
  return (
    <div className={cn("fixed inset-0 z-[999] bg-background", isPreviewOn ? "block" : "hidden")}>
      <Button size="sm" className="absolute right-0 top-0 m-4" onClick={() => setPreviewMode(false)}>
        Close Preview
      </Button>
      <div>
        {previewComponent ? (
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>{React.createElement(previewComponent)}</Suspense>
        ) : null}
      </div>
    </div>
  );
};
