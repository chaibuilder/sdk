import { createTailwindcss } from "@mhsdesign/jit-browser-tailwindcss";
import twAspectRatio from "@tailwindcss/aspect-ratio";
import twContainer from "@tailwindcss/container-queries";
import twForms from "@tailwindcss/forms";
import twTypography from "@tailwindcss/typography";
import { defaultThemeOptions } from "../core/hooks/defaultThemeOptions.ts";
import { ChaiBlock } from "../core/types/ChaiBlock.ts";
import { ChaiBuilderThemeOptions } from "../core/types/chaiBuilderEditorProps.ts";
import { chaiBuilderPlugin } from "../tailwind";
import { getChaiBuilderTheme } from "../tailwind/getChaiBuilderTheme.ts";

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
      plugins: [twForms, twTypography, twAspectRatio, twContainer, chaiBuilderPlugin],
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
  const blocksString = JSON.stringify(blocks).replace(/#styles:([^"]*)/g, (_match, content) => {
    return `#styles:${content.replace(/,/g, " ")}`.replace(/#styles:/g, "");
  });
  return getTailwindCSS(themeOptions, [blocksString], [], "", includeBaseStyles);
};

export const getStylesForBlocks = async (
  blocks: ChaiBlock[],
  themeOptions: ChaiBuilderThemeOptions = defaultThemeOptions,
  includeBaseStyles: boolean = false,
): Promise<string> => {
  return await getBlocksTailwindCSS(blocks, themeOptions, includeBaseStyles);
};
