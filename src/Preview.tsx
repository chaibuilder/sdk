import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { lsBlocksAtom, lsThemeAtom } from "./_demo/atoms-dev.ts";
import registerCustomBlocks from "./_demo/blocks/index.tsx";
import { getChaiThemeCssVariables, getStylesForBlocks, RenderChaiBlocks } from "./render";
import { ChaiBuilderThemeValues } from "./types/types.ts";
import { loadWebBlocks } from "./web-blocks/index.ts";
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
        externalData={{
          vehicle: {
            title: "Hyundai i20 Active - 1.0 MPI - 2015",
            description: "Hyundai i20 Active - 1.0 MPI - 2015, 100000km, Petrol, Manual, 5 doors, 5 seats",
            price: "$2000",
            image: "https://picsum.photos/400/200",
            link: "https://www.google.com",
          },
          global: {
            siteName: "My Site",
            twitterHandle: "@my-twitter-handle",
            description: "This is a description of my page",
          },
        }}
        pageProps={{
          slug: "hyundai-i20-active-10-mpi-2015",
          vehicle: {
            title: "Hyundai i20 Active - 1.0 MPI - 2015",
          },
        }}
        draft={true}
        blocks={blocks}
        dataProviderMetadataCallback={(block, meta) => {
          console.log("meta", meta);
          console.log("block", block);
        }}
      />
    </>
  );
}

export default Preview;
