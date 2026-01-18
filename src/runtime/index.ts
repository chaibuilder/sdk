// Re-export from @chaibuilder/runtime
export * from "@chaibuilder/runtime";

// Export all registerChai* APIs
export {
  registerChaiAddBlockTab,
  useChaiAddBlockTabs,
  ADD_BLOCK_TABS,
  type AddBlockTab,
} from "./register-chai-add-block-tab";

export {
  registerChaiPreImportHTMLHook,
  getPreImportHTML,
} from "./register-chai-pre-import-html-hook";

export {
  registerChaiSidebarPanel,
  useChaiSidebarPanels,
  CHAI_BUILDER_PANELS,
  type ChaiSidebarPanel,
} from "./register-chai-sidebar-panel";

export {
  registerChaiFeatureFlag,
  registerChaiFeatureFlags,
  useChaiFeatureFlags,
  useChaiFeatureFlag,
  useToggleChaiFeatureFlag,
  IfChaiFeatureFlag,
} from "./register-chai-flag";

export {
  registerChaiSaveToLibrary,
  useSaveToLibraryComponent,
  resetSaveToLibrary,
  type SaveToLibraryProps,
} from "./register-chai-save-to-library";

export {
  registerChaiLibrary,
  getChaiLibrary,
  useChaiLibraries,
} from "./register-chai-library";

export {
  registerChaiTopBar,
  useTopBarComponent,
} from "./register-chai-top-bar";

export {
  registerChaiMediaManager,
  useMediaManagerComponent,
  type MediaManagerProps,
} from "./register-chai-media-manager";

export {
  registerBlockSettingWidget,
  registerBlockSettingField,
  registerBlockSettingTemplate,
  useBlockSettingComponents,
  RJSF_EXTENSIONS,
} from "./register-blocks-settings";
