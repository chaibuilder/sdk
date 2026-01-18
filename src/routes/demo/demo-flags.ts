import { registerChaiFeatureFlags } from "@/runtime/index";

/**
 * Register demo feature flags for testing purposes
 */
export const registerDemoFeatureFlags = () => {
  registerChaiFeatureFlags({
    "enable-reset-styles": {
      description: "Enable reset styles",
    },
  });
};
