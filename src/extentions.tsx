import { ChaiFontViaSrc, ChaiFontViaUrl, registerChaiFont } from "@chaibuilder/runtime";
import { lazy } from "react";
import AddBlockAi from "./_demo/add-block-ai";
import registerCustomBlocks from "./_demo/blocks";
import "./_demo/panels/panel";
import { registerChaiAddBlockTab } from "./core/extensions/add-block-tabs";
import { registerChaiSaveToLibrary } from "./core/extensions/save-to-library";
import { registerChaiTopBar } from "./core/main";

const TopBar = lazy(() => import("./_demo/Topbar"));

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
  return <div>Save to Lib</div>;
});

// registerChaiSidebarPanel("drawer-panel", {
//   component: () => "Drawer Panel",
//   icon: <IconJarLogoIcon className="h-5 w-5" />,
//   label: "Drawer Panel",
//   position: "top",
//   view: "drawer",
//   width: 650,
//   showIf: () => true,
// });

// registerChaiSidebarPanel("modal-panel", {
//   component: () => (
//     <div className="flex h-[600px] w-full flex-col">
//       <div className="flex-1 overflow-y-auto p-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-lg font-semibold">Modal Panel</h2>
//         </div>
//       </div>
//     </div>
//   ),
//   icon: <BotIcon className="h-5 w-5" />,
//   label: "Modal Panel",
//   position: "top",
//   view: "modal",
//   width: 650,
//   showIf: () => true,
// });

// registerChaiSidebarPanel("overlay-panel", {
//   component: () => "Overlay Panel",
//   icon: <BusIcon className="h-5 w-5" />,
//   label: "Overlay Panel",
//   position: "top",
//   view: "overlay",
//   showIf: () => true,
// });

registerChaiTopBar(TopBar);

registerChaiAddBlockTab("add-block-ai", {
  tab: () => "With AI",
  tabContent: AddBlockAi,
});
