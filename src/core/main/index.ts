import type { ChaiBlock } from "../../types/chai-block.ts";
import type { ChaiBuilderEditorProps } from "../../types/index.ts";

import ChaiBuilderCanvas from "../components/canvas/CanvasArea.tsx";
import BlockPropsEditor from "../components/settings/BlockSettings.tsx";
import BlockStyleEditor from "../components/settings/BlockStyling.tsx";
import AddBlocksPanel from "../components/sidepanels/panels/add-blocks/AddBlocks.tsx";
import ImportHTML from "../components/sidepanels/panels/add-blocks/ImportHTML.tsx";
import UILibrariesPanel from "../components/sidepanels/panels/add-blocks/UILibrariesPanel.tsx";
import Outline from "../components/sidepanels/panels/outline/treeview/ListTree.tsx";
import ThemeConfigPanel from "../components/sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";

import i18n from "../locales/load";

if (typeof window === "undefined") {
  throw new Error("@chaibuilder/sdk is only supported in the browser. Avoid using it in the server side.");
}

// components
export { AISetContext as ChaiAskAiPanel, AIUserPrompt as ChaiAskAiUserPrompt } from "../components/ask-ai-panel.tsx";
export { Breakpoints as ChaiScreenSizes } from "../components/canvas/topbar/Breakpoints.tsx";
export { DarkMode as ChaiDarkModeSwitcher } from "../components/canvas/topbar/DarkMode.tsx";
export { UndoRedo as ChaiUndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
export { ChaiBuilderEditor } from "../components/chaibuilder-editor.tsx";
export { AddBlocksDialog as ChaiAddBlocksDialog } from "../components/layout/AddBlocksDialog.tsx";
export { BlockAttributesEditor as ChaiBlockAttributesEditor } from "../components/settings/new-panel/BlockAttributesEditor.tsx";
export { DefaultChaiBlocks as ChaiDefaultBlocks } from "../components/sidepanels/panels/add-blocks/DefaultBlocks.tsx";
export {
  AddBlocksPanel as ChaiAddBlocksPanel,
  BlockPropsEditor as ChaiBlockPropsEditor,
  BlockStyleEditor as ChaiBlockStyleEditor,
  ChaiBuilderCanvas,
  ImportHTML as ChaiImportHTML,
  Outline as ChaiOutline,
  ThemeConfigPanel as ChaiThemeConfigPanel,
  UILibrariesPanel as ChaiUILibrariesPanel,
};

// i18n
export { i18n };

// helper functions
export { generateUUID as generateBlockId, cn as mergeClasses } from "../functions/Functions.ts";
export { getBlocksFromHTML as convertHTMLToChaiBlocks, getBlocksFromHTML } from "../import-html/html-to-json.ts";

// types
export type { ChaiBlock, ChaiBuilderEditorProps };

// registration apis
export { registerChaiMediaManager } from "../extensions/media-manager.tsx";
export { registerChaiSidebarPanel } from "../extensions/sidebar-panels.tsx";
export { registerChaiTopBar } from "../extensions/top-bar.tsx";

// hooks
export * from "../hooks";

// constants
export { PERMISSIONS } from "../constants/PERMISSIONS";
export { CHAI_BUILDER_EVENTS } from "../events.ts";
