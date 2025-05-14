import { lsBlocksAtom, lsThemeAtom } from "@/_demo/atoms-dev";
import registerCustomBlocks from "@/_demo/blocks";
import { getChaiThemeCssVariables, getStylesForBlocks, RenderChaiBlocks } from "@/render";
import { getMergedPartialBlocks } from "@/render/functions";
import { loadWebBlocks } from "@/web-blocks";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { EXTERNAL_DATA } from "./_demo/EXTERNAL_DATA";
import { PARTIALS } from "./_demo/PARTIALS";
import { ChaiBuilderThemeValues } from "./types/types";

loadWebBlocks();
registerCustomBlocks();

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [theme] = useAtom(lsThemeAtom);

  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForBlocks(blocks);
      setStyles(styles);
    })();
  }, [blocks]);
  const themeVars = useMemo(() => getChaiThemeCssVariables(theme as ChaiBuilderThemeValues), [theme]);
  return (
    <>
      <style>{themeVars}</style>
      <style>{allStyles}</style>
      <RenderChaiBlocks
        lang="fr"
        fallbackLang="en"
        externalData={EXTERNAL_DATA}
        pageProps={{ slug: "chai-builder" }}
        draft={true}
        blocks={getMergedPartialBlocks(blocks, PARTIALS)}
        dataProviderMetadataCallback={(block, meta) => {
          console.log("meta", meta);
          console.log("block", block);
        }}
      />
    </>
  );
}

export default Preview;
