import { ChaiBuilderEditor, ChaiBuilderEditorProps, useBuilderProp } from "../../core/main";
import { FileTextIcon, GearIcon } from "@radix-ui/react-icons";
import React, { lazy, useCallback } from "react";
import { useProject } from "../hooks/useProject.ts";
import { usePages } from "../hooks/usePages.ts";
import { usePageData } from "../hooks/usePageData.ts";
import { FullPageLoading } from "./FullPageLoading.tsx";
import { Button } from "../../ui";
import { useUpdateProject } from "../mutations/useProjectActions.ts";
import { usePublishPage, useUpdatePage } from "../mutations/usePageActions.ts";
import { useCurrentPage } from "../hooks/useCurrentPage.ts";
import { useExternalPredefinedBlock, useUiLibraryBlocks } from "../hooks/useUiLibrary.ts";
import { useUploadAsset } from "../mutations/useAssetActions.ts";
import { useApiBaseUrl } from "../hooks/useApiBaseUrl.ts";
import { TakeOverModal } from "./TakeOverModal.tsx";
import SignOut from "./SignOut.tsx";
import { ChaiBuilderStudioProps } from "../index.tsx";

const PagesPanel = lazy(() => import("../panels/PagesPanel.tsx"));
const ProjectSettings = lazy(() => import("../panels/ProjectPanel.tsx"));
const CurrentPage = lazy(() => import("../panels/CurrentPage.tsx"));

const Logo: React.FC<any> = () => <h2>Your Logo</h2>;

const PublishPage: React.FC<any> = () => {
  const { mutate } = usePublishPage();
  const editable = useBuilderProp("editable", true);
  if (!editable) return null;
  return (
    <Button onClick={mutate} className="bg-blue-600 text-white">
      Publish
    </Button>
  );
};

export const ChaiBuilderCmp = (props: ChaiBuilderStudioProps) => {
  const { data: project, isLoading } = useProject();
  const { data: pages, isLoading: loadingPages } = usePages();
  const { data: pageData } = usePageData();

  const { mutate } = useUpdateProject();
  const { mutate: updatePage } = useUpdatePage();
  const [currentPage] = useCurrentPage();
  const uploadAsset = useUploadAsset();
  const uiLibrary = useUiLibraryBlocks();
  const predefinedBlock = useExternalPredefinedBlock();
  const baseUrl = useApiBaseUrl();

  const uploadMediaCallback = useCallback(
    async (file: File) => {
      return await uploadAsset.mutateAsync(file);
    },
    [uploadAsset],
  );

  const getUILibraryBlocks = useCallback(async () => {
    return await uiLibrary.mutateAsync();
  }, [uiLibrary]);

  const getExternalPredefinedBlock = useCallback(
    async (block: any) => {
      return await predefinedBlock.mutateAsync(block);
    },
    [predefinedBlock],
  );

  const fetchMediaCallback = async (limit = 20, offset = 0) => {
    const params = `limit=${limit}&offset=${offset}`;
    const response = await fetch(`${baseUrl}/assets?${params}`).then((_res) => _res.json());
    return response.result === "success"
      ? (response.data as {
          id: string;
          url: string;
          name: string;
          thumbUrl: string;
        }[])
      : [];
  };

  const { logo = Logo } = props;

  if (isLoading || !project) return <FullPageLoading />;
  if (loadingPages || !pages) return <FullPageLoading />;

  const editorProps: ChaiBuilderEditorProps = {
    ...props,
    editable: pageData?.lockedBy ? pageData?.lockedBy.self : true,
    nonEditableComponent: TakeOverModal,
    blocks: pageData?.blocks || [],
    brandingOptions: project.brandingOptions,
    darkMode: props.darkMode || false,
    dataBindingSupport: (pageData?.providers || []).length > 0,
    dataProviders: pageData?.providers || [],
    onSavePage: async ({ blocks, providers }) => {
      await updatePage({ blocks, providers, uuid: currentPage });
      return true;
    },
    onSaveBrandingOptions: async (branding) => {
      await mutate({ brandingOptions: branding });
      return true;
    },
    topBarComponents: {
      left: [logo],
      center: [CurrentPage],
      right: [PublishPage],
    },
    sideBarComponents: {
      top: [
        { icon: FileTextIcon, name: "pages", panel: PagesPanel },
        { icon: GearIcon, name: "settings", panel: ProjectSettings },
        ...(props.sideBarComponents?.top || []),
      ],
      bottom: [SignOut],
    },
    uploadMediaCallback: uploadMediaCallback,
    fetchMediaCallback: fetchMediaCallback,
    getUILibraryBlocks: getUILibraryBlocks,
    getExternalPredefinedBlock: getExternalPredefinedBlock,
    getPages: () => pages,
  };

  return <ChaiBuilderEditor {...editorProps} />;
};
