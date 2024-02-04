import React, { useEffect, useState } from "react";
import { isEmpty, isEqual, isString, kebabCase, omit } from "lodash";
import { HomeIcon } from "@radix-ui/react-icons";
import { Button, ScrollArea } from "../../ui";
import { Checkbox, Image, Model, MultilineText, SingleLineText } from "@chaibuilder/blocks";
import { toast } from "sonner";
import { Form } from "./form";
import { useQueryClient } from "@tanstack/react-query";
import { useProject } from "../hooks/useProject";
import { useUpdateProject } from "../mutations/useProjectActions";
import { useUpdatePage } from "../mutations/usePageActions.ts";

const DeletePage = React.lazy(() => import("./delete-page-modal"));
const ConfirmAlert = React.lazy(() => import("./confirm-alert"));

const isValidDynamicSlug = (slug: string) => {
  if (!isString(slug)) return false;
  const basicMatch = slug.includes("/[") && slug.includes("]");
  if (!basicMatch) return false;

  const DYNAMIC_ID_REGX = /^\[((?:\.{3})?[a-zA-Z0-9_-]+)\]$/;
  const CONSTANT_PATH_REGX = /^[a-zA-Z0-9_-]+$/;
  let isValidSlug: boolean = true;

  slug.split("/").forEach((_slug) => {
    if (!isValidSlug) return;
    if (_slug.includes("[[") && _slug.includes("]]")) {
      isValidSlug = /^\[\[\.{3}[a-zA-Z0-9_-]+\]\]$/.test(_slug);
    } else if (_slug.includes("[") && _slug.includes("]")) {
      isValidSlug = DYNAMIC_ID_REGX.test(_slug);
    } else {
      isValidSlug = CONSTANT_PATH_REGX.test(_slug);
    }
  });

  return isValidSlug;
};

const withEmptySeoData = (pageData: any): any => {
  if (pageData && isEmpty(pageData.seoData)) {
    return {
      ...pageData,
      seoData: { title: "", description: "", image: "" },
    };
  }
  return pageData;
};

const isSomethingChanged = (_pageData: any, pageData: any): boolean => {
  const isChangeInBasicInfo = !isEqual(omit(_pageData, ["seoData"]), omit(pageData, ["seoData"]));
  const isChangeInSeoDetail = !isEqual(withEmptySeoData(pageData).seoData, withEmptySeoData(_pageData).seoData);
  return isChangeInBasicInfo || isChangeInSeoDetail;
};

