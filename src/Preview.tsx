import { RenderChaiBlocks } from "./render";
import { useAtom } from "jotai";
import { lsBlocksAtom, lsBrandingOptionsAtom } from "./atoms-dev.ts";
import { useEffect, useState } from "react";
import { getStylesForPageData } from "./render/functions.ts";

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [brandingOptions] = useAtom(lsBrandingOptionsAtom);
  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForPageData({
        page: { blocks: blocks },
        project: { brandingOptions },
      });
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
