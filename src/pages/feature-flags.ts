import { registerChaiFeatureFlag } from "@/core/main";

export const registerPagesFeatureFlags = () => {
  registerChaiFeatureFlag("dynamic-page-selector", {
    description: "Dynamic page selector",
  });
  registerChaiFeatureFlag("enable-add-page-dropdown", {
    description: "Enable add page dropdown",
  });
  registerChaiFeatureFlag("enable-ai-chat-panel", {
    description: "Enable AI chat panel",
  });
};
