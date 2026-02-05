import { ChaiFontBySrc } from "@/package/types";
import { registerChaiFont } from "@chaibuilder/sdk/runtime";

export const registerFonts = () => {
  registerChaiFont<ChaiFontBySrc>("Bungee", {
    src: [{ url: "/bungee/Bungee-Regular.woff2", format: "woff2" }],
    fallback: "serif",
  });
};
