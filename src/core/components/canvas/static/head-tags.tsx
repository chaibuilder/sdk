import {
  getChaiThemeOptions,
  getThemeCustomFontFace,
  getThemeFontsUrls,
} from "@/core/components/canvas/static/chai-theme-helpers";
import { CssThemeVariables } from "@/core/components/css-theme-var";
import { useFrame } from "@/core/frame";
import { useDarkMode, useSelectedBlockIds, useSelectedStylingBlocks } from "@/core/hooks";
import { useTheme, useThemeOptions } from "@/core/hooks/use-theme";
import { ChaiBuilderThemeValues } from "@/types/types";
import { useRegisteredFonts } from "@chaibuilder/runtime";
import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";
import { filter, get, has, map } from "lodash-es";
import { useEffect, useMemo } from "react";
import plugin from "tailwindcss/plugin";

export const HeadTags = () => {
  console.log("HeadTags");
  const [chaiTheme] = useTheme();
  const chaiThemeOptions = useThemeOptions();
  const [darkMode] = useDarkMode();
  const { document: iframeDoc, window: iframeWin } = useFrame();

  useEffect(() => {
    if (darkMode) iframeDoc?.documentElement.classList.add("dark");
    else iframeDoc?.documentElement.classList.remove("dark");
  }, [darkMode, iframeDoc]);

  useEffect(() => {
    // @ts-ignore
    if (!iframeWin || !iframeWin.tailwind) return;
    // @ts-ignore
    iframeWin.tailwind.config = {
      darkMode: "class",
      theme: {
        extend: {
          container: {
            center: true,
            padding: "1rem",
            screens: {
              "2xl": "1400px",
            },
          },
          ...getChaiThemeOptions(chaiThemeOptions),
        },
      },

      plugins: [
        typography,
        forms,
        aspectRatio,
        containerQueries,
        plugin(function ({ addBase, theme }: any) {
          addBase({
            "h1,h2,h3,h4,h5,h6": {
              fontFamily: theme("fontFamily.heading"),
            },
            body: {
              fontFamily: theme("fontFamily.body"),
              color: theme("colors.foreground"),
              backgroundColor: theme("colors.background"),
            },
          });
        }),
      ],
    };
  }, [chaiTheme, chaiThemeOptions, iframeWin]);

  return (
    <>
      <CssThemeVariables theme={chaiTheme as ChaiBuilderThemeValues} />
      <Fonts />
      <SelectedBlocks />
      <SelectedStylingBlocks />
      <BlockSelectionHighlighter />
    </>
  );
};

const BlockSelectionHighlighter = () => {
  const [selectedBlockIds] = useSelectedBlockIds();
  const styles = useMemo(() => {
    return `${map(selectedBlockIds, (id) => `[data-block-id="${id}"]`).join(",")}{
                outline: 1px solid #42a1fc !important; outline-offset: -1px;
            }`;
  }, [selectedBlockIds]);
  return <style id="highlighted-block" dangerouslySetInnerHTML={{ __html: styles }} />;
};

const SelectedStylingBlocks = () => {
  const [selectedStylingBlocks] = useSelectedStylingBlocks();
  const styles = useMemo(() => {
    return `${map(selectedStylingBlocks, ({ id }: any) => `[data-style-id="${id}"]`).join(",")}{
                outline: 1px solid #29e503 !important; outline-offset: -1px;
            }`;
  }, [selectedStylingBlocks]);
  return <style id="selected-styling-blocks" dangerouslySetInnerHTML={{ __html: styles }} />;
};

const SelectedBlocks = () => {
  const [selectedBlockIds] = useSelectedBlockIds();
  const styles = useMemo(() => {
    return `${map(selectedBlockIds, (id) => `[data-block-id="${id}"]`).join(",")}{
                outline: 1px solid #42a1fc !important; outline-offset: -1px;
            }`;
  }, [selectedBlockIds]);
  return <style id="selected-blocks" dangerouslySetInnerHTML={{ __html: styles }} />;
};

const Fonts = () => {
  const [chaiTheme] = useTheme();
  const registeredFonts = useRegisteredFonts();
  const pickedFonts = useMemo(() => {
    const { heading, body } = {
      heading: get(chaiTheme, "fontFamily.heading"),
      body: get(chaiTheme, "fontFamily.body"),
    };
    return registeredFonts.filter((font) => font.family === heading || font.family === body);
  }, [chaiTheme?.fontFamily, registeredFonts]);

  const fonts = useMemo(() => getThemeFontsUrls(filter(pickedFonts, (font) => has(font, "url"))), [pickedFonts]);
  const customFonts = useMemo(
    () => getThemeCustomFontFace(filter(pickedFonts, (font) => has(font, "src"))),
    [pickedFonts],
  );
  return (
    <>
      {fonts.map((font, index) => (
        <link key={`google-font-${index}`} rel="stylesheet" href={font} />
      ))}
      <style id="chai-custom-fonts" dangerouslySetInnerHTML={{ __html: customFonts }} />
    </>
  );
};
