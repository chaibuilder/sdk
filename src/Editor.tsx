import { lsAiContextAtom, lsBlocksAtom, lsThemeAtom } from "@/_demo/atoms-dev";
import { bluePreset, greenPreset, orangePreset } from "@/_demo/THEME_PRESETS";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML } from "@/core/main";
import { extendChaiBuilder } from "@/extentions";
import { SavePageData } from "@/types/chaibuilder-editor-props";
import { loadWebBlocks } from "@/web-blocks";
import axios from "axios";
import { useAtom } from "jotai";
import { isArray, map, pick } from "lodash-es";
import { useEffect, useState } from "react";
import { EXTERNAL_DATA } from "./_demo/EXTERNAL_DATA";

loadWebBlocks();
extendChaiBuilder();

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme, setTheme] = useAtom(lsThemeAtom);

  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries, setUiLibraries] = useState([]);

  useEffect(() => {
    setTimeout(() => {
      setUiLibraries([
        { id: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
        { id: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
      ]);
    }, 500);
  }, []);

  return (
    <ChaiBuilderEditor
      permissions={null}
      // permissions={[]}
      pageExternalData={EXTERNAL_DATA}
      fallbackLang="en"
      languages={["fr"]}
      themePresets={[{ orange: orangePreset }, { green: greenPreset }, { blue: bluePreset }]}
      theme={theme}
      autoSaveSupport={false}
      autoSaveInterval={15}
      blocks={blocks}
      onSave={async ({ blocks, theme }: SavePageData) => {
        console.log("onSave", blocks, theme);
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-theme", JSON.stringify(theme));
        setTheme(theme);
        await new Promise((resolve) => setTimeout(resolve, 100));
        return true;
      }}
      saveAiContextCallback={async (aiContext: string) => {
        setAiContext(aiContext);
        return true;
      }}
      aiContext={aiContext}
      askAiCallBack={async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[], lang: string = "") => {
        console.log("askAiCallBack", type, prompt, blocks, lang);
        return {
          blocks: map(blocks, (b) => ({
            ...pick(b, ["_id"]),
          })),
          usage: { completionTokens: 151, promptTokens: 227, totalTokens: 378 },
        };
      }}
      getUILibraryBlock={async (uiLibrary, uiLibBlock) => {
        const response = await axios.get(
          uiLibrary.url + (!uiLibBlock.path ? "/" + uiLibBlock.uuid + ".html" : "/blocks/" + uiLibBlock.path),
        );
        const html = await response.data;
        const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
        return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary) => {
        try {
          const response = await axios.get(uiLibrary.url + "/blocks.json");
          const blocks = await response.data;
          return blocks.map((b) => ({ ...b, preview: uiLibrary.url.replace("chaiblocks", "") + b.preview }));
        } catch (error) {
          return [];
        }
      }}
      uiLibraries={uiLibraries}
      getPartialBlockBlocks={async (partialBlockKey: string) => {
        const blocks =
          partialBlockKey === "partial"
            ? [
                {
                  _type: "Box",
                  _id: "header",
                  tag: "div",
                  styles: "#styles:,flex flex-col items-center justify-center h-96",
                },
                {
                  _type: "Span",
                  content: "Span 2",
                  _id: "span",
                  _parent: "header",
                  styles: "#styles:,text-center text-3xl font-bold p-4 bg-gray-100",
                },
                {
                  _type: "Heading",
                  content: "Heading 1",
                  _id: "heading",
                  _parent: "header",
                  styles: "#styles:,text-center text-3xl font-bold p-4 bg-gray-100",
                },
              ]
            : [
                {
                  styles:
                    "#styles:,flex w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-md dark:bg-gray-800",
                  tag: "div",
                  backgroundImage: "",
                  _type: "Box",
                  _id: "rnqzul",
                  _name: "Box",
                },
              ];
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(blocks);
          }, 100);
        });
      }}
      getPartialBlocks={async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              header: {
                type: "GlobalBlock",
                name: "Header",
                description: "Header",
              },
              footer: {
                type: "GlobalBlock",
                name: "Footer",
                description: "Footer",
              },
              partial: {
                type: "PartialBlock",
                name: "Partial Name here",
                description: "Partial",
              },
            });
          }, 1000);
        });
      }}
      pageTypes={[{ key: "page", name: "Pages" }]}
      searchPageTypeItems={async (pageTypeKey: string, query: string | string[]) => {
        console.log("searchPageTypeItems", pageTypeKey, query, "query");
        if (pageTypeKey === "page") {
          const items = [
            { id: "uuid-1", name: "Page 1", slug: "/page-1" },
            { id: "uuid-2", name: "Page 2" },
            { id: "uuid-3", name: "About", slug: "/about" },
            { id: "uuid-4", name: "Contact" },
          ];
          await new Promise((r) => setTimeout(r, 500));
          return items.filter((item) => {
            if (isArray(query)) return query?.includes(item.id);
            return item.name.toLowerCase().includes(query.toString().toLowerCase());
          });
        }
        return [];
      }}
    />
  );
}

export default ChaiBuilderDefault;
