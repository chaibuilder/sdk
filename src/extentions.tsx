import AddBlockAi from "@/_demo/add-block-ai";
import registerCustomBlocks from "@/_demo/blocks";
// import "@/_demo/panels/panel";
import { registerChaiAddBlockTab } from "@/core/extensions/add-block-tabs";
import { registerChaiSaveToLibrary } from "@/core/extensions/save-to-library";
import { registerChaiTopBar } from "@/core/main";
import { ChaiLibrary, ChaiLibraryBlock } from "@/types/chaibuilder-editor-props";
import { ChaiFontViaSrc, ChaiFontViaUrl, registerChaiFont } from "@chaibuilder/runtime";
import axios from "axios";
import { lazy } from "react";
import { registerChaiLibrary } from "./core/extensions/libraries";
const TopBar = lazy(() => import("@/_demo/top-bar"));

export const extendChaiBuilder = () => {
  registerCustomBlocks();

  registerChaiFont("Ubuntu", {
    url: "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
    fallback: `sans-serif`,
  } as ChaiFontViaUrl);
  registerChaiFont("Geist", {
    fallback: `"Geist Fallback", Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`,
    src: [{ url: "http://localhost:5173/fonts/Geist.woff", format: "woff" }],
  } as ChaiFontViaSrc);

  registerChaiSaveToLibrary((props) => {
    console.log(props);
    return <div className="h-96 w-96">Save to Lib</div>;
  });

  registerChaiTopBar(TopBar);

  registerChaiAddBlockTab("add-block-ai", {
    tab: () => "With AI",
    tabContent: AddBlockAi,
  });

  registerChaiLibrary("meraki-ui", {
    name: "Meraki UI",
    description: "Meraki UI",
    getBlocksList: async (_library: ChaiLibrary) => {
      try {
        const response = await axios.get("https://chai-ui-blocks.vercel.app/blocks.json");
        const blocks = await response.data;
        return blocks.map((b: any) => ({ ...b, preview: "https://chai-ui-blocks.vercel.app" + b.preview }));
      } catch (error) {
        return [];
      }
    },
    getBlock: async (_library: ChaiLibrary, libBlock: ChaiLibraryBlock<{ path?: string; uuid: string }>) => {
      const response = await axios.get(
        "https://chai-ui-blocks.vercel.app" +
          (!libBlock.path ? "/" + libBlock.uuid + ".html" : "/blocks/" + libBlock.path),
      );
      const html = await response.data;
      const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
      return htmlWithoutChaiStudio;
    },
  });
};
