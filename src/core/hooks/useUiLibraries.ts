import { useBuilderProp } from "@/core/hooks/useBuilderProp";

export const useUILibraryBlocks = () => {
  const uiLibraries = useBuilderProp("uiLibraries", []);
  return { data: uiLibraries, isLoading: false };
};
