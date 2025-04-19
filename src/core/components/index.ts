import ChaiBuilderCanvas from "@/core/components/canvas/canvas-area";
import BlockPropsEditor from "@/core/components/settings/block-settings";
import BlockStyleEditor from "@/core/components/settings/BlockStyling";
import AddBlocksPanel from "@/core/components/sidepanels/panels/add-blocks/add-blocks";
import ImportHTML from "@/core/components/sidepanels/panels/add-blocks/import-html";
import UILibrariesPanel from "@/core/components/sidepanels/panels/add-blocks/libraries-panel";
import Outline from "@/core/components/sidepanels/panels/outline/list-tree";
import ThemeOptions from "@/core/components/sidepanels/panels/theme-configuration/ThemeConfigPanel";
import i18n from "@/core/locales/load";

export { AISetContext, AIUserPrompt } from "@/core/components/ask-ai-panel";
export { Breakpoints as ScreenSizes } from "@/core/components/canvas/topbar/Breakpoints";
export { DarkMode as DarkModeSwitcher } from "@/core/components/canvas/topbar/DarkMode";
export { UndoRedo } from "@/core/components/canvas/topbar/UndoRedo";
export { ChaiBuilderEditor } from "@/core/components/chaibuilder-editor";
export { AddBlocksDialog } from "@/core/components/layout/AddBlocksDialog";
export { default as JSONFormFieldTemplate } from "@/core/components/settings/JSONFormFieldTemplate";
export { BlockAttributesEditor } from "@/core/components/settings/new-panel/BlockAttributesEditor";
export { DefaultChaiBlocks } from "@/core/components/sidepanels/panels/add-blocks/default-blocks";
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

export * from "@/types/index";
