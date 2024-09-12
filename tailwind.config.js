import { getChaiBuilderTailwindConfig } from "./src/tailwind/getChaiBuilderTailwindConfig.ts";

export default getChaiBuilderTailwindConfig([
  "./index.html",
  "./core/**/*.{js,ts,jsx,tsx}",
  "./src/**/*.{js,ts,jsx,tsx}",
]);
