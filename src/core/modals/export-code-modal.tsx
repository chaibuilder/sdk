import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksHtmlForAi, useSelectedBlock } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { camelCase } from "lodash";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEditorMode } from "../hooks/use-editor-mode";
import { ChaiBlock } from "../main";
import { domToJsx } from "./domToJsx";

// Lazy load the CodeDisplay component
const CodeDisplay = lazy(() => import("./code-display"));

async function convertHtmlToJsx(html: string): Promise<string> {
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const jsx = domToJsx(tempDiv?.children[0] as Element);
    return jsx;
  } catch (error) {
    return html;
  }
}


const getExportedCoded = async ({ selectedBlock, html }: { selectedBlock: ChaiBlock; html: string }) => {
  let componentName = selectedBlock?._name || selectedBlock?._type || "Component";
  componentName = camelCase(componentName).replace(/^./, (str) => str.toUpperCase());

  const SPACE = "  ";
  let jsx = await convertHtmlToJsx(html);
  jsx = jsx?.split("\n").join(`\n${SPACE}${SPACE}`);
  return `export const ${componentName} = () => {
${SPACE}return (
${SPACE}${SPACE}${jsx?.trimEnd()}
${SPACE})
}`;
}


const ExportCodeModalContent = () => {
  const { t } = useTranslation();
  const [exportContent, setExportContent] = useState<string>("");
  const selectedBlock = useSelectedBlock();
  const blocksHtmlForAi = useBlocksHtmlForAi();


  const handleExportEvent = useCallback(
    async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const html = blocksHtmlForAi();
        const jsx = await getExportedCoded({ selectedBlock, html });
        setExportContent(jsx);
      } catch (error) {
        const fallbackContent = `<div>Export failed. Close the modal and try again.</div>`;
        setExportContent(fallbackContent);
        toast.error(t("Failed to generate export HTML"));
      }
    },
    [t],
  );

  useEffect(() => {
    handleExportEvent();
  }, []);


  const handleCopy = useCallback(
    async (text: string) => {
      try {
        navigator.clipboard.writeText(text);
        toast.success(t("Export code copied!"));
      } catch (error) {
        toast.error(t("Failed to copy export code"));
      }
    },
    [t],
  );

  const downloadExportContent = (content: string) => {
    const blob = new Blob([content], { type: "text/jsx" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "export.jsx";
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
    toast.success(t("Export code downloaded successfully!"));
  };

  return exportContent?.length > 0 ? <CodeDisplay code={exportContent} onCopy={handleCopy} onDownload={downloadExportContent} /> : <div className="p-4 w-full h-full flex items-center justify-center">Generating code...</div>
}



export const ExportCodeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { setMode } = useEditorMode();

  const handleOpenModal = useCallback(
    async () => {
      setMode("view");
      setOpen(true);
    },
    [open],
  );

  usePubSub(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, handleOpenModal);

  const handleCloseModal = async () => {
    setMode("edit");
    await new Promise((resolve) => setTimeout(resolve, 300));
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleCloseModal}>
      <DialogContent className="max-w-5xl overflow-hidden border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">{t("Export Code")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 min-h-[400px]">
          {open && <Suspense
            fallback={
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                Loading code editor...
              </div>
            }>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <ExportCodeModalContent />
            </ErrorBoundary>
          </Suspense>}
        </div>
      </DialogContent>
    </Dialog>
  );
};
