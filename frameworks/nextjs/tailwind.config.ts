import { getChaiBuilderTailwindConfig } from "@chaibuilder/sdk/utils";

export default getChaiBuilderTailwindConfig({
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
});
