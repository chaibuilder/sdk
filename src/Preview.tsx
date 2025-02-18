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
      <RenderChaiBlocks blocks={blocks} />
    </>
  );
}

export default Preview;
