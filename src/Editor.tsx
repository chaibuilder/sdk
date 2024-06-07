import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBlocksAtom, lsBrandingOptionsAtom, lsContainer, lsProvidersAtom } from "./atoms-dev.ts";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
import { PredefinedBlock } from "./core/types/CoreBlock.ts";
import { ChaiBuilderEditor } from "./core/main";
import "./blocks/web";
import "./data-providers/data";

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
  const [blocks, setBlocks] = useAtom(lsBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [providers, setProviders] = useAtom(lsProvidersAtom);
  const [container, setContainer] = useAtom(lsContainer);

  return (
    <ChaiBuilderEditor
      // @ts-ignore
      dataBindingSupport={true}
      getExternalPredefinedBlock={async (block: PredefinedBlock) => {
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
      topBarComponents={{ left: [PreviewMessage] }}
      blocks={blocks}
      dataProviders={providers}
      brandingOptions={brandingOptions}
      onSavePage={async ({ blocks, providers }: any) => {
        setBlocks(blocks);
        setProviders(providers);
        return true;
      }}
      onSaveBrandingOptions={async (options: any) => {
        setBrandingOptions(options);
        return true;
      }}
      container={container || "Body"}
      onSaveContainer={async (container: any) => {
        setContainer(container);
        return true;
      }}
    />
  );
}

export default ChaiBuilderDefault;
