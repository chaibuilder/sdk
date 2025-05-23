import AddBlockAi from "@/_demo/add-block-ai";
import registerCustomBlocks from "@/_demo/blocks";
// import "@/_demo/panels/panel";
import { registerChaiAddBlockTab } from "@/core/extensions/add-block-tabs";
import { registerChaiSaveToLibrary } from "@/core/extensions/save-to-library";
import { registerChaiTopBar } from "@/core/main";
import { ChaiFontViaSrc, ChaiFontViaUrl, registerChaiFont } from "@chaibuilder/runtime";
import { lazy } from "react";

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
};
