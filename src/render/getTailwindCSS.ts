import { replace } from "lodash-es";
import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { getChaiBuilderTheme } from "../tailwind/getChaiBuilderTheme.ts";
import { chaiBuilderPlugin } from "../tailwind";
import { ChaiBuilderThemeOptions } from "../core/types/chaiBuilderEditorProps.ts";
import { defaultThemeOptions } from "../core/hooks/defaultThemeOptions.ts";

async function getTailwindCSS(
  themeOptions: ChaiBuilderThemeOptions,
  markupString: string[],
  safelist: string[] = [],
  prefix: string = "",
  includeBaseStyles: boolean,
) {
  const tailwind = createTailwindcss({
    tailwindConfig: {
      darkMode: "class",
      safelist,
      theme: { extend: getChaiBuilderTheme(themeOptions) },
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

const getBlocksTailwindCSS = (
  blocks: ChaiBlock[],
  themeOptions: ChaiBuilderThemeOptions,
  includeBaseStyles: boolean,
) => {
  return getTailwindCSS(themeOptions, [replace(JSON.stringify(blocks), /#styles:,?/g, "")], [], "", includeBaseStyles);
};

export const getStylesForBlocks = async (
  blocks: ChaiBlock[],
  themeOptions: ChaiBuilderThemeOptions = defaultThemeOptions,
  includeBaseStyles: boolean = false,
): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, themeOptions, includeBaseStyles);
};
