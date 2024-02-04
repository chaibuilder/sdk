import React, { Suspense, useState } from "react";
import { ChevronRightIcon, FileTextIcon, GearIcon, HomeIcon } from "@radix-ui/react-icons";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui";
import { useProject } from "../hooks/useProject";
import { useCurrentPage } from "../hooks/useCurrentPage.ts";
import { useChangePage } from "../hooks/useChangePage.ts";

const PageDetail = React.lazy(() => import("./single-page-detail"));

const SettingPopover = ({ pageData }: { pageData: any }): React.ReactElement => {
  const [open, setOpen] = useState<"CLOSE" | "OPEN" | "ALERT" | "PENDING">("CLOSE");

  return (
    <Popover
      open={open === "OPEN" || open === "ALERT" || open === "PENDING"}
      onOpenChange={(_open) => {
        setOpen(open === "PENDING" ? "ALERT" : _open ? "OPEN" : "CLOSE");
      }}>
      <PopoverTrigger
        asChild
        onClick={(e) => {
          e.stopPropagation();
          setOpen("OPEN");
        }}>
        <div className="flex items-center justify-between">
          {open === "OPEN" || open === "ALERT" || open === "PENDING" ? (
            <ChevronRightIcon />
          ) : (
            <div className="hidden hover:text-blue-600 group-hover:flex">
              <GearIcon />
            </div>
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent side="right" align="start" alignOffset={-35} className="h-screen w-96">
        <Suspense
          fallback={
            <div className="flex w-full animate-pulse flex-col gap-y-3">
              <div className="bg-background-300 h-6 w-1/2" />
              <div className="bg-background-300 h-20 w-full" />
              <div className="bg-background-300 h-20 w-full" />
            </div>
          }>
          <PageDetail pageData={pageData} open={open} setOpen={setOpen} />
        </Suspense>
      </PopoverContent>
    </Popover>
  );
};

const SinglePage = (page: any) => {
  const [currentPageUuid] = useCurrentPage();
  const { data: projectData } = useProject();
  const changePage = useChangePage();
  const isHomePage = projectData?.homepage === page.uuid;
  const isActivePage = currentPageUuid === page.uuid;

  const handleClick = () => changePage(page);

  if (!projectData) return null;

  return (
    <button
      className={`group relative flex w-full cursor-pointer items-center justify-between px-2.5 py-2 ${
        isActivePage ? "bg-blue-200 " : ""
      }`}
      onClick={handleClick}
      type="button">
      <div className="flex text-sm items-center gap-x-1.5">
        {isHomePage ? <HomeIcon /> : <FileTextIcon />} {page.name}
      </div>
      <SettingPopover pageData={page} />
    </button>
  );
};

const PagesViewer = ({ pages, isLoading }: { isLoading: boolean; pages: any }) => {
  if (isLoading)
    return (
      <div className="flex animate-pulse flex-col gap-y-1 px-2.5 pt-2">
        <div className="bg-background-200 h-7 w-full" />
        <div className="bg-background-200 h-7 w-full" />
        <div className="bg-background-200 h-7 w-full" />
      </div>
    );
  if (pages.length === 0) return <div className="px-2.5 pb-2 pt-4">No pages</div>;
  return <div className="-mb-2">{React.Children.toArray(pages.map((page: any) => <SinglePage {...page} />))}</div>;
};

export default PagesViewer;
