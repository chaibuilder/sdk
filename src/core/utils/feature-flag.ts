import { registerChaiFeatureFlag } from "@/core/flags/register-chai-flag";


export const registerFeatureFlags = () => {
  registerChaiFeatureFlag("enable-ai-chat-left", {
    description: "Enable AI chat on the left side",
  });
};