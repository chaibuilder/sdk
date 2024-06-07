import { ChaiBuilderEditor, useAllBlocks } from "./core/main";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBrandingOptionsAtom, lsEmailBlocksAtom } from "./atoms-dev.ts";
import { MobileIcon } from "@radix-ui/react-icons";
import { render } from "@react-email/render";
import { RenderChaiBlocks } from "./render";
import { Head, Html, Tailwind } from "@react-email/components";
import "./blocks/email";

let PreviewMessage = () => {
  const { t } = useTranslation();
  return <div className={"text-sm font-normal"}>{t("THis is an awesome Email Builder")}</div>;
};

const BREAKPOINTS = [
  {
    title: "Mobile",
    content: "Mobile content",
    breakpoint: "xs",
    icon: <MobileIcon />,
    width: 400,
  },
  {
    title: "Email Client",
    content: "Content as seen  inside an email client",
    breakpoint: "sm",
    icon: <MobileIcon className={"rotate-90"} />,
    width: 600,
  },
];

const ExportBtn = () => {
  const { t } = useTranslation();
  const blocks = useAllBlocks();
  const exportHTML = async () => {
    const html = render(
      <Tailwind config={{ prefix: "c-" }}>
        <Html lang="en" dir="ltr">
          <Head />
          <body>
            <RenderChaiBlocks externalData={{}} blocks={blocks} />
          </body>
        </Html>
      </Tailwind>,
      { pretty: true },
    );
    console.log(html);
  };
  return (
    <button className="rounded-md bg-blue-500 px-4 py-2 text-white" onClick={() => exportHTML()}>
      {t("Export")}
    </button>
  );
};

function ChaiBuilderEmail() {
  const [blocks, setBlocks] = useAtom(lsBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [providers, setProviders] = useAtom(lsProvidersAtom);

  return (
    <ChaiBuilderEditor
      importHTMLSupport={false}
      // @ts-ignore
      breakpoints={BREAKPOINTS}
      topBarComponents={{ left: [PreviewMessage], right: [ExportBtn] }}
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
      container={"Container"}
      onSaveContainer={async (container: any) => {
        console.log(container);
        return true;
      }}
    />
  );
}

export default ChaiBuilderEmail;
