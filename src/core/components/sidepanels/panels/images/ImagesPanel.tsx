import React, { Suspense, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../ui";
import { useBuilderProp } from "../../../../hooks";
import clsx from "clsx";

const UnsplashImages = React.lazy(() => import("./UnsplashImages"));
const UploadImages = React.lazy(() => import("./UploadImages"));

const ImagesPanel = ({
  isModalView = false,
  onSelect = () => {},
}: {
  isModalView?: boolean;
  onSelect?: (url: string) => void;
}): React.JSX.Element => {
  const [tab, setTab] = useState("upload");

  const uploadImageCallback = useBuilderProp("uploadMediaCallback");
  const unsplashImageCallback = useBuilderProp("unsplashAccessKey");

  const missingUploadImageCallback = uploadImageCallback === undefined;
  const missingUnslashImageCallback = unsplashImageCallback === undefined;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between rounded-md bg-background/30 p-1">
        <h1 className="px-1 font-semibold">{isModalView ? "Select or upload images" : "Images"}</h1>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="flex h-full w-full flex-col py-2">
        <TabsList className="w-full">
          <TabsTrigger
            value="upload"
            className={clsx(missingUploadImageCallback && "pointer-events-none opacity-50", "w-1/2")}>
            Upload
          </TabsTrigger>
          <TabsTrigger
            value="unsplash"
            className={clsx(missingUnslashImageCallback && "pointer-events-none opacity-50", "w-1/2")}>
            Unsplash
          </TabsTrigger>
        </TabsList>
        {tab === "unsplash" ? (
          <TabsContent value="unsplash" className="flex h-full flex-col overflow-hidden">
            <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-100" />}>
              <UnsplashImages isModalView={isModalView} onSelect={onSelect} />
            </Suspense>
          </TabsContent>
        ) : (
          <TabsContent value="upload" className="flex h-full flex-col overflow-hidden">
            <Suspense fallback={<div className="h-64 w-full animate-pulse bg-gray-100" />}>
              <UploadImages isModalView={isModalView} onSelect={onSelect} />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ImagesPanel;
