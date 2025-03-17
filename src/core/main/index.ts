import ChaiBuilderCanvas from "../components/canvas/CanvasArea.tsx";
import ThemeOptions from "../components/sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";
import { ChaiBuilderEditorProps } from "../types";
import { ChaiBlock } from "../types/ChaiBlock";

import BlockPropsEditor from "../components/settings/BlockSettings.tsx";
import BlockStyleEditor from "../components/settings/BlockStyling.tsx";
import AddBlocksPanel from "../components/sidepanels/panels/add-blocks/AddBlocks.tsx";
import ImportHTML from "../components/sidepanels/panels/add-blocks/ImportHTML.tsx";
import UILibrariesPanel from "../components/sidepanels/panels/add-blocks/UILibrariesPanel.tsx";
import Outline from "../components/sidepanels/panels/outline/treeview/ListTree.tsx";
import i18n from "../locales/load";

export { registerChaiBlock } from "@chaibuilder/runtime";
export { AISetContext, AIUserPrompt } from "../components/AskAi.tsx";
export { Breakpoints as ScreenSizes } from "../components/canvas/topbar/Breakpoints.tsx";
export { DarkMode as DarkModeSwitcher } from "../components/canvas/topbar/DarkMode.tsx";
export { UndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
export { ChaiBuilderEditor } from "../components/ChaiBuilderEditor.tsx";
export { AddBlocksDialog } from "../components/layout/AddBlocksDialog.tsx";
export { BlockAttributesEditor } from "../components/settings/new-panel/BlockAttributesEditor.tsx";
export { DefaultChaiBlocks } from "../components/sidepanels/panels/add-blocks/DefaultBlocks.tsx";
export { CHAI_BUILDER_EVENTS } from "../events.ts";
export { generateUUID as generateBlockId, cn as mergeClasses } from "../functions/Functions.ts";
export { getClassValueAndUnit } from "../functions/Helpers.ts";
export * from "../hooks";
export { getBlocksFromHTML } from "../import-html/html-to-json.ts";
export {
  AddBlocksPanel,
  BlockPropsEditor,
  BlockStyleEditor,
  ChaiBuilderCanvas,
  i18n,
  ImportHTML,
  Outline,
  ThemeOptions,
  UILibrariesPanel as UILibraries,
};
export type { ChaiBlock, ChaiBuilderEditorProps };

export { PERMISSIONS } from "../constants/PERMISSIONS";
