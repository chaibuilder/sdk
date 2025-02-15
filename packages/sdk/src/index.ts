import ChaiBuilderCanvas from "./core/components/canvas/CanvasArea.tsx";
import ThemeOptions from "./core/components/sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";
import { ChaiBlock } from "./core/types/ChaiBlock.ts";
import { ChaiBuilderEditorProps } from "./core/types/index.ts";

import BlockPropsEditor from "./core/components/settings/BlockSettings.tsx";
import BlockStyleEditor from "./core/components/settings/BlockStyling.tsx";
import AddBlocksPanel from "./core/components/sidepanels/panels/add-blocks/AddBlocks.tsx";
import ImportHTML from "./core/components/sidepanels/panels/add-blocks/ImportHTML.tsx";
import UILibrariesPanel from "./core/components/sidepanels/panels/add-blocks/UILibrariesPanel.tsx";
import Outline from "./core/components/sidepanels/panels/outline/treeview/ListTree.tsx";
import i18n from "./core/locales/load.ts";

export { registerChaiBlock } from "@chaibuilder/runtime";
export { AISetContext, AIUserPrompt } from "./core/components/AskAi.tsx";
export { Breakpoints as ScreenSizes } from "./core/components/canvas/topbar/Breakpoints.tsx";
export { DarkMode as DarkModeSwitcher } from "./core/components/canvas/topbar/DarkMode.tsx";
export { UndoRedo } from "./core/components/canvas/topbar/UndoRedo.tsx";
export { ChaiBuilderEditor } from "./core/components/ChaiBuilderEditor.tsx";
export { AddBlocksDialog } from "./core/components/layout/AddBlocksDialog.tsx";
export { BlockAttributesEditor } from "./core/components/settings/new-panel/BlockAttributesEditor.tsx";
export { DefaultChaiBlocks } from "./core/components/sidepanels/panels/add-blocks/DefaultBlocks.tsx";
export { CHAI_BUILDER_EVENTS } from "./core/events.ts";
export { generateUUID as generateBlockId, cn as mergeClasses } from "./core/functions/Functions.ts";
export { getClassValueAndUnit } from "./core/functions/Helpers.ts";
export * from "./core/hooks/index.ts";
export { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
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
