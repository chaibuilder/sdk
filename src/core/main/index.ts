import { ChaiBlock } from "../types/ChaiBlock";
import { ChaiBuilderEditorProps } from "../types";
import ChaiBuilderCanvas from "../components/canvas/CanvasArea.tsx";
import ThemeOptions from "../components/sidepanels/panels/theming/ThemeConfigPanel.tsx";
import Outline from "../components/sidepanels/panels/outline/treeview/ListTree.tsx";
import ImportHTML from "../components/sidepanels/panels/add-blocks/ImportHTML.tsx";
import BlockPropsEditor from "../components/settings/BlockSettings.tsx";
import BlockStyleEditor from "../components/settings/BlockStyling.tsx";
import UILibrariesPanel from "../components/sidepanels/panels/add-blocks/UILibrariesPanel.tsx";
import i18n from "../locales/load";
import AddBlocksPanel from "../components/sidepanels/panels/add-blocks/AddBlocks.tsx";

export { AddBlocksDialog } from "../components/layout/AddBlocksDialog.tsx";
export { emitChaiBuilderMsg, useChaiBuilderMsgListener, CHAI_BUILDER_EVENTS } from "../events.ts";
export { AISetContext, AIUserPrompt } from "../components/AskAi.tsx";
export { BlockAttributesEditor } from "../components/settings/new-panel/BlockAttributesEditor.tsx";
export { ChaiBuilderEditor } from "../components/ChaiBuilderEditor.tsx";
export { DefaultChaiBlocks } from "../components/sidepanels/panels/add-blocks/DefaultBlocks.tsx";
export { DarkMode as DarkModeSwitcher } from "../components/canvas/topbar/DarkMode.tsx";
export { Breakpoints as ScreenSizes } from "../components/canvas/topbar/Breakpoints.tsx";
export { UndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
export {
  ChaiBuilderCanvas,
  ThemeOptions,
  Outline,
  ImportHTML,
  BlockPropsEditor,
  BlockStyleEditor,
  i18n,
  UILibrariesPanel as UILibraries,
  AddBlocksPanel,
};
export * from "../hooks";
export { generateUUID as generateBlockId, cn as mergeClasses } from "../functions/Functions.ts";
export { getClassValueAndUnit } from "../functions/Helpers.ts";
export { getBlocksFromHTML } from "../import-html/html-to-json.ts";
export type { ChaiBlock, ChaiBuilderEditorProps };
export { registerChaiBlock } from "@chaibuilder/runtime";
