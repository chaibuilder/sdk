import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { lsBlocksAtom, lsThemeAtom } from "./__dev/atoms-dev.ts";
import registerCustomBlocks from "./__dev/blocks/index.tsx";
import { getChaiThemeCssVariables, getStylesForBlocks, RenderChaiBlocks } from "./render";
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
  const themeVars = useMemo(() => getChaiThemeCssVariables(theme), [theme]);
  return (
    <>
      <style>{themeVars}</style>
      <style>{allStyles}</style>
      <RenderChaiBlocks
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
