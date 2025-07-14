import { registerChaiFeatureFlag } from "../main";


export const registerFeatureFlags = () => {
  registerChaiFeatureFlag("enable-ai-chat-left", {
    description: "Enable AI chat on the left side",
  });
};