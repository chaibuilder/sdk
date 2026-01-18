import { values } from "lodash-es";

type HTMLString = string;

type ChaiLibraryConfig = {
  id: string;
  name: string;
  description: string;
  getBlocksList: (library: any) => Promise<any[]>; // ChaiLibrary & ChaiLibraryBlock - avoiding circular dependency
  getBlock: ({
    library,
    block,
  }: {
    library: any;
    block: any;
  }) => Promise<HTMLString | any[]>;
};

let LIBRARIES_REGISTRY: Record<string, ChaiLibraryConfig> = {};

export const registerChaiLibrary = (
  id: string,
  library: Omit<ChaiLibraryConfig, "id">,
) => {
  LIBRARIES_REGISTRY[id] = { ...library, id };
};

export const getChaiLibrary = (id: string) => {
  return LIBRARIES_REGISTRY[id];
};

export const useChaiLibraries = () => {
  return values(LIBRARIES_REGISTRY);
};
