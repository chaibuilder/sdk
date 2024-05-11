import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui";
import { capitalize, filter, find, get, isEmpty, map, sortBy } from "lodash-es";
import { toast } from "sonner";
import { useEffect } from "react";
import { useProject } from "../hooks/useProject";
import { usePages } from "../hooks/usePages";
import { useCurrentPage } from "../hooks/useCurrentPage.ts";
import { useSavePage } from "../../core/hooks";
import { useChangePage } from "../hooks/useChangePage.ts";
import { BriefcaseIcon } from "lucide-react";

const CurrentPage = () => {
  const { data: project } = useProject();
  const { data: _pages, isLoading } = usePages();
  const { syncState } = useSavePage();
  const changeCurrentPage = useChangePage();
  const [currentPageUuid, setCurrentPageUuid] = useCurrentPage();
  const pages = sortBy(filter(_pages, { type: "STATIC" }), (page) => (get(page, "uuid") === project?.homepage ? 0 : 1));

  useEffect(() => {
    // * Setting homepage if saved is not in pages list
    if (!isEmpty(_pages) && project.homepage && !find(_pages, { uuid: currentPageUuid })) {
      setCurrentPageUuid(project.homepage);
    }
  }, [currentPageUuid, _pages, project, setCurrentPageUuid]);

  useEffect(() => {
    return () => setCurrentPageUuid(null);
  }, [setCurrentPageUuid]);

  const changePage = (newPage: string) => {
    if (syncState !== "SAVED") {
      toast.error("You have unsaved changes. Please save before changing the page.");
    } else {
      const newPageDetail = find(pages, { uuid: newPage });
      changeCurrentPage(newPageDetail);
    }
  };

  if (isLoading || isEmpty(currentPageUuid)) return null;

  return (
    <nav
      className="flex rounded-lg border border-gray-200 bg-gray-50 px-3 pr-0 py-1 text-gray-700 dark:border-gray-700 dark:bg-gray-800"
      aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li className="inline-flex items-center">
          <div className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400">
            <BriefcaseIcon className="w-4 h-4 mr-2" />
            {capitalize(project.name)}
          </div>
        </li>

        <li aria-current="page">
          <div className="flex items-center">
            <svg
              className="mx-1 h-3 w-3 text-gray-400"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 6 10">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 9 4-4-4-4"
              />
            </svg>
            <Select value={currentPageUuid || ""} onValueChange={changePage}>
              <SelectTrigger className="h-max border-0 py-0 text-sm font-medium text-gray-600 shadow-none outline-none ring-0 focus:ring-0 dark:text-gray-400">
                <SelectValue placeholder="Page" />
              </SelectTrigger>
              <SelectContent className="z-[999]">
                {map(pages, (page) => (
                  <SelectItem key={page.uuid} value={page.uuid}>
                    {page?.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </li>
      </ol>
    </nav>
  );
};

export default CurrentPage;
