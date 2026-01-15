import { loadWebBlocks } from "@chaibuilder/sdk/web-blocks";
import { PreviewBanner, NextJSRenderChaiBlocks, ChaiPageStyles } from "../../../package/rsc/index";
import { ChaiBuilder } from "../.././../package/ChaiBuilder";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import "@chaibuilder/sdk/styles";
import { ChaiPageProps } from "@chaibuilder/runtime";

loadWebBlocks();

export const dynamic = "force-static";

export const generateMetadata = async (props: { params: Promise<{ slug: string[] }> }) => {
  const nextParams = await props.params;
  const slug = nextParams.slug ? `/${nextParams.slug.join("/")}` : "/";

  const { isEnabled } = await draftMode();
  ChaiBuilder.init(process.env.CHAIBUILDER_API_KEY!, isEnabled);
  return await ChaiBuilder.getPageSeoData(slug);
};

export default async function Page({ params }: { params: Promise<{ slug: string[] }> }) {
  const nextParams = await params;
  const slug = nextParams.slug ? `/${nextParams.slug.join("/")}` : "/";

  const { isEnabled } = await draftMode();
  ChaiBuilder.init(process.env.CHAIBUILDER_API_KEY!, isEnabled);
  let page = null;
  try {
    page = await ChaiBuilder.getPageBySlug(slug);
    if ("error" in page) {
      return notFound();
    }
  } catch (err) {
    return notFound();
  }

  //NOTE: pageProps are received in your dataProvider functions for block and page
  const pageProps: ChaiPageProps = {
    slug,
    pageType: page.pageType,
    fallbackLang: page.fallbackLang,
    pageLang: page.lang,
  };
  return (
    <>
      <head>
        <ChaiPageStyles page={page} />
      </head>
      <body className={`font-body antialiased`}>
        <PreviewBanner slug={slug} show={isEnabled} />
        <NextJSRenderChaiBlocks page={page} pageProps={pageProps} />
      </body>
    </>
  );
}
