import { useAtom } from "jotai";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { ChaiBlock, ChaiBuilderEditor } from "./core/main";
import { loadWebBlocks } from "./web-blocks";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
import { useState } from "react";
import { UILibrary, UiLibraryBlock } from "./core/types/chaiBuilderEditorProps.ts";
import PreviewWeb from "./__dev/preview/WebPreview.tsx";
import axios from "axios";
import CustomLayout from "./__dev/CustomLayout.tsx";
import ptBR from "./__dev/pt-BR.json";
import es from "./__dev/es.json";

loadWebBlocks();

function ChaiBuilderCustom() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);
  const [uiLibraries] = useState([
    { uuid: "community-blocks", name: "Community blocks", url: "https://community-blocks.vercel.app" },
  ]);
  return (
    <ChaiBuilderEditor
      locale={"pt-BR"}
      translations={{ "pt-BR": ptBR, es: es }}
      layout={CustomLayout}
      unsplashAccessKey={import.meta.env.VITE_UNSPLASH_ACCESS_KEY}
      showDebugLogs={true}
      autoSaveSupport={false}
      previewComponent={PreviewWeb}
      blocks={blocks}
      brandingOptions={brandingOptions}
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
      getUILibraryBlock={async (uiLibrary: UILibrary, uiLibBlock: UiLibraryBlock) => {
        const response = await fetch(uiLibrary.url + "/blocks/" + uiLibBlock.path);
        const html = await response.text();
        console.log(html);
        const htmlWithoutChaiStudio = html.replace(/---([\s\S]*?)---/g, "");
        return getBlocksFromHTML(`${htmlWithoutChaiStudio}`) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary: UILibrary) => {
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
