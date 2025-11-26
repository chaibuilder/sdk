import { cn } from "@/core/functions/common-functions";
import { useBuilderProp, usePreviewMode } from "@/core/hooks";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Skeleton } from "@/ui/shadcn/components/ui/skeleton";
import { EyeClosedIcon } from "@radix-ui/react-icons";
import React, { Suspense } from "react";
import { useTranslation } from "react-i18next";

export const PreviewScreen = () => {
  const [isPreviewOn, setPreviewMode] = usePreviewMode();
  const { t } = useTranslation();
  const previewComponent = useBuilderProp("previewComponent", null);
  if (!isPreviewOn) return null;
  return (
    <div className={cn("bg-background fixed inset-0 z-[999]", isPreviewOn ? "block" : "hidden")}>
      <Button size="sm" className="absolute top-0 right-0 m-4 space-x-2" onClick={() => setPreviewMode(false)}>
        <EyeClosedIcon />
        <span>{t("Close Preview")}</span>
      </Button>
      <div>
        {previewComponent ? (
          <Suspense fallback={<Skeleton className="h-96 w-full" />}>{React.createElement(previewComponent)}</Suspense>
        ) : null}
      </div>
    </div>
  );
};
