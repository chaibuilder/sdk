import { RenderChaiBlocks } from "./render";
import { useAtom } from "jotai";
import { lsBlocksAtom, lsBrandingOptionsAtom } from "./atoms-dev.ts";
import { useEffect, useState } from "react";
import { getStylesForBlocks } from "./render/functions.ts";

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForBlocks(blocks, brandingOptions);
      setStyles(styles);
    })();
  }, [blocks, brandingOptions]);

  return (
    <>
      <style>{allStyles}</style>
      <RenderChaiBlocks externalData={{}} blocks={blocks} />
    </>
  );
}

export default Preview;
