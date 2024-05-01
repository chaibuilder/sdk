import { atom } from "jotai";

export const readOnlyModeAtom: any = atom<boolean>(false);
readOnlyModeAtom.debugLabel = "readOnlyModeAtom";

export const advanceStylingOpenAtom: any = atom(false);
advanceStylingOpenAtom.debugLabel = "advanceStylingOpenAtom";

export const networkModeAtom: any = atom<string>("online");
networkModeAtom.debugLabel = "networkModeAtom";

export const codeEditorOpenAtom: any = atom(false);
codeEditorOpenAtom.debugLabel = "codeEditorOpenAtom";

/**
 * @atom
 * Stores the id of the layer that is currently being edited
 */
export const editLayerNameAtom: any = atom(false);
editLayerNameAtom.debugLabel = "editLayerNameAtom";

export const activeLanguageAtom: any = atom("");
activeLanguageAtom.debugLabel = "activeLanguageAtom";

export const primaryLanguageAtom: any = atom("");
primaryLanguageAtom.debugLabel = "primaryLanguageAtom";

export const canvasIframeAtom: any = atom<HTMLIFrameElement | null>(null);
canvasIframeAtom.debugLabel = "canvasIframeAtom";

export const activePanelAtom = atom<string>("layers");
activePanelAtom.debugLabel = "activePanelAtom";

export const addBlockOffCanvasAtom = atom(false);
addBlockOffCanvasAtom.debugLabel = "addBlockOffCanvasAtom";

export const showPredefinedBlockCategoryAtom = atom("");
showPredefinedBlockCategoryAtom.debugLabel = "showPredefinedBlockCategoryAtom";

export const historyStatesAtom = atom<{ undoCount: number; redoCount: number }>({ undoCount: 0, redoCount: 0 });
historyStatesAtom.debugLabel = "historyStatesAtom";

export const inlineEditingActiveAtom = atom("");
inlineEditingActiveAtom.debugLabel = "inlineEditingActiveAtom";
