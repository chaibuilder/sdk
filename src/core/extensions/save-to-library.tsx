import { ComponentType, useMemo } from "react";
import { ChaiBlock } from "../../types/chai-block";

export type SaveToLibraryProps = {
  libBlockId?: string;
  blocks?: ChaiBlock[];
  close: () => void;
};

let SAVE_TO_LIB_COMPONENT: ComponentType<SaveToLibraryProps> | null = null;

export const registerSaveToLibrary = (component: ComponentType<SaveToLibraryProps>) => {
  SAVE_TO_LIB_COMPONENT = component;
};

export const useSaveToLibraryComponent = () => {
  return useMemo(() => SAVE_TO_LIB_COMPONENT, []);
};

// For testing purposes
export const resetSaveToLibrary = () => {
  SAVE_TO_LIB_COMPONENT = null;
};
