"use client";

import { useReplaceBlock, useSelectedBlock } from "@/core/hooks";
import { useBlocksHtmlForAi } from "@/core/hooks/use-blocks-html-for-ai";
import { useHtmlToBlocks } from "@/core/hooks/use-html-to-blocks";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useState } from "react";

export default function AIChatPanel() {
  const selectedBlock = useSelectedBlock();
  const blocksHtmlForAi = useBlocksHtmlForAi();
  const htmlToBlocks = useHtmlToBlocks();
  const [html, setHtml] = useState("");
  const replaceBlock = useReplaceBlock();
  const add = () => {
    const blocks = htmlToBlocks(html);
    replaceBlock(selectedBlock?._id, blocks);
  };
  return (
    <div>
      <textarea className="mt-10" rows={5} value={html} onChange={(e) => setHtml(e.target.value)}></textarea>
      <Button onClick={add}>Import HTML</Button>
      <Button onClick={() => console.log(blocksHtmlForAi())}>Get Blocks HTML</Button>
    </div>
  );
}
