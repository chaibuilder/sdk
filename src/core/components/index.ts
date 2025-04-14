import ChaiBuilderCanvas from "../components/canvas/CanvasArea.tsx";

import BlockStyleEditor from "../components/settings/BlockStyling.tsx";
import i18n from "../locales/load";
import BlockPropsEditor from "./settings/block-settings.tsx";
import AddBlocksPanel from "./sidepanels/panels/add-blocks/add-blocks.tsx";
import ImportHTML from "./sidepanels/panels/add-blocks/import-html.tsx";
import UILibrariesPanel from "./sidepanels/panels/add-blocks/libraries-panel.tsx";
import Outline from "./sidepanels/panels/outline/list-tree.tsx";
import ThemeOptions from "./sidepanels/panels/theme-configuration/ThemeConfigPanel.tsx";

export { Breakpoints as ScreenSizes } from "../components/canvas/topbar/Breakpoints.tsx";
export { DarkMode as DarkModeSwitcher } from "../components/canvas/topbar/DarkMode.tsx";
export { UndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
export { AddBlocksDialog } from "../components/layout/AddBlocksDialog.tsx";
export { BlockAttributesEditor } from "../components/settings/new-panel/BlockAttributesEditor.tsx";
export { AISetContext, AIUserPrompt } from "./ask-ai-panel.tsx";
export { ChaiBuilderEditor } from "./chaibuilder-editor.tsx";
export { default as JSONFormFieldTemplate } from "./settings/JSONFormFieldTemplate.tsx";
export { DefaultChaiBlocks } from "./sidepanels/panels/add-blocks/default-blocks.tsx";
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

export * from "../../types/index.ts";
