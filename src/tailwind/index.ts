import tailwindAnimate from "tailwindcss-animate";
import { chaiBuilderTheme } from "./tailwind-config.ts";

const chaiBuilderTailwindConfig = (content: string[]) => {
  return {
    darkMode: "class",
    content: [
      ...content,
      "node_modules/@chaibuilder/sdk/dist/*.{js,cjs}",
      "node_modules/@chaibuilder/runtime/dist/*.{js,cjs}",
    ],
    theme: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      extend: chaiBuilderTheme(),
    },
    plugins: [tailwindAnimate],
  };
};

export { chaiBuilderTailwindConfig };
