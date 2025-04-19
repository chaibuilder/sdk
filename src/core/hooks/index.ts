import { useBlocksStore } from "@/core/history/useBlocksStoreUndoableActions";
import { useUndoManager } from "@/core/history/useUndoManager";
import { useLibraryBlocks } from "@/core/hooks/use-library-blocks";
import { useAddBlock } from "@/core/hooks/useAddBlock";
import { useAddClassesToBlocks } from "@/core/hooks/useAddClassesToBlocks";
import { useAskAi } from "@/core/hooks/useAskAi";
import { useBlockHighlight } from "@/core/hooks/useBlockHighlight";
import { useBrandingOptions } from "@/core/hooks/useBrandingOptions";
import { useBuilderProp } from "@/core/hooks/useBuilderProp";
import { useBuilderReset } from "@/core/hooks/useBuilderReset";
import { useCanvasZoom } from "@/core/hooks/useCanvasZoom";
import { useCodeEditor } from "@/core/hooks/useCodeEditor";
import { useCopyBlockIds } from "@/core/hooks/useCopyBlockIds";
import { useCopyToClipboard } from "@/core/hooks/useCopyToClipboard";
import { useCurrentPage } from "@/core/hooks/useCurrentPage";
import { useCutBlockIds } from "@/core/hooks/useCutBlockIds";
import { useDarkMode } from "@/core/hooks/useDarkMode";
import { useDuplicateBlocks } from "@/core/hooks/useDuplicateBlocks";
import { useHiddenBlockIds } from "@/core/hooks/useHiddenBlocks";
import { useHighlightBlockId } from "@/core/hooks/useHighlightBlockId";
import { useLanguages } from "@/core/hooks/useLanguages";
import { usePartailBlocksStore, usePartialBlocksList } from "@/core/hooks/usePartialBlocksStore";
import { usePasteBlocks } from "@/core/hooks/usePasteBlocks";
import { usePermissions } from "@/core/hooks/usePermissions";
import { usePreviewMode } from "@/core/hooks/usePreviewMode";
import { useRemoveBlocks } from "@/core/hooks/useRemoveBlocks";
import { useRemoveClassesFromBlocks } from "@/core/hooks/useRemoveClassesFromBlocks";
import { useSavePage } from "@/core/hooks/useSavePage";
import { useSelectedBlockAllClasses, useSelectedBlockCurrentClasses } from "@/core/hooks/useSelectBlockClasses";
import { useSelectedBlock, useSelectedBlockIds, useSelectedBlocksDisplayChild } from "@/core/hooks/useSelectedBlockIds";
import { useSelectedBreakpoints } from "@/core/hooks/useSelectedBreakpoints";
import { useSelectedStylingBlocks } from "@/core/hooks/useSelectedStylingBlocks";
import { useStylingBreakpoint } from "@/core/hooks/useStylingBreakpoint";
import { useStylingState } from "@/core/hooks/useStylingState";
import { useRightPanel, useTheme, useThemeOptions } from "@/core/hooks/useTheme";
import { useUILibraryBlocks } from "@/core/hooks/useUiLibraries";
import { useUpdateBlocksProps, useUpdateBlocksPropsRealtime } from "@/core/hooks/useUpdateBlocksProps";
import { useWrapperBlock } from "@/core/hooks/useWrapperBlock";
import { useTranslation } from "react-i18next";
export { useBlocksStoreUndoableActions } from "@/core/history/useBlocksStoreUndoableActions";
export { useSelectedLibrary } from "@/core/hooks/use-selected-library";
export { useSidebarActivePanel } from "@/core/hooks/use-sidebar-active-panel";
export { useCanvasDisplayWidth, useScreenSizeWidth } from "@/core/hooks/useScreenSizeWidth";

export {
  useAddBlock,
  useAddClassesToBlocks,
  useAskAi,
  useBlockHighlight,
  useBlocksStore,
  useBrandingOptions,
  useBuilderProp,
  useBuilderReset,
  useCanvasZoom,
  useCodeEditor,
  useCopyBlockIds,
  useCopyToClipboard,
  useCurrentPage,
  useCutBlockIds,
  useDarkMode,
  useDuplicateBlocks,
  useHiddenBlockIds,
  useHighlightBlockId,
  useLanguages,
  useLibraryBlocks,
  usePartailBlocksStore,
  usePartialBlocksList,
  usePasteBlocks,
  usePermissions,
  usePreviewMode,
  useRemoveBlocks,
  useRemoveClassesFromBlocks,
  useRightPanel,
  useSavePage,
  useSelectedBlock,
  useSelectedBlockAllClasses,
  useSelectedBlockCurrentClasses,
  useSelectedBlockIds,
  useSelectedBlocksDisplayChild,
  useSelectedBreakpoints,
  useSelectedStylingBlocks,
  useStylingBreakpoint,
  useStylingState,
  useTheme,
  useThemeOptions,
  useTranslation,
  useUILibraryBlocks,
  useUndoManager,
  useUpdateBlocksProps,
  useUpdateBlocksPropsRealtime,
  useWrapperBlock,
};
