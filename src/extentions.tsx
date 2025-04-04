import { ChaiFontViaSrc, ChaiFontViaUrl, registerChaiFont } from "@chaibuilder/runtime";
import { ThermometerIcon } from "lucide-react";
import registerCustomBlocks from "./__dev/blocks";
import { registerChaiSidebarPanel } from "./core/main";

registerCustomBlocks();

registerChaiFont("Ubuntu", {
  url: "https://fonts.googleapis.com/css2?family=Ubuntu:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap",
  fallback: `sans-serif`,
} as ChaiFontViaUrl);
registerChaiFont("Geist", {
  fallback: `"Geist Fallback", Arial, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol`,
  src: [{ url: "http://localhost:5173/fonts/Geist.woff", format: "woff" }],
} as ChaiFontViaSrc);

registerChaiSidebarPanel("panel-1", {
  component: () => "Panel 1",
  icon: <ThermometerIcon />,
  label: "Panel 1",
  position: "top",
  showIf: () => true,
});
