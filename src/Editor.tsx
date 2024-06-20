import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBlocksAtom, lsBrandingOptionsAtom, lsProvidersAtom } from "./atoms-dev.ts";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
import { ChaiBuilderEditor } from "./core/main";
import "./blocks/web";
import "./data-providers/data";
import { CodeIcon } from "@radix-ui/react-icons";
import { find } from "lodash";

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
  const [providers] = useAtom(lsProvidersAtom);
  return (
    <ChaiBuilderEditor
      dataBindingSupport={true}
      // @ts-ignore
      getExternalPredefinedBlock={async () => {
        return getBlocksFromHTML(`<div class="bg-red-300"><p>Hello World</p></div>`);
      }}
      getUILibraryBlocks={async () => {
        return [
          {
            uuid: "hero-uuid",
            name: "Header",
            group: "Hero",
            preview: "https://via.placeholder.com/350/100",
          },
        ];
      }}
      outlineMenuItems={[
        {
          item: (blockId: string) => (
            <CodeIcon onClick={() => console.log("blockId", find(blocks, { _id: blockId }))} />
          ),
          tooltip: "export Code",
        },
      ]}
      topBarComponents={{ left: [PreviewMessage] }}
      blocks={blocks}
      dataProviders={providers}
      brandingOptions={brandingOptions}
      onSavePage={async ({ blocks, providers }: any) => {
        localStorage.setItem("chai-builder-blocks", JSON.stringify(blocks));
        localStorage.setItem("chai-builder-providers", JSON.stringify(providers));
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      }}
      onSaveBrandingOptions={async (options: any) => {
        localStorage.setItem("chai-builder-branding-options", JSON.stringify(options));
        return true;
      }}
    />
  );
}

export default ChaiBuilderDefault;
