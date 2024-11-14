import { getStylesForBlocks, RenderChaiBlocks } from "./render";
import { useAtom } from "jotai";
import { lsBlocksAtom } from "./__dev/atoms-dev.ts";
import { useEffect, useState } from "react";
import "./blocks/web";

function Preview() {
  const [blocks] = useAtom(lsBlocksAtom);
  const [allStyles, setStyles] = useState("");

  useEffect(() => {
    (async () => {
      const styles = await getStylesForBlocks(blocks, {}, true);
      setStyles(styles);
    })();
  }, [blocks]);

  return (
    <>
      <style>{allStyles}</style>
      <RenderChaiBlocks blocks={blocks} />
    </>
  );
}

export default Preview;
