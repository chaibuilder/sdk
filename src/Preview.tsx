import { registerChaiBlock } from "@chaibuilder/runtime";
import { useAtom } from "jotai";
import { useEffect, useMemo, useState } from "react";
import { lsBlocksAtom, lsThemeAtom } from "./__dev/atoms-dev.ts";
import { Component as CollectionListComponent, Config as CollectionListConfig } from "./__dev/CollectionList.tsx";
import { getChaiThemeCssVariables, getStylesForBlocks, RenderChaiBlocks } from "./render";
import { loadWebBlocks } from "./web-blocks/index.ts";

loadWebBlocks();
registerChaiBlock(CollectionListComponent, CollectionListConfig);

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

  console.log(blocks);
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
            description: "This is a description of my page",
          },
        }}
        blocks={blocks}
      />
    </>
  );
}

export default Preview;
