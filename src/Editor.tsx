import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { ChaiBlock, ChaiBuilderEditor } from "./core/main";
import { loadWebBlocks } from "./blocks/web";
import "./__dev/data-providers/data";
import { ChaiBuilderAI } from "./ai";

loadWebBlocks();

const websiteDescription = "Chai Builder is an open source visual builder for websites.";
const cbAi = new ChaiBuilderAI(websiteDescription, import.meta.env.VITE_OPENAI_API_KEY as string);

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

  return (
    <ChaiBuilderEditor
      unsplashAccessKey={"XgYBCm-XCHecRMsbfhw6oZWGkltco1U5TYMEd0LXZeA"}
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
        const response = await cbAi.askAi(prompt, blocks);
        console.log("response", response);
        return response;
      }}
    />
  );
}

export default ChaiBuilderDefault;
