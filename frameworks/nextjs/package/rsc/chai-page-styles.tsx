import { ChaiFullPage } from "@/types";
import { applyDesignTokens, getChaiThemeCssVariables } from "@chaibuilder/sdk/render";
import { ChaiDesignTokens } from "@chaibuilder/sdk/types";
import { get } from "lodash";
import { ChaiBuilder } from "../ChaiBuilder";

export const ChaiPageStyles = async (props: { page: ChaiFullPage }) => {
  const { page } = props;
  const siteSettings = await ChaiBuilder.getSiteSettings();

  if (!!get(siteSettings, "error")) {
    console.log("Site Settings Error: ", siteSettings);
  }

  const theme = get(siteSettings, "theme", {});
  const designTokens = get(siteSettings, "designTokens", {}) as ChaiDesignTokens;
  const themeCssVariables = getChaiThemeCssVariables(theme as any);
  const pageBlocks = applyDesignTokens(page.blocks ?? [], designTokens);
  const styles = page ? await ChaiBuilder.getBlocksStyles(pageBlocks) : null;
  return (
    <>
      <style id="theme-variables" dangerouslySetInnerHTML={{ __html: themeCssVariables }} />
      {styles ? <style id="page-styles">{styles}</style> : null}
    </>
  );
};