const PageDetail = ({ open, setOpen, pageData }: { open: string; pageData: any; setOpen: any }): React.ReactElement => {
  const queryClient = useQueryClient();
  const { data: projectData }: any = useProject();
  const updatePage = useUpdatePage();
  const updateProject = useUpdateProject("Homepage updated successfully.");
  const [_pageData, _seany] = useState(withEmptySeoData(pageData));
  const [_projectData, setProjectData] = useState({
    isHomePage: projectData?.homepage === pageData.uuid,
  });
  const isAnyChangeInPage = isSomethingChanged(_pageData, pageData);

  useEffect(() => {
    const isPageDataChange = !isEqual(withEmptySeoData(pageData), _pageData);
    const isProjectDataChange = projectData?.homepage !== pageData.uuid && _projectData.isHomePage;
    setOpen(isPageDataChange || isProjectDataChange ? "PENDING" : "OPEN");
  }, [projectData, pageData, _pageData, _projectData, setOpen]);

  const handleSubmit = () => {
    if (isAnyChangeInPage) {
      if (pageData.type === "DYNAMIC" && !isValidDynamicSlug(_pageData?.slug || "")) {
        if (open === "ALERT") setOpen("PENDING");
        return;
      }
      updatePage.mutate(_pageData as any, {
        onSuccess: () => {
          queryClient.invalidateQueries({
            refetchType: "active",
            queryKey: ["pages", projectData?.uuid],
          });
          setOpen("CLOSE");
          toast.success("Page updated successfully.");
        },
      });
    }
    if (_projectData.isHomePage && projectData?.homepage !== pageData.uuid) {
      updateProject.mutate({ ...projectData!, homepage: pageData?.uuid }, { onSuccess: () => setOpen("CLOSE") });
    }
  };

  const updatePageRealtime = ({ formData }: any, key?: string): void => {
    _seany((currentData: any) => {
      if (!key) return currentData;
      const newData = { [key as string]: formData[key as string] };
      if (key === "name") {
        newData.slug = kebabCase(formData[key]?.replace(/\d/g, ""));
      } else if (key === "slug") {
        newData.slug = formData[key]?.replace(/\d/g, "").replace(/\s+/g, "").replace("--", "-").replace("__", "_");
      } else if (key === "seoData") {
        newData.seoData = {
          title: formData[key].title || "",
          description: formData[key].description || "",
          image: formData[key].image || "",
        };
      }
      return {
        ...currentData,
        ...newData,
      };
    });
  };

  const updateProjectRealtime = ({ formData }: any, key?: string): void => {
    setProjectData((currentData: { isHomePage: boolean }) => {
      const newData = { [key as string]: formData[key as string] };
      return {
        ...currentData,
        ...newData,
      };
    });
  };

  const basicProperties = {
    name: SingleLineText({
      title: "Page Name",
      default: _pageData.name as string,
    }),
    slug: SingleLineText({ title: "Page Slug", default: _pageData.slug }),
  };

  const seoProperties = {
    seoData: Model({
      title: "",
      description: "",
      default: {
        title: "",
        description: "",
        image: "",
      },
      properties: {
        title: SingleLineText({
          title: "Meta Title",
          default: _pageData.name as string,
        }),
        description: MultilineText({
          title: "Meta Description",
          default: _pageData.slug,
        }),
        image: Image({ title: "Social Media Image", default: "" }),
      },
    }),
  };

  const homePageProperties = {
    isHomePage: Checkbox({
      title: "Set as homepage",
      default: _projectData.isHomePage,
    }),
  };

  return (
    <ScrollArea className="flex h-full select-none flex-col">
      <ConfirmAlert
        open={open === "ALERT"}
        title="Do yo want to save changes?"
        onCancel={() => setOpen("CLOSE")}
        onConfirm={handleSubmit}
        disabled={updateProject.isPending || updatePage.isPending}
      />
      <div className="rounded-md bg-background/30 px-2.5 py-1">
        <h1 className="px-1 font-semibold">Page Details</h1>
      </div>
      <div className="px-2.5 pt-2">
        <div className="flex flex-col space-y-2">
          <Form
            title="Basic Details"
            formData={_pageData}
            properties={basicProperties}
            onChange={updatePageRealtime}
            disabled={updatePage.isPending || updateProject.isPending}
          />
          <div className="h-2 w-full" />
          <Form
            title="SEO Details"
            formData={_pageData}
            properties={seoProperties}
            onChange={updatePageRealtime}
            disabled={updatePage.isPending || updateProject.isPending}
          />
          {projectData?.homepage !== pageData.uuid && pageData.type === "STATIC" ? (
            <Form
              formData={_projectData}
              properties={homePageProperties}
              onChange={updateProjectRealtime}
              disabled={updatePage.isPending || updateProject.isPending}
            />
          ) : (
            pageData.type === "STATIC" && (
              <div className="flex items-center gap-x-1 px-1 pt-2 text-xs font-medium text-gray-500">
                <HomeIcon /> This is homepage{" "}
              </div>
            )
          )}
          {_pageData.type === "DYNAMIC" && !isValidDynamicSlug(_pageData?.slug || "") && (
            <small className="px-1 text-red-400">
              Add dynamic ID in page slug Eg: <i className="underline">some-url/[some-id]</i>
            </small>
          )}
          <div className="my-2 flex w-full items-center justify-between gap-x-2 px-1">
            <Button
              className="w-full"
              type="submit"
              onClick={handleSubmit}
              disabled={
                projectData?.homepage !== pageData.uuid && _projectData.isHomePage
                  ? false
                  : isEmpty(_pageData.name) ||
                    isEmpty(_pageData.slug) ||
                    !isAnyChangeInPage ||
                    updatePage.isPending ||
                    updateProject.isPending ||
                    (_pageData.type === "DYNAMIC" && !isValidDynamicSlug(_pageData?.slug || ""))
              }>
              Save
            </Button>
            <DeletePage pageData={pageData} projectData={projectData as any} />
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default PageDetail;
