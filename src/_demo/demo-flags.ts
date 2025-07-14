import { registerChaiFeatureFlags } from "../core/flags/register-chai-flag";

/**
 * Register demo feature flags for testing purposes
 */
export const registerDemoFeatureFlags = () => {
  registerChaiFeatureFlags({
    "enable-reset-styles": {
      description: "Enable reset styles",
    },
    "ai-chat-left": {
      description: "Show AI chat on the left side",
    },
  });
};
