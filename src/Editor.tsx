import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom } from "./__dev/atoms-dev.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML, ThemeOptions } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { useState } from "react";
import axios from "axios";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SingleLineText } from "@chaibuilder/runtime/controls";
import { get } from "lodash-es";
import { map, pick, isArray } from "lodash-es";
import lngPtBR from "./__dev/ptBR.json";
import { ChaiBuilderThemeOptions } from "./core/types/chaiBuilderEditorProps.ts";
import { themeValuesAtom } from "./core/atoms/theme.ts";
import { Paintbrush } from "lucide-react";

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
  const [themeValues] = useAtom(themeValuesAtom);
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
          customFont: { "--font-custom": "Inter" },
        },
        borderRadius: { "--radius": "0.5rem" },
        colors: [
          {
            group: "Base",
            items: {
              background: { "--background": "#FFFFFF" },
              foreground: { "--foreground": "#1C2127" },
            },
          },
          {
            group: "Muted",
            items: {
              muted: { "--muted": "#F1F5F9" },
              mutedForeground: { "--muted-foreground": "#64748B" },
            },
          },
          {
            group: "Card",
            items: {
              card: { "--card": "#FFFFFF" },
              cardForeground: { "--card-foreground": "#1C2127" },
            },
          },
          {
            group: "Popover",
            items: {
              popover: { "--popover": "#FFFFFF" },
              popoverForeground: { "--popover-foreground": "#1C2127" },
            },
          },
          {
            group: "Border & Input",
            items: {
              border: { "--border": "#E2E8F0" },
              input: { "--input": "#E2E8F0" },
              ring: { "--ring": "#94A3B8" },
            },
          },
          {
            group: "Primary",
            items: {
              primary: { "--primary": "#1C2127" },
              primaryForeground: { "--primary-foreground": "#F8FAFC" },
            },
          },
          {
            group: "Secondary",
            items: {
              secondary: { "--secondary": "#F1F5F9" },
              secondaryForeground: { "--secondary-foreground": "#1C2127" },
            },
          },
          {
            group: "Accent",
            items: {
              accent: { "--accent": "#F1F5F9" },
              accentForeground: { "--accent-foreground": "#1C2127" },
            },
          },
          {
            group: "Destructive",
            items: {
              destructive: { "--destructive": "#FF0000" },
              destructiveForeground: { "--destructive-foreground": "#F8FAFC" },
            },
          },
        ],
      })}
      theme={themeValues}
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
      getRSCBlock={async (block: ChaiBlock) => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(`${get(block, "content", "")}`);
          }, 2000);
        });
      }}
      sideBarComponents={{
        top: [
          {
            icon: <Paintbrush size={20} />,
            label: "Theme",
            component: () => <ThemeOptions className="w-full" />,
          },
        ],
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
