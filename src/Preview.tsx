import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { getStylesForBlocks, RenderChaiBlocks } from "./render";
import { loadWebBlocks } from "./web-blocks/index.ts";

loadWebBlocks();

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForBlocks(blocks, brandingOptions, true);
      setStyles(styles);
    })();
  }, [blocks, brandingOptions]);

  return (
    <>
      <style>{allStyles}</style>
      <RenderChaiBlocks blocks={blocks} />
    </>
  );
}

export default Preview;
