import { ChaiFontBySrc } from "@/package/types";
import { registerChaiFont } from "@chaibuilder/sdk/runtime";

export const registerFonts = () => {
  registerChaiFont<ChaiFontBySrc>("Bungee", {
    src: [{ url: "/bungee/Bungee-Regular.woff2", format: "woff2" }],
    fallback: "serif",
  });
  registerChaiFont<ChaiFontBySrc>("Nunito Sans", {
    src: [{ url: "nunito_sans/nunito-sans-variable.woff2", format: "woff2" }],
    fallback: "sans-serif",
  });
  registerChaiFont<ChaiFontBySrc>("Oswald", {
    src: [{ url: "oswald/oswald-variable.woff2", format: "woff2" }],
    fallback: "sans-serif",
  });
};
