/* eslint-disable arrow-body-style */
import React, { Suspense } from "react";
import { filter, get, sortBy } from "lodash-es";
import { usePages } from "../hooks/usePages";
import { useProject } from "../hooks/useProject";

const AddPageModal = React.lazy(() => import("../components/add-page-modal"));
const PagesViewer = React.lazy(() => import("../components/page-viewer"));

const Pages = (): React.ReactElement => {
  const { data: _pages = [], isLoading } = usePages();
  const { data: project } = useProject();
  const pages = sortBy(filter(_pages, { type: "STATIC" }), (page) => (get(page, "uuid") === project?.homepage ? 0 : 1));

  return (
    <>
      <div className="flex items-center justify-between rounded-md bg-background/30 p-1">
        <h1 className="px-1 font-semibold">Pages</h1>
        <Suspense fallback={<div className="text-sm text-blue-500 underline">+ New Page</div>}>
          <AddPageModal />
        </Suspense>
      </div>
      <hr className="-mx-1" />
      <div className="-mx-1 divide-y-2">
        <PagesViewer isLoading={isLoading} pages={pages} />
      </div>
    </>
  );
};

export default Pages;
