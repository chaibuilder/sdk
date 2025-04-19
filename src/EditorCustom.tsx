import { lsAiContextAtom, lsBlocksAtom } from "@/_demo/atoms-dev";
import CustomLayout from "@/_demo/custom-layout";
import PreviewWeb from "@/_demo/preview/web-preview";
import { getBlocksFromHTML } from "@/core/import-html/html-to-json";
import { ChaiBlock, ChaiBuilderEditor } from "@/core/main";
import { ChaiUILibrary, ChaiUILibraryBlock } from "@/types/chaibuilder-editor-props";
import { loadWebBlocks } from "@/web-blocks";
import axios from "axios";
import { useAtom } from "jotai";
import { useState } from "react";
loadWebBlocks();

function ChaiBuilderCustom() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "community-blocks", name: "Community blocks", url: "https://community-blocks.vercel.app" },
  ]);
  return (
    <ChaiBuilderEditor
      locale={"pt-BR"}
      // translations={{ "pt-BR": ptBR, es: es }}
      layout={CustomLayout}
      debugLogs={true}
      autoSaveSupport={false}
      previewComponent={PreviewWeb}
      blocks={blocks}
      onSave={async ({ blocks, providers, brandingOptions }: any) => {
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
      askAiCallBack={async (type: "styles" | "content", prompt: string, blocks: ChaiBlock[]) => {
        console.log("askAiCallBack", type, prompt, blocks);
        return new Promise((resolve) => resolve({ error: new Error("Not implemented") }));
      }}
      getUILibraryBlock={async (uiLibrary: ChaiUILibrary, uiLibBlock: ChaiUILibraryBlock) => {
        const response = await fetch(uiLibrary.url + "/blocks/" + uiLibBlock.path);
        const html = await response.text();
        console.log(html);
        const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
        return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary: ChaiUILibrary) => {
        try {
          const response = await axios.get(uiLibrary.url + "/blocks.json");
          const blocks = await response.data;
          return blocks.map((b) => ({ ...b, preview: uiLibrary.url + b.preview }));
        } catch (error) {
          return [];
        }
      }}
      uiLibraries={uiLibraries}
    />
  );
}

export default ChaiBuilderCustom;
