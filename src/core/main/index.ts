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
export { AISetContext, AIUserPrompt } from "../components/ask-ai-panel.tsx";
export { Breakpoints as ScreenSizes } from "../components/canvas/topbar/Breakpoints.tsx";
export { DarkMode as DarkModeSwitcher } from "../components/canvas/topbar/DarkMode.tsx";
export { UndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
export { ChaiBuilderEditor } from "../components/chaibuilder-editor.tsx";
export { AddBlocksDialog } from "../components/layout/AddBlocksDialog.tsx";
export { BlockAttributesEditor } from "../components/settings/new-panel/BlockAttributesEditor.tsx";
export { DefaultChaiBlocks } from "../components/sidepanels/panels/add-blocks/DefaultBlocks.tsx";
export {
  AddBlocksPanel,
  BlockPropsEditor,
  BlockStyleEditor,
  ChaiBuilderCanvas,
  ImportHTML,
  Outline,
  ThemeConfigPanel,
  UILibrariesPanel,
};

// i18n
export { i18n };

// helper functions
export { generateUUID as generateBlockId, cn as mergeClasses } from "../functions/Functions.ts";
export { getClassValueAndUnit } from "../functions/Helpers.ts";
export { getBlocksFromHTML } from "../import-html/html-to-json.ts";

// types
export type { ChaiBlock, ChaiBuilderEditorProps };

// registration apis
export { registerChaiBlock } from "@chaibuilder/runtime";
export { registerChaiMediaManager } from "../extensions/media-manager.tsx";

// hooks
export * from "../hooks";

// constants
export { PERMISSIONS } from "../constants/PERMISSIONS";
export { CHAI_BUILDER_EVENTS } from "../events.ts";
