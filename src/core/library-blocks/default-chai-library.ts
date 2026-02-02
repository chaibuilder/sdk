import { ChaiLibrary, ChaiLibraryBlock } from "@/types/chaibuilder-editor-props";

export const defaultChaiLibrary = ({
  id = "chai-library",
  baseUrl = "https://chaibuilder-sdk.vercel.app/",
}: {
  id?: string;
  baseUrl?: string;
} = {}) => {
  return {
    id,
    name: "Chai Library",
    description: "",
    getBlocksList: async (_library: ChaiLibrary) => {
      const response = await fetch(`${baseUrl}library-blocks/blocks-list.json`);
      const data = await response.json();
      return data;
    },
    getBlock: async ({ block }: { library: ChaiLibrary; block: ChaiLibraryBlock<any> }) => {
      const response = await fetch(`${baseUrl}${block.id}.html?raw`);
      const data = await response.text();
      return data;
    },
  };
};
