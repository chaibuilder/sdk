"use client";

import { useBlocksHtmlForAi } from "@/core/hooks/use-blocks-html-for-ai";
import { useHtmlToBlocks } from "@/core/hooks/use-html-to-blocks";
import { Button } from "@/ui/shadcn/components/ui/button";
import { useState } from "react";

export default function AIChatPanel() {
  const blocksHtmlForAi = useBlocksHtmlForAi();
  const htmlToBlocks = useHtmlToBlocks();
  const [html, setHtml] = useState("");
  return (
    <div>
      <textarea className="mt-10" rows={5} value={html} onChange={(e) => setHtml(e.target.value)}></textarea>
      <Button onClick={() => console.log(htmlToBlocks(html))}>Import HTML</Button>
      <Button onClick={() => console.log(blocksHtmlForAi())}>Get Blocks HTML</Button>
    </div>
  );
}
