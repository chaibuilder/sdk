import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBrandingOptionsAtom, lsEmailBlocksAtom } from "./__dev/atoms-dev.ts";
import ExportModal from "./__dev/Export.tsx";
import { ChaiBuilderEmail } from "./email";

const PreviewMessage = () => {
  const { t } = useTranslation();
  return <div className={"text-sm font-normal"}>{t("This is an awesome Email Builder")}</div>;
};

const ExportBtn = () => {
  const { t } = useTranslation();
  const exportHTML = async () => {
    return "TODO: Generate email HTML";
  };
  return <ExportModal content={t("Export")} handleClick={() => exportHTML()} />;
};

function ChaiBuilderEmailView() {
  const [blocks, setBlocks] = useAtom(lsEmailBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);

  return (
    <ChaiBuilderEmail
      topBarComponents={{ left: [PreviewMessage], right: [ExportBtn] }}
      blocks={blocks}
      brandingOptions={brandingOptions}
      onSavePage={async ({ blocks }: any) => {
        setBlocks(blocks);
        localStorage.setItem("chai-builder-blocks-email", JSON.stringify(blocks));
        return true;
      }}
      onSaveBrandingOptions={async (options: any) => {
        setBrandingOptions(options);
        return true;
      }}
    />
  );
}

export default ChaiBuilderEmailView;
