import axios from "axios";
import { useAtom } from "jotai";
import { isArray, map, pick, values } from "lodash-es";
import { useState } from "react";
import { lsAiContextAtom, lsBlocksAtom, lsThemeAtom } from "./_demo/atoms-dev.ts";
import GalleryWidget from "./_demo/CustomWidget.tsx";
import { bluePreset, greenPreset, orangePreset } from "./_demo/THEME_PRESETS.ts";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML, PERMISSIONS } from "./core/main";
import "./extentions";
import { SavePageData } from "./types/chaibuilder-editor-props.ts";
import { loadWebBlocks } from "./web-blocks";

loadWebBlocks();

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme, setTheme] = useAtom(lsThemeAtom);

  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { id: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
    { id: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
  ]);

  return (
    <ChaiBuilderEditor
      permissions={[...values(PERMISSIONS)]}
      // permissions={[]}
      pageExternalData={{
        vehicle: {
          title: "Hyundai i20 Active - 1.0 MPI - 2015",
          description:
            "Hyundai i20 Active - 1.0 MPI - 2015, 100000km, Petrol, Manual, 5 doors, 5 seats. This is a description of my vehicle. It is a car.",
          price: "$2000",
          image: "https://picsum.photos/400/200",
          link: "https://www.google.com",
        },
        global: {
          siteName: "My Site",
          twitterHandle: "@my-twitter-handle",
          description: "This is a description of my page",
        },
      }}
      rjsfWidgets={{ gallery: GalleryWidget }}
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
