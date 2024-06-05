import { ChaiBuilderEditor, useAllBlocks } from "./core/main";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBlocksAtom, lsBrandingOptionsAtom, lsProvidersAtom } from "./atoms-dev.ts";
import { getBlocksFromHTML } from "./core/import-html/html-to-json.ts";
import { PredefinedBlock } from "./core/types/CoreBlock.ts";
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
      importHTML={false}
      // @ts-ignore
      breakpoints={BREAKPOINTS}
      // @ts-ignore
      getExternalPredefinedBlock={async (block: PredefinedBlock) => {
        // bases on block.uuid, you can fetch block data from your server or return predefined block
        return getBlocksFromHTML(`<div class="bg-red-300"><p>Hello World</p></div>`);
      }}
      getUILibraryBlocks={async () => {
        return [
          {
            uuid: "hero-uuid",
            name: "Header",
            group: "Hero",
            preview: "https://via.placeholder.com/350x100",
          },
        ];
      }}
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
    />
  );
}

export default ChaiBuilderEmail;
