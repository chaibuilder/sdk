"use client";

import { useBlocksHtmlForAi } from "@/core/hooks/use-blocks-html-for-ai";
import { Button } from "@/ui/shadcn/components/ui/button";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function AIChatPanel() {
  const blocksHtmlForAi = useBlocksHtmlForAi();
  return (
    <div>
      <Button onClick={() => console.log(blocksHtmlForAi())}>Get Blocks HTML</Button>
    </div>
  );
}
