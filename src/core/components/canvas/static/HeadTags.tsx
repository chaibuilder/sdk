import { get, map } from "lodash-es";
import { useEffect, useState } from "react";
import { useFrame } from "../../../frame";
import { tailwindcssPaletteGenerator } from "@bobthered/tailwindcss-palette-generator";
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
// @ts-ignore

export const HeadTags = ({ model }: { model: string }) => {
  const [brandingOptions] = useBrandingOptions();
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

  const headingFont: string = get(brandingOptions, "headingFont", "DM Sans");
  const bodyFont: string = get(brandingOptions, "bodyFont", "DM Sans");

  useEffect(() => {
    const primary = get(brandingOptions, "primaryColor", "#000");
    const secondary = get(brandingOptions, "secondaryColor", "#FFF");
    const colors = tailwindcssPaletteGenerator({
      colors: [primary, secondary],
      names: ["primary", "secondary"],
    });
    colors.primary.DEFAULT = primary;
    colors.secondary.DEFAULT = secondary;

    const borderRadius = get(brandingOptions, "roundedCorners", "0");
    // @ts-ignore
    if (!iframeWin || !iframeWin.tailwind) return;
    // @ts-ignore
    iframeWin.tailwind.config = {
      darkMode: "class",
      theme: {
        fontFamily: {
          heading: [headingFont],
          body: [bodyFont],
        },
        extend: {
          borderRadius: {
            global: `${!borderRadius ? "0" : borderRadius}px`,
          },
          colors,
        },
      },

      plugins: [
        typography,
        forms,
        aspectRatio,
        iframeWin.tailwind.plugin.withOptions(() => ({ addVariant, e }: any) => {
          addVariant("hs-accordion-active", [
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active.${e(`hs-accordion-active${separator}${className}`)}`;
              });
            },
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active > .${e(`hs-accordion-active${separator}${className}`)}`;
              });
            },
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active > .hs-accordion-toggle .${e(
                  `hs-accordion-active${separator}${className}`,
                )}`;
              });
            },
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active > .hs-accordion-heading > .hs-accordion-toggle .${e(
                  `hs-accordion-active${separator}${className}`,
                )}`;
              });
            },
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active > .hs-accordion-toggle.${e(
                  `hs-accordion-active${separator}${className}`,
                )}`;
              });
            },
            ({ modifySelectors, separator }) => {
              modifySelectors(({ className }) => {
                return `.hs-accordion.active > .hs-accordion-heading > .hs-accordion-toggle.${e(
                  `hs-accordion-active${separator}${className}`,
                )}`;
              });
            },
          ]);
          addVariant("hs-accordion-selected", ({ modifySelectors, separator }) => {
            modifySelectors(({ className }) => {
              return `.hs-accordion .selected.${e(`hs-accordion-selected${separator}${className}`)}`;
            });
          });
        }),
      ],
    };
  }, [brandingOptions, iframeWin, headingFont, bodyFont]);

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
      ? `[data-style-id="${highlightedId}"]{ outline: 1px solid red !important; outline-offset: -1px;}`
      : "";
  }, [highlightedId, selectedBlockIds, highlightedBlockStyle]);

  useEffect(() => {
    if (!selectedStylingBlocks) return;
    selectedStylingBlocks.textContent = `${map(stylingBlockIds, ({ id }: any) => `[data-style-id="${id}"]`).join(",")}{
                outline: 1px solid orange !important; outline-offset: -1px;
            }`;
  }, [stylingBlockIds, selectedStylingBlocks]);

  // set body background color
  useEffect(() => {
    const textLight = get(brandingOptions, "bodyTextLightColor", "#64748b");
    const textDark = get(brandingOptions, "bodyTextDarkColor", "#94a3b8");
    const bgLight = get(brandingOptions, "bodyBgLightColor", "#FFFFFF");
    const bgDark = get(brandingOptions, "bodyBgDarkColor", "#0f172a");
    // @ts-ignore
    iframeDoc.body.className = `font-body antialiased text-[${textLight}] bg-[${bgLight}] dark:text-[${textDark}] dark:bg-[${bgDark}]`;
  }, [brandingOptions, iframeDoc, model]);

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
