import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { useState } from "react";
import axios from "axios";
import { LayersIcon } from "lucide-react";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SingleLineText } from "@chaibuilder/runtime/controls";
import { get } from "lodash-es";
import { map, pick } from "lodash-es";

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
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "meraki-ui", name: "Meraki UI", url: "https://chai-ui-blocks.vercel.app" },
    { uuid: "chaiblocks", name: "UI Blocks", url: "https://chaibuilder.com/chaiblocks" },
  ]);
  return (
    <ChaiBuilderEditor
      fallbackLang="fr"
      languages={["en"]}
      unsplashAccessKey={"import.meta.env.VITE_UNSPLASH_ACCESS_KEY"}
      showDebugLogs={true}
      autoSaveSupport={false}
      previewComponent={PreviewWeb}
      blocks={blocks}
      brandingOptions={brandingOptions}
      onSave={async ({ blocks, providers, brandingOptions }: any) => {
        console.log(blocks, providers, brandingOptions);
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-providers", JSON.stringify(providers));
        localStorage.setItem("chai-builder-branding-options", JSON.stringify(brandingOptions));
        await new Promise((resolve) => setTimeout(resolve, 2000));
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
            content: `AI Generated Content with current time ${new Date().toISOString()}`,
          })),
          usage: { completionTokens: 151, promptTokens: 227, totalTokens: 378 },
        };
      }}
      uploadMediaCallback={async () => {
        return { url: "https://picsum.photos/200" };
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
        top: [
          {
            icon: <LayersIcon size={20} />,
            label: "SEO Panel",
            component: () => <div>SEO Panel</div>,
          },
        ],
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
                {
                  styles: "#styles:,bg-primary-500 flex w-12 items-center justify-center",
                  tag: "div",
                  backgroundImage: "",
                  _type: "Box",
                  _id: "nuxByk",
                  _name: "Box",
                  _parent: "rnqzul",
                },
                {
                  styles: "#styles:, w-24px h-24px h-6 w-6 fill-current text-white",
                  icon: "<svg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'><path d='M20 3.33331C10.8 3.33331 3.33337 10.8 3.33337 20C3.33337 29.2 10.8 36.6666 20 36.6666C29.2 36.6666 36.6667 29.2 36.6667 20C36.6667 10.8 29.2 3.33331 20 3.33331ZM21.6667 28.3333H18.3334V25H21.6667V28.3333ZM21.6667 21.6666H18.3334V11.6666H21.6667V21.6666Z'></path></svg>",
                  width: "",
                  height: "",
                  _type: "Icon",
                  _id: "yBzaww",
                  _parent: "nuxByk",
                },
                {
                  styles: "#styles:,-mx-3 px-4 py-2",
                  tag: "div",
                  backgroundImage: "",
                  _type: "Box",
                  _id: "vpsyBs",
                  _name: "Box",
                  _parent: "rnqzul",
                },
                {
                  styles: "#styles:,mx-3",
                  tag: "div",
                  backgroundImage: "",
                  _type: "Box",
                  _id: "qpmfDy",
                  _name: "Box",
                  _parent: "vpsyBs",
                },
                {
                  styles: "#styles:,text-primary-500 dark:text-primary-400 font-semibold",
                  content: "Info",
                  _type: "Span",
                  _id: "aiozhz",
                  _parent: "qpmfDy",
                },
                {
                  styles: "#styles:,text-sm text-gray-600 dark:text-gray-200",
                  content: " This channel archived by the owner! ",
                  _type: "Paragraph",
                  _id: "wzntdv",
                  _parent: "qpmfDy",
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
    />
  );
}

export default ChaiBuilderDefault;
