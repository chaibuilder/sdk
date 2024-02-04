import { Provider } from "react-wrap-balancer";
import { RenderChaiBlocks } from "./RenderChaiBlocks.tsx";
import { get } from "lodash";
import React from "react";
import { BRANDING_OPTIONS_DEFAULTS } from "../core/constants/MODIFIERS.ts";
import type { ChaiPageData } from "./functions.ts";
import { getBrandingClasses } from "./functions.ts";

type ChaiPageProps = {
  before?: React.ReactNode;
  after?: React.ReactNode;
  pageData: ChaiPageData;
  classPrefix?: string;
  externalData?: Record<string, any>;
};

const RenderChaiPage = ({
  pageData,
  externalData = {},
  before = null,
  after = null,
  classPrefix = "c-",
}: ChaiPageProps) => {
  const brandingOptions = get(pageData.project, "brandingOptions", BRANDING_OPTIONS_DEFAULTS);
  return (
    <>
      {before}
      <div
        className={
          classPrefix.replace("-", "") + " " + getBrandingClasses(brandingOptions, classPrefix) + " min-h-screen"
        }>
        <Provider>
          <RenderChaiBlocks externalData={externalData} blocks={pageData.page.blocks || []} classPrefix={classPrefix} />
        </Provider>
      </div>
      {after}
    </>
  );
};

export { RenderChaiPage };
export type { ChaiPageData };
