import { ChaiLibrary, ChaiLibraryBlock } from "@/types/chaibuilder-editor-props";
import { ChaiBlock } from "@/types/common";
import { values } from "lodash-es";

interface ChaiLibraryConfig {
  id: string;
  name: string;
  description: string;
  getBlocksList: (library: ChaiLibrary) => Promise<ChaiLibraryBlock[]>;
  getBlock: (library: ChaiLibrary, libBlock: ChaiLibraryBlock) => Promise<string | ChaiBlock[]>;
}

let LIBRARIES: Record<string, ChaiLibraryConfig> = {};

export const registerChaiLibrary = (id: string, library: Omit<ChaiLibraryConfig, "id">) => {
  LIBRARIES[id] = { ...library, id };
};

export const getChaiLibrary = (id: string) => {
  return LIBRARIES[id];
};

export const useChaiLibraries = () => {
  return values(LIBRARIES);
};
