import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsAiContextAtom, lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { ChaiBlock, ChaiBuilderEditor } from "./core/main";
import { loadWebBlocks } from "./blocks/web";
import "./__dev/data-providers/data";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
import { useState } from "react";
import { UILibrary, UiLibraryBlock } from "./core/types/chaiBuilderEditorProps.ts";
import "./__dev/RowCol.tsx";

loadWebBlocks();

const PreviewMessage = () => {
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
  const [uiLibraries] = useState([
    { uuid: "preline", name: "Preline UI" },
    { uuid: "hero", name: "Hero" },
  ]);

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
      saveAiContextCallback={async (aiContext: string) => {
        setAiContext(aiContext);
        return true;
      }}
      aiContext={aiContext}
      getUILibraryBlock={async (uiLibrary: UILibrary, uiLibBlock: UiLibraryBlock) => {
        const response = await fetch("https://chaibuilder.com/" + uiLibrary.uuid + "/" + uiLibBlock.uuid + ".html");
        const html = await response.text();
        const htmlWithoutChaiStudio = html.replace(/<chaistudio>([\s\S]*?)<\/chaistudio>/g, "");
        return getBlocksFromHTML(htmlWithoutChaiStudio) as ChaiBlock[];
      }}
      getUILibraryBlocks={async (uiLibrary: UILibrary) => {
        try {
          const response = await fetch("https://chaibuilder.com/" + uiLibrary.uuid + "/blocks.json");
          const blocks = await response.json();
          return blocks.map((b) => ({ ...b, preview: "https://chaibuilder.com" + b.preview }));
        } catch (error) {
          return [];
        }
      }}
      uiLibraries={uiLibraries}
    />
  );
}

export default ChaiBuilderDefault;
