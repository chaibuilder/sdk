import { useBuilderProp } from "@/core/hooks/use-builder-prop";

export const useUILibraryBlocks = () => {
  const uiLibraries = useBuilderProp("uiLibraries", []);
  return { data: uiLibraries, isLoading: false };
};
