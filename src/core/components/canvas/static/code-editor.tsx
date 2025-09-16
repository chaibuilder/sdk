import { useCodeEditor, useSelectedBlockIds, useUpdateBlocksProps, useUpdateBlocksPropsRealtime } from "@/core/hooks";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/shadcn/components/ui/dialog";
import { Textarea } from "@/ui/shadcn/components/ui/textarea";
import { useThrottledCallback } from "@react-hookz/web";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

/**
 * Try to fix the HTML code
 * @param html
 */
const sanitizeHTML = (html: string) => {
  const doc = document.createElement("div");
  doc.innerHTML = html;
  return doc.innerHTML;
};

export default function CodeEditor() {
  const { t } = useTranslation();
  const [dirty, setDirty] = useState(false);
  const [code, setCode] = useState("");
  const [codeEditor, setCodeEditor] = useCodeEditor();
  const [ids] = useSelectedBlockIds();
  const updateBlockProps = useUpdateBlocksProps();
  const updateRealTime = useUpdateBlocksPropsRealtime();
  const saveCodeContentRealTime = useThrottledCallback(
    (value: string) => {
      const html = sanitizeHTML(value);
      updateRealTime([codeEditor.blockId], { [codeEditor.blockProp]: html });
    },
    [],
    300,
  );

  const saveCodeContent = useCallback(() => {
    if (dirty) {
      const html = sanitizeHTML(code);
      updateBlockProps([codeEditor.blockId], { [codeEditor.blockProp]: html });
    }
  }, [dirty, code]);

  useEffect(() => {
    if (!ids.includes(codeEditor?.blockId)) {
      saveCodeContent();
      // @ts-ignore
      setCodeEditor(null);
    }
  }, [ids]);

  const handleClose = () => {
    saveCodeContent();
    // @ts-ignore
    setCodeEditor(null);
  };

  return (
    <Dialog open={true} onOpenChange={handleClose}>
      <DialogContent className="flex max-h-[400px] min-h-[200px] max-w-4xl flex-col border-gray-700 text-black">
        <DialogHeader className="shrink-0 border-b border-gray-700 pb-3">
          <DialogTitle className="flex items-center justify-between text-black">
            <div className="space-x-3 text-sm font-semibold">
              <span>{t("HTML Code Editor |")}</span>
              <span className="text-xs text-gray-400">
                {t("Scripts will be only executed in preview and live mode.")}
              </span>
            </div>
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-hidden">
          <Textarea
            className="h-full w-full resize-none font-mono text-xs"
            value={code || codeEditor.initialCode}
            onChange={(e) => {
              const value = e.target.value;
              setDirty(true);
              setCode(value);
              saveCodeContentRealTime(value);
            }}
            rows={10}
            placeholder="Enter your code here..."
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
