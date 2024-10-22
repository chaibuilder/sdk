import { getStylesForBlocks, RenderChaiBlocks } from "./render";
import { useAtom } from "jotai";
import { lsBlocksAtom, lsBrandingOptionsAtom } from "./__dev/atoms-dev.ts";
import { useEffect, useState } from "react";
import "./blocks/web";

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
