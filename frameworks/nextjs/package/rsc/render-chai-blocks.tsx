import { applyDesignTokens, RenderChaiBlocks as RenderChaiBlocksSdk } from "@chaibuilder/sdk/render";
import { ChaiBlockComponentProps, ChaiDesignTokens, ChaiPage, ChaiPageProps, ChaiStyles } from "@chaibuilder/sdk/types";
import { isEmpty } from "lodash";
import { ChaiBuilder } from "../ChaiBuilder";
import { ImageBlock } from "./image-block";
import { JSONLD } from "./json-ld";
import { LinkBlock } from "./link-block";

type ImageBlockProps = {
  height: string;
  width: string;
  alt: string;
  styles: ChaiStyles;
  lazyLoading: boolean;
  image: string;
};

type LinkBlockProps = {
  styles: ChaiStyles;
  content: string;
  link: {
    type: "page" | "pageType" | "url" | "email" | "telephone" | "element";
    target: "_self" | "_blank";
    href: string;
  };
  prefetchLink?: boolean;
};

export const RenderChaiBlocks = async ({
  page,
  pageProps,
  linkComponent = LinkBlock,
  imageComponent = ImageBlock,
  designTokens = {},
}: {
  page: ChaiPage & { fallbackLang: string };
  pageProps: ChaiPageProps;
  designTokens?: ChaiDesignTokens;
  linkComponent?:
    | React.ComponentType<ChaiBlockComponentProps<LinkBlockProps>>
    | Promise<React.ComponentType<ChaiBlockComponentProps<LinkBlockProps>>>;
  imageComponent?:
    | React.ComponentType<ChaiBlockComponentProps<ImageBlockProps>>
    | Promise<React.ComponentType<ChaiBlockComponentProps<ImageBlockProps>>>;
}) => {
  // setChaiBlockComponent("Link", await linkComponent);
  // setChaiBlockComponent("Image", await imageComponent);
  const pageData = await ChaiBuilder.getPageExternalData({
    blocks: page.blocks,
    pageProps,
    pageType: page.pageType,
    lang: page.lang,
  });
  const settings = await ChaiBuilder.getSiteSettings();
  const tokens = settings?.designTokens ?? designTokens;

  //Register Link and Image blocks with Chai Builder
  return (
    <>
      <JSONLD jsonLD={page?.seo?.jsonLD} pageData={pageData} />
      <RenderChaiBlocksSdk
        externalData={pageData}
        blocks={!isEmpty(tokens) ? applyDesignTokens(page.blocks, tokens as ChaiDesignTokens) : page.blocks}
        fallbackLang={page.fallbackLang}
        lang={page.lang}
        pageProps={pageProps}
      />
    </>
  );
};
