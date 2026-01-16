import { registerChaiFeatureFlag } from "@/core/flags/register-chai-flag";

export const registerPagesFeatureFlags = () => {
  registerChaiFeatureFlag("dynamic-page-selector", {
    description: "Dynamic page selector",
  });
  registerChaiFeatureFlag("enable-add-page-dropdown", {
    description: "Enable add page dropdown",
  });
};
