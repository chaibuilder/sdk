import { map } from "lodash-es";
import { useEffect, useMemo, useState } from "react";
import { useFrame } from "../../../frame";
import { useDarkMode, useSelectedBlockIds, useSelectedStylingBlocks } from "../../../hooks";
import { useAtom } from "jotai";
import typography from "@tailwindcss/typography";
import forms from "@tailwindcss/forms";
import aspectRatio from "@tailwindcss/aspect-ratio";
import containerQueries from "@tailwindcss/container-queries";
import { draggedBlockAtom, dropTargetBlockIdAtom } from "../dnd/atoms.ts";
import plugin from "tailwindcss/plugin";
import { getChaiThemeOptions, getChaiThemeCssVariables, getThemeFontsLinkMarkup } from "./ChaiThemeFn.ts";
import { useTheme, useThemeOptions } from "../../../hooks/useTheme.ts";
import { ChaiBuilderThemeValues } from "../../../types/chaiBuilderEditorProps.ts";
import { pick } from "lodash-es";
// @ts-ignore

export const HeadTags = () => {
  const [chaiTheme] = useTheme();

  const chaiThemeOptions = useThemeOptions();
  // console.log(chaiTheme, chaiThemeOptions);
  const [selectedBlockIds] = useSelectedBlockIds();
  const [darkMode] = useDarkMode();

  const [stylingBlockIds] = useSelectedStylingBlocks();
  const [draggedBlock] = useAtom(draggedBlockAtom);
  const [dropTargetId] = useAtom(dropTargetBlockIdAtom);

  const { document: iframeDoc, window: iframeWin } = useFrame();

  const [highlightedBlockStyle] = useState(iframeDoc?.getElementById("highlighted-block") as HTMLStyleElement);
  const [selectedBlockStyle] = useState<HTMLStyleElement>(
    iframeDoc?.getElementById("selected-block") as HTMLStyleElement,
  );
  const [selectedStylingBlocks] = useState<HTMLStyleElement>(
    iframeDoc?.getElementById("selected-styling-block") as HTMLStyleElement,
  );
  const [draggedBlockStyle] = useState<HTMLStyleElement>(
    iframeDoc?.getElementById("dragged-block") as HTMLStyleElement,
  );

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

  useEffect(() => {
    if (!selectedBlockStyle) return;
    selectedBlockStyle.textContent = `${map(selectedBlockIds, (id) => `[data-block-id="${id}"]`).join(",")}{
                outline: 1px solid ${
                  selectedBlockIds.length === 1 ? "#42a1fc !important" : "orange !important"
                }; outline-offset: -1px;
            }`;
  }, [selectedBlockIds, selectedBlockStyle]);

  useEffect(() => {
    draggedBlockStyle.textContent = draggedBlock
      ? `[data-block-id="${draggedBlock._id}"], [data-block-id="${draggedBlock._id}"] > * { pointer-events: none !important; opacity: 0.6 !important}`
      : "";
  }, [draggedBlock, draggedBlockStyle]);

  useEffect(() => {
    if (!highlightedBlockStyle) return;
    highlightedBlockStyle.textContent = `[data-highlighted="true"]{ outline: 1px solid #42a1fc !important; outline-offset: -1px;}`;
  }, [highlightedBlockStyle]);

  useEffect(() => {
    if (!selectedStylingBlocks) return;
    selectedStylingBlocks.textContent = `${map(stylingBlockIds, ({ id }: any) => `[data-style-id="${id}"]`).join(",")}{
                outline: 1px solid orange !important; outline-offset: -1px;
            }`;
  }, [stylingBlockIds, selectedStylingBlocks]);

  useEffect(() => {
    iframeDoc.querySelector(`#drop-target-block`).innerHTML = dropTargetId
      ? `[data-block-id="${dropTargetId}"]{ outline: 1px dashed orange !important; outline-offset: -1px;}`
      : "";
  }, [dropTargetId, iframeDoc]);

  const themeVariables = useMemo(
    () => getChaiThemeCssVariables(chaiTheme as Partial<ChaiBuilderThemeValues>),
    [chaiTheme],
  );
  const fonts = useMemo(() => getThemeFontsLinkMarkup(pick(chaiTheme, ["fontFamily"])), [chaiTheme]);
  return (
    <>
      <style id="chai-theme">{themeVariables}</style>
      <span id="chai-fonts" dangerouslySetInnerHTML={{ __html: fonts }} />
    </>
  );
};
