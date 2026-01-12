import { registerChaiFeatureFlag } from "@/core/main";

export const registerPagesFeatureFlags = () => {
  registerChaiFeatureFlag("dynamic-page-selector", {
    description: "Dynamic page selector",
  });
  registerChaiFeatureFlag("enable-add-page-dropdown", {
    description: "Enable add page dropdown",
  });
};
