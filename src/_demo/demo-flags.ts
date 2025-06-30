import { registerChaiFlags } from "../core/flags/register-chai-flag";

/**
 * Register demo feature flags for testing purposes
 */
export const registerDemoFeatureFlags = () => {
  registerChaiFlags({
    "enable-smart-inputs": {
      description: "Enable intelligent input type and autocomplete functionality",
    },
    "enable-ai-assistance": {
      description: "Enable AI-powered suggestions and help while building",
    },
    "enable-advanced-styling": {
      description: "Enable additional styling options and customizations",
    },
    "enable-experimental-blocks": {
      description: "Enable access to experimental block components",
    },
    "dark-mode-editor": {
      description: "Use dark mode in the editor interface",
    },
    "dynamic-pages": {
      description: "Enable dynamic pages",
    },
  });
};
