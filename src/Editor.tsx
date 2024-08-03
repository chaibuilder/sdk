import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { ChaiBlock, ChaiBuilderEditor } from "./core/main";
import { loadWebBlocks } from "./blocks/web";
import "./__dev/data-providers/data";
import { ChaiBuilderAI } from "./ai";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";

loadWebBlocks();

const cbAi = new ChaiBuilderAI("", import.meta.env.VITE_OPENAI_API_KEY as string);

let PreviewMessage = () => {
  const { t } = useTranslation();
  return (
    <div className={"text-sm font-normal"}>
      {t("dev_mode_message")}{" "}
      <a target={"_blank"} className="text-orange-500 underline" href={"/preview"}>
        /preview
      </a>{" "}
      {t("to_see_page_preview")}
    </div>
  );
};

function ChaiBuilderDefault() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [aiContext, setAiContext] = useAtom(lsAiContextAtom);

  return (
    <ChaiBuilderEditor
      unsplashAccessKey={import.meta.env.VITE_UNSPLASH_ACCESS_KEY}
      showDebugLogs={true}
      autoSaveSupport={false}
      previewComponent={PreviewMessage}
      topBarComponents={{ left: [PreviewMessage] }}
      blocks={blocks}
      brandingOptions={brandingOptions}
      onSave={async ({ blocks, providers, brandingOptions }: any) => {
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-providers", JSON.stringify(providers));
        localStorage.setItem("chai-builder-branding-options", JSON.stringify(brandingOptions));
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      }}
      askAiCallBack={async (prompt: string, blocks: ChaiBlock[]) => {
        cbAi.set("websiteDescription", aiContext);
        return await cbAi.askAi(prompt, blocks);
      }}
      saveAiContextCallback={async (aiContext: string) => {
        console.log("context", aiContext);
        setAiContext(aiContext);
        return true;
      }}
      aiContext={aiContext}
      // @ts-ignore
      getExternalPredefinedBlock={async (block) => {
        const response = await fetch("https://chaibuilder.com/preline/" + block.uuid + ".html");
        const html = await response.text();
        const htmlWithoutChaiStudio = html.replace(/<chaistudio>([\s\S]*?)<\/chaistudio>/g, "");

        return getBlocksFromHTML(htmlWithoutChaiStudio) as ChaiBlock[];
      }}
      // @ts-ignore
      getUILibraryBlocks={async () => {
        const blocks = await fetch("https://chaibuilder.com/preline/blocks.json");
        return (await blocks.json()).map((b) => ({ ...b, preview: "https://chaibuilder.com" + b.preview }));
      }}
    />
  );
}

export default ChaiBuilderDefault;
