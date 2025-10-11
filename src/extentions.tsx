import AddBlockAi from "@/_demo/add-block-ai";
import registerCustomBlocks from "@/_demo/blocks";
import "@/_demo/panels/panel";
import { registerChaiAddBlockTab } from "@/core/extensions/add-block-tabs";
import { registerChaiSaveToLibrary } from "@/core/extensions/save-to-library";
import { registerChaiPreImportHTMLHook, registerChaiTopBar } from "@/core/main";
import { ChaiLibraryBlock } from "@/types/chaibuilder-editor-props";
import { ChaiFontViaSrc, ChaiFontViaUrl, registerChaiFont } from "@chaibuilder/runtime";
import { lazy } from "react";
import { registerChaiLibrary } from "./core/extensions/libraries";
const TopBar = lazy(() => import("@/_demo/top-bar"));

export const extendChaiBuilder = () => {
  registerCustomBlocks();
  registerChaiPreImportHTMLHook(async (html) => {
    console.log(html);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(html.replace(/bg-yellow-light-4/g, "bg-destructive"));
      }, 4000);
    });
  });

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

  const url = "https://chai-ui-blocks.vercel.app";
  registerChaiLibrary("meraki-ui", {
    name: "Meraki UI",
    description: "Meraki UI",
    getBlocksList: async () => {
      try {
        const response = await fetch(url + "/blocks.json");
        const blocks = await response.json();
        return blocks.map((b: any) => ({ ...b, preview: url + b.preview }));
      } catch (error) {
        return [];
      }
    },
    getBlock: async ({ block }: { block: ChaiLibraryBlock }) => {
      try {
        const response = await fetch(url + (!block.path ? "/" + block.uuid + ".html" : "/blocks/" + block.path));
        const html = await response.text();
        return html.replace(/---([\s\S]*?)---/g, "");
      } catch (error) {
        console.log(error);
        return "<p>Something went wrong. Please try again</p>";
      }
    },
  });
};
