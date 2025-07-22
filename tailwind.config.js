import { getChaiBuilderTailwindConfig } from "./src/tailwind/get-chai-builder-tailwind-config";

// In Tailwind v4, the config structure has changed but we're still using our custom function
// that handles the appropriate configuration for v4
export default getChaiBuilderTailwindConfig(["./index.html", "./src/**/*.{js,ts,jsx,tsx}"]);
