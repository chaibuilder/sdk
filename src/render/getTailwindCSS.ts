import { replace } from "lodash-es";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { ChaiBuilderTailwindTheme, getChaiBuilderTheme } from "../tailwind/getChaiBuilderTheme.ts";
import { chaiBuilderPlugin } from "../tailwind";

async function getTailwindCSS(
  theme: ChaiBuilderTailwindTheme,
  markupString: string[],
  safelist: string[] = [],
  prefix: string = "",
  includeBaseStyles: boolean = false,
) {
  const tailwind = createTailwindcss({
    tailwindConfig: {
      darkMode: "class",
      safelist,
      theme: { extend: getChaiBuilderTheme(theme) },
      plugins: [twForms, twTypography, twAspectRatio, chaiBuilderPlugin],
      corePlugins: { preflight: includeBaseStyles },
      ...(prefix ? { prefix: `${prefix}` } : {}),
    },
  });

  return await tailwind.generateStylesFromContent(
    ` ${includeBaseStyles ? "@tailwind base;" : ""}
      @tailwind components;
      @tailwind utilities;`,
    markupString,
  );
}

const getBlocksTailwindCSS = (blocks: ChaiBlock[], theme: any, includeBaseStyles: boolean = false) => {
  return getTailwindCSS(theme, [replace(JSON.stringify(blocks), /#styles:,?/g, "")], [], "", includeBaseStyles);
};

export const getStylesForBlocks = async (
  blocks: ChaiBlock[],
  theme: ChaiBuilderTailwindTheme | Record<string, string> = {},
  includeBaseStyles: boolean = true,
): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, theme, includeBaseStyles);
};
