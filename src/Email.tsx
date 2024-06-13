import { ChaiBuilderEditor, useBrandingOptions } from "./core/main";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBrandingOptionsAtom, lsEmailBlocksAtom } from "./atoms-dev.ts";
import { MobileIcon } from "@radix-ui/react-icons";
import { loadEmailBlocks } from "./blocks/email";
import { useBlocksStore } from "./core/history/useBlocksStoreUndoableActions.ts";
import ExportModal from "./Export.tsx";
import { renderEmail } from "./email/functions.tsx";

loadEmailBlocks();

const PreviewMessage = () => {
  const { t } = useTranslation();
  return <div className={"text-sm font-normal"}>{t("This is an awesome Email Builder")}</div>;
};

const BREAKPOINTS = [
  {
    title: "Mobile",
    content: "Mobile email client",
    breakpoint: "xs",
    icon: <MobileIcon />,
    width: 400,
  },
  {
    title: "Email Client",
    content: "Content as seen  inside an email client",
    breakpoint: "sm",
    icon: <MobileIcon className={"rotate-90"} />,
    width: 800,
  },
];

const ExportBtn = () => {
  const { t } = useTranslation();
  const [blocks] = useBlocksStore();
  const [brandingOptions] = useBrandingOptions();
  const exportHTML = async () => {
    return renderEmail(blocks, brandingOptions);
  };
  return <ExportModal content={t("Export")} handleClick={() => exportHTML()} />;
};

function ChaiBuilderEmail() {
  const [blocks, setBlocks] = useAtom(lsEmailBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);

  return (
    <ChaiBuilderEditor
      importHTMLSupport={false}
      // @ts-ignore
      breakpoints={BREAKPOINTS}
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

export default ChaiBuilderEmail;
