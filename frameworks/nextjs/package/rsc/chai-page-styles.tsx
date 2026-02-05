import { ChaiFullPage } from "@/types";
import { applyDesignTokens, getChaiThemeCssVariables } from "@chaibuilder/sdk/render";
import { ChaiDesignTokens, ChaiTheme } from "@chaibuilder/sdk/types";
import { get } from "lodash";
import { ChaiBuilder } from "../ChaiBuilder";

export const ChaiPageStyles = async (props: { page: ChaiFullPage; fontVariables?: boolean }) => {
  const { page, fontVariables = false } = props;
  const siteSettings = await ChaiBuilder.getSiteSettings();

  if (!!get(siteSettings, "error")) {
    console.log("Site Settings Error: ", siteSettings);
  }

  const theme = get(siteSettings, "theme", {}) as ChaiTheme;
  const designTokens = get(siteSettings, "designTokens", {}) as ChaiDesignTokens;
  const themeCssVariables = getChaiThemeCssVariables({ theme, fontVariables });
  const pageBlocks = applyDesignTokens(page.blocks ?? [], designTokens);
  const styles = page ? await ChaiBuilder.getBlocksStyles(pageBlocks) : null;
  return (
    <>
      <style id="theme-variables" dangerouslySetInnerHTML={{ __html: themeCssVariables }} />
      {styles ? <style id="page-styles" dangerouslySetInnerHTML={{ __html: styles }} /> : null}
    </>
  );
};
