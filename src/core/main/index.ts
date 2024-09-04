import "../locales/load";
import { ChaiBlock } from "../types/ChaiBlock";
import { ChaiBuilderEditorProps } from "../types/chaiBuilderEditorProps.ts";
import Outline from "../components/sidepanels/panels/outline/treeview/ListTree.tsx";
import { UndoRedo } from "../components/canvas/topbar/UndoRedo.tsx";
import { Breakpoints } from "../components/canvas/topbar/Breakpoints.tsx";
import { lazy } from "react";

export * from "./ChaiBuilderEditor";
export * from "../hooks";

const BuilderCanvas = lazy(() => import("../components/canvas/static/StaticCanvas.tsx"));
const BlockSettings = lazy(() => import("../components/settings/Settings.tsx"));
const AddBlocksPanel = lazy(() => import("../components/sidepanels/panels/add-blocks/AddBlocks.tsx"));
const ThemeConfigPanel = lazy(() => import("../components/sidepanels/panels/theming/ThemeConfigPanel.tsx"));

export { Outline, BuilderCanvas, BlockSettings, UndoRedo, Breakpoints, AddBlocksPanel, ThemeConfigPanel };

export type { ChaiBlock, ChaiBuilderEditorProps };
