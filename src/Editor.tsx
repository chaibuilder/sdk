import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import { ChaiBlock, ChaiBuilderEditor, getBlocksFromHTML } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { useState } from "react";
import axios from "axios";
import { LayersIcon } from "lucide-react";
import { registerChaiDataProvider } from "@chaibuilder/runtime";

loadWebBlocks();

registerChaiDataProvider("blogs", {
  name: "Blogs",
  description: "This is a description",
  // @ts-ignore
  dataFn: async () => {
    const response = await fetch("https://api.restful-api.dev/objects/7");
    return await response.json();
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
      // askAiCallBack={async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[]) => {
      //   console.log("askAiCallBack", type, prompt, blocks);
      //   return { blocks: [], usage: { completionTokens: 151, promptTokens: 227, totalTokens: 378 } };
      // }}
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
                  _type: "Heading",
                  content: "Footer",
                  _id: "footer",
                  level: "h1",
                  styles: "#styles:,text-center text-2xl font-bold",
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
