import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom } from "./__dev/atoms-dev.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { useState } from "react";
import axios from "axios";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SingleLineText } from "@chaibuilder/runtime/controls";
import { get } from "lodash-es";
import { map, pick, isArray } from "lodash-es";
import lngPtBR from "./__dev/ptBR.json";
import { ChaiBuilderThemeOptions } from "./core/types/chaiBuilderEditorProps.ts";

loadWebBlocks();

registerChaiBlock(null, {
  type: "RSCBlock",
  label: "RSC Block",
  group: "Server",
  category: "core",
  // @ts-ignore
  server: true,
  props: {
    content: SingleLineText({ title: "Content", default: "This is a RSC Block" }),
  },
});

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
    { uuid: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
  ]);
  return (
    <ChaiBuilderEditor
      fallbackLang="fr"
      languages={["pt", "en"]}
      themeOptions={(defaultTheme: ChaiBuilderThemeOptions) => ({
        fontFamily: {
          ...defaultTheme.fontFamily,
          customFont: { "--font-new": "Inter" },
        },
        borderRadius: { "--radius": "0.375rem" },
        colors: [
          {
            group: "Body bg and fg",
            items: {
              background: { "--color-background": "#fff" },
              foreground: { "--color-foreground": "#171717" },
              warning: { "--color-warning": "#ffc107" },
            },
          },
        ],
      })}
      // theme={{
      //   fontFamily: {
      //     heading: "Inter",
      //     body: "Inter",
      //     lato: "Lato",
      //   },
      //   borderRadius: "0.375rem",
      //   colors: {
      //     background: { light: "#fff", dark: "#171717" },
      //     foreground: { light: "#171717", dark: "#fff" },
      //     primary: { light: "#007bff", dark: "#007bff" },
      //     primaryForeground: { light: "#fff", dark: "#fff" },
      //     secondary: { light: "#6c757d", dark: "#6c757d" },
      //     secondaryForeground: { light: "#fff", dark: "#fff" },
      //     success: { light: "#28a745", dark: "#28a745" },
      //     danger: { light: "#dc3545", dark: "#dc3545" },
      //     warning: { light: "#ffc107", dark: "#ffc107" },
      //     info: { light: "#17a2b8", dark: "#17a2b8" },
      //   },
      // }}
      // locale="pt"
      translations={{ pt: lngPtBR }}
      autoSaveSupport={true}
      autoSaveInterval={15}
      previewComponent={PreviewWeb}
      blocks={blocks}
      onSave={async ({ blocks, providers, brandingOptions }: any) => {
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-providers", JSON.stringify(providers));
        localStorage.setItem("chai-builder-branding-options", JSON.stringify(brandingOptions));
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
      sideBarComponents={{
        top: [],
      }}
      getRSCBlock={async (block: ChaiBlock) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(`${get(block, "content", "")}`);
          }, 2000);
        });
      }}
      getGlobalBlockBlocks={async (globalBlockKey: string) => {
        const blocks =
          globalBlockKey === "header"
            ? [
                {
                  _type: "Heading",
                  content: "Header",
                  _id: "header",
                  level: "h1",
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
          }, 1000);
        });
      }}
      getGlobalBlocks={async () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              header: {
                name: "Header",
                description: "Header",
              },
              footer: {
                name: "Footer",
                description: "Footer",
              },
            });
          }, 1000);
        });
      }}
      collections={[{ key: "pages", name: "Pages" }]}
      searchCollectionItems={async (collectionKey: string, query: string | string[]) => {
        console.log("searchCollectionItems", collectionKey, query, "query");
        if (collectionKey === "pages") {
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
