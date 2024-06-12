import { ChaiBuilderEditor } from "./core/main";
import { useAtom } from "jotai";
import { useTranslation } from "react-i18next";
import { lsBrandingOptionsAtom, lsEmailBlocksAtom } from "./atoms-dev.ts";
import { MobileIcon } from "@radix-ui/react-icons";
import { render } from "@react-email/render";
import { RenderChaiBlocks } from "./render";
import { Font, Head, Html, Tailwind } from "@react-email/components";
import { loadEmailBlocks } from "./blocks/email";
import ExportModal from "./Export.tsx";

loadEmailBlocks();

const PreviewMessage = () => {
  const { t } = useTranslation();
  return <div className={"text-sm font-normal"}>{t("This is an awesome Email Builder")}</div>;
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
  const [blocks] = useBlocksStore();
  const exportHTML = async () => {
    const html = render(
      <Tailwind config={{ prefix: "c-" }}>
        <Html lang="en" dir="ltr">
          <Head>
            <Font
              fontFamily="Roboto"
              fallbackFontFamily="Verdana"
              webFont={{
                url: "https://fonts.gstatic.com/s/roboto/v27/KFOmCnqEu92Fr1Mu4mxKKTU1Kg.woff2",
                format: "woff2",
              }}
              fontWeight={400}
              fontStyle="normal"
            />
          </Head>
          <body>
            <RenderChaiBlocks blocks={blocks} />
          </body>
        </Html>
      </Tailwind>,
      { pretty: true },
    );
    console.log(html);

    return html;
  };
  return <ExportModal content={t("Export")} handleClick={() => exportHTML()} />;
};

function ChaiBuilderEmail() {
  const [blocks, setBlocks] = useAtom(lsEmailBlocksAtom);
  const [brandingOptions, setBrandingOptions] = useAtom(lsBrandingOptionsAtom);

  return (
    <>
      <ChaiBuilderEditor
        importHTMLSupport={false}
        // @ts-ignore
        breakpoints={BREAKPOINTS}
        topBarComponents={{ left: [PreviewMessage], right: [ExportBtn] }}
        blocks={blocks}
        brandingOptions={brandingOptions}
        onSavePage={async ({ blocks }: any) => {
          setBlocks(blocks);
          return true;
        }}
        onSaveBrandingOptions={async (options: any) => {
          setBrandingOptions(options);
          return true;
        }}
      />
    </>
  );
}

export default ChaiBuilderEmail;
