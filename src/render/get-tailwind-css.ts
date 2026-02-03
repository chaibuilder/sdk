import { ChaiBlock } from "@/types/common";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import twContainer from "@tailwindcss/container-queries";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import autoprefixer from 'autoprefixer';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { chaiBuilderPlugin, getChaiBuilderTheme } from "../utils";
import { filterDuplicateStyles } from "./styles-helper";


async function getTailwindCSS(markupString: string[], safelist: string[] = [], includeBaseStyles: boolean = false) {
  const result = await postcss([
    tailwindcss({
      darkMode: "class",
      safelist,
      theme: {
        // @ts-ignore
        extend: {
          ...getChaiBuilderTheme(),
          keyframes: {
            "accordion-down": {
              from: {
                height: "0",
              },
              to: {
                height: "var(--radix-accordion-content-height)",
              },
            },
            "accordion-up": {
              from: {
                height: "var(--radix-accordion-content-height)",
              },
              to: {
                height: "0",
              },
            },
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
          },
        },
      },
      plugins: [twForms, twTypography, twAspectRatio, twContainer, chaiBuilderPlugin],
      corePlugins: { preflight: false },
      content: [{ raw: `<div>${markupString}</div>`, extension: 'html' }],
    }),
    autoprefixer(),
  ]).process(includeBaseStyles ? `@tailwind base; @tailwind components; @tailwind utilities;` : `@tailwind components; @tailwind utilities;`, {
    from: undefined,
  })

  const styles = result.css
  const filteredStyles = await filterDuplicateStyles(styles)
  return filteredStyles;
}

/**
 * Get the tailwind css for the blocks
 * @param blocks - The blocks to get the tailwind css for
 * @param includeBaseStyles - Whether to include the base styles
 * @returns The tailwind css for the blocks
 */
const getBlocksTailwindCSS = (blocks: ChaiBlock[], includeBaseStyles: boolean) => {
  const blocksString = JSON.stringify(blocks, null, 2).replace(
    /#styles:([^"]*)/g,
    (_match, content) => {
      return content
        .replace(/#styles:,/g, '')
        .replace(/#styles:/g, '')
        .replace(/^,/g, '')
    }
  )
  return getTailwindCSS([blocksString], [], includeBaseStyles);
};

/**
 * Get the tailwind css for the blocks
 * @param blocks - The blocks to get the tailwind css for
 * @param includeBaseStyles - Whether to include the base styles
 * @returns The tailwind css for the blocks
 */
export const getStylesForBlocks = async (blocks: ChaiBlock[], includeBaseStyles: boolean = false): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, includeBaseStyles);
};
