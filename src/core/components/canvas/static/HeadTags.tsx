import { get, map } from "lodash-es";
import { useEffect, useState } from "react";
import { useFrame } from "../../../frame";
import {
  useBrandingOptions,
  useDarkMode,
  useHighlightBlockId,
  useSelectedBlockIds,
  useSelectedStylingBlocks,
} from "../../../hooks";
import { useAtom } from "jotai";
import { draggedBlockIdAtom } from "../../../atoms/ui.ts";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import { prelinePlugin } from "./Preline.ts";
import getPalette from "tailwindcss-palette-generator";
// @ts-ignore

export const HeadTags = ({ model }: { model: string }) => {
  const [customTheme] = useBrandingOptions();
  const [selectedBlockIds] = useSelectedBlockIds();
  const [darkMode] = useDarkMode();
  const [highlightedId] = useHighlightBlockId();
  const [stylingBlockIds] = useSelectedStylingBlocks();
  const [draggedBlockId] = useAtom(draggedBlockIdAtom);

  const { document: iframeDoc, window: iframeWin } = useFrame();

  const [highlightedBlockStyle] = useState(iframeDoc?.getElementById("highlighted-block") as HTMLStyleElement);
  const [selectedBlockStyle] = useState<HTMLStyleElement>(
    iframeDoc?.getElementById("selected-block") as HTMLStyleElement,
  );
  const [selectedStylingBlocks] = useState<HTMLStyleElement>(
    iframeDoc?.getElementById("selected-styling-block") as HTMLStyleElement,
  );
  const [draggedBlock] = useState<HTMLStyleElement>(iframeDoc?.getElementById("dragged-block") as HTMLStyleElement);

  useEffect(() => {
    if (darkMode) iframeDoc?.documentElement.classList.add("dark");
    else iframeDoc?.documentElement.classList.remove("dark");
  }, [darkMode, iframeDoc]);

  const headingFont: string = get(customTheme, "headingFont", "DM Sans");
  const bodyFont: string = get(customTheme, "bodyFont", "DM Sans");

  useEffect(() => {
    const primary = get(customTheme, "primaryColor", "#000");
    const secondary = get(customTheme, "secondaryColor", "#FFF");
    const BG_LIGHT_MODE = get(customTheme, "bodyBgLightColor", "#fff");
    const BG_DARK_MODE = get(customTheme, "bodyBgDarkColor", "#000");
    const TEXT_DARK_MODE = get(customTheme, "bodyTextDarkColor", "#000");
    const TEXT_LIGHT_MODE = get(customTheme, "bodyTextLightColor", "#fff");

    const palette = getPalette([
      { color: primary, name: "primary" },
      { color: secondary, name: "secondary" },
    ]);
    const colors: Record<string, string> = {
      "bg-light": BG_LIGHT_MODE,
      "bg-dark": BG_DARK_MODE,
      "text-dark": TEXT_DARK_MODE,
      "text-light": TEXT_LIGHT_MODE,
    };

    const borderRadius = get(customTheme, "roundedCorners", "0");
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
          fontFamily: {
            heading: [headingFont],
            body: [bodyFont],
          },
          borderRadius: {
            DEFAULT: `${!borderRadius ? "0" : borderRadius}px`,
          },
          colors: { ...colors, ...palette },
        },
      },

      plugins: [typography, forms, aspectRatio, iframeWin.tailwind.plugin.withOptions(() => prelinePlugin)],
    };
  }, [customTheme, iframeWin, headingFont, bodyFont]);

  useEffect(() => {
    if (!selectedBlockStyle) return;
    selectedBlockStyle.textContent = `${map(selectedBlockIds, (id) => `[data-block-id="${id}"]`).join(",")}{
                outline: 1px solid ${
                  selectedBlockIds.length === 1 ? "#42a1fc" : "orange"
                } !important; outline-offset: -1px;
            }`;
  }, [selectedBlockIds, selectedBlockStyle]);

  useEffect(() => {
    if (!draggedBlockId) {
      draggedBlock.textContent = "";
      return;
    }
    draggedBlock.textContent = `[data-block-id="${draggedBlockId}"]{ pointer-events: none !important; opacity: 0.2 !important}`;
  }, [draggedBlockId]);

  useEffect(() => {
    if (!highlightedBlockStyle) return;
    highlightedBlockStyle.textContent = highlightedId
      ? `[data-style-id="${highlightedId}"]{ outline: 1px solid #42a1fc !important; outline-offset: -1px;}`
      : "";
  }, [highlightedId, selectedBlockIds, highlightedBlockStyle]);

  useEffect(() => {
    if (!selectedStylingBlocks) return;
    selectedStylingBlocks.textContent = `${map(stylingBlockIds, ({ id }: any) => `[data-style-id="${id}"]`).join(",")}{
                outline: 1px solid #42a1fc !important; outline-offset: -1px;
            }`;
  }, [stylingBlockIds, selectedStylingBlocks]);

  // set body background color
  useEffect(() => {
    const textLight = get(customTheme, "bodyTextLightColor", "#64748b");
    const textDark = get(customTheme, "bodyTextDarkColor", "#94a3b8");
    const bgLight = get(customTheme, "bodyBgLightColor", "#FFFFFF");
    const bgDark = get(customTheme, "bodyBgDarkColor", "#0f172a");
    // @ts-ignore
    iframeDoc.body.className = `font-body antialiased text-[${textLight}] bg-[${bgLight}] dark:text-[${textDark}] dark:bg-[${bgDark}]`;
  }, [customTheme, iframeDoc, model]);

  return model === "page" ? (
    <>
      {headingFont && (
        <link
          id="heading-font"
          rel="stylesheet"
          type="text/css"
          href={`https://fonts.googleapis.com/css2?family=${headingFont.replace(
            / /g,
            "+",
          )}:wght@300;400;500;600;700;800;900&display=swap`}
          media="all"
        />
      )}
      {bodyFont && headingFont !== bodyFont && (
        <link
          id="body-font"
          rel="stylesheet"
          type="text/css"
          href={`https://fonts.googleapis.com/css2?family=${bodyFont.replace(
            / /g,
            "+",
          )}:wght@300;400;500;600;700;800;900&display=swap`}
          media="all"
        />
      )}
      {headingFont && (
        <style>{`h1,h2,h3,h4,h5,h6{font-family: "${headingFont}",ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";}`}</style>
      )}
    </>
  ) : null;
};
