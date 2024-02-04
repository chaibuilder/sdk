import React, { Suspense, useEffect, useRef } from "react";
import { isEmpty, isEqual } from "lodash";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../..//ui";
import { useProject } from "../hooks/useProject";
import { useUpdateProject } from "../mutations/useProjectActions";

const ProjectGeneralSetting = React.lazy(() => import("../components/project-general-setting"));
const ProjectSeoSettings = React.lazy(() => import("../components/project-seo-setting"));

const SuspenseLoader = (
  <div className="px-3">
    <div className="h-52 w-full animate-pulse rounded-md bg-gray-100" />
  </div>
);

const withEmptySeoData = (projectData: any): any => {
  if (projectData && isEmpty(projectData.seoData)) {
    return {
      ...projectData,
      seoData: { title: "", description: "", image: "" },
    };
  }
  return projectData;
};

export default function ProjectSettings() {
  const updateProject = useUpdateProject();
  const { data: projectData } = useProject();
  const [_projectData, seany] = React.useState(
    projectData ? withEmptySeoData(projectData) : withEmptySeoData({} as any),
  );
  const dateRef = useRef(_projectData);

  useEffect(
    () => () => {
      if (!isEqual(projectData, dateRef.current)) {
        updateProject.mutate(dateRef.current, {
          onSuccess: () => seany(dateRef.current),
        });
      }
    },
    [dateRef],
  );

  useEffect(() => {
    dateRef.current = _projectData;
  }, [_projectData]);

  return (
    <>
      <div className="flex items-center justify-between rounded-md bg-background/30 p-1">
        <h1 className="px-1 font-semibold">Website Settings</h1>
      </div>
      <hr className="-mx-1" />
      <div className="-mx-1">
        <Accordion type="single" className="w-full" defaultValue="GENERAL">
          <AccordionItem value="GENERAL" className="border-b-2 border-slate-100 dark:border-slate-800">
            <AccordionTrigger className="bg-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-100 hover:no-underline dark:bg-slate-900 dark:hover:bg-slate-800">
              General Settings
            </AccordionTrigger>
            <AccordionContent className="px-2 pt-4 text-sm">
              <Suspense fallback={SuspenseLoader}>
                <ProjectGeneralSetting _projectData={_projectData} seany={seany} />
              </Suspense>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="SEO" className="border-b-2 border-slate-100 dark:border-slate-800">
            <AccordionTrigger className="bg-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-100 hover:no-underline dark:bg-slate-900 dark:hover:bg-slate-800">
              SEO Settings
            </AccordionTrigger>
            <AccordionContent className="px-1 pt-4 text-sm">
              <Suspense fallback={SuspenseLoader}>
                <ProjectSeoSettings _projectData={_projectData} seany={seany} />
              </Suspense>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}
