import { useCallback, useState } from "react";
import { useBuilderProp } from "@/core/hooks";

type CopiedValue = string | null;

type CopyFn = (text: string) => Promise<boolean>;

export const useCopyToClipboard = (): [CopiedValue, CopyFn] => {
  const [copiedText, setCopiedText] = useState<CopiedValue>(null);
  const enableCopyToClipboard = useBuilderProp("flags", { useClipboard: false }).useClipboard;

  const copy: CopyFn = useCallback(async (text) => {
    if (!enableCopyToClipboard) {
      console.warn("Clipboard feature is disabled");
      return false;
    }
    if (!navigator?.clipboard) {
      console.warn("Clipboard not supported");
      return false;
    }

    // Try to save to clipboard then save it in the state if worked
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      return true;
    } catch (error) {
      console.warn("Copy failed", error);
      setCopiedText(null);
      return false;
    }
  }, []);

  return [copiedText, copy];
};
