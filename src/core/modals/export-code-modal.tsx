import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksStore, useCopyToClipboard } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { RenderChaiBlocks } from "@/render";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { lazy, Suspense, useCallback, useState } from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getBlockWithNestedChildren } from "../hooks/get-block-with-nested-children";
import { domToJsx } from "./domToJsx";

// Lazy load the CodeDisplay component
const CodeDisplay = lazy(() => import("./code-display"));

async function convertHtmlToJsx(html: string): Promise<string> {
  try {
    // Create a temporary DOM element to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;

    // Convert DOM to JSX string
    const jsx = domToJsx(tempDiv);

    return jsx;
  } catch (error) {
    console.error("Error converting HTML to JSX:", error);
    return html; // Fallback to original HTML
  }
}

async function renderBlocksToExport(blocks: any[]) {
  // Create a hidden container div
  const container = document.createElement("div");
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "-9999px";
  document.body.appendChild(container);

  try {
    // Use ReactDOM.render for client-side rendering
    const renderPromise = new Promise<string>((resolve, reject) => {
      const root = ReactDOM.createRoot(container);
      root.render(<RenderChaiBlocks blocks={blocks} />);

      // Use setTimeout to ensure React has time to render
      setTimeout(() => {
        try {
          const html = container.innerHTML;
          resolve(html);
        } catch (error) {
          reject(error);
        }
      }, 100);
    });

    const html = await renderPromise;

    // Convert HTML to JSX
    const jsx = await convertHtmlToJsx(html);

    // Clean up
    return jsx;
  } finally {
    // Always clean up the container
    document.body.removeChild(container);
  }
}

export const ExportCodeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [exportContent, setExportContent] = useState<string>("");
  const [, setSelectedBlockIds] = useState<string[]>([]);
  const [, copy] = useCopyToClipboard();
  const [blocks] = useBlocksStore();

  const handleExportEvent = useCallback(
    async (blockIds: string[] | undefined) => {
      // Prevent modal from opening if it's already open
      const first = blockIds?.[0];
      if (open || !first) return;
      setOpen(true);

      try {
        const blocksSubset = getBlockWithNestedChildren(first, blocks);
        const html = await renderBlocksToExport(blocksSubset);
        setExportContent(html);
      } catch (error) {
        console.error("Error generating HTML:", error);
        const fallbackContent = `<div>Export failed. Please try again.</div>`;
        setExportContent(fallbackContent);
        toast.error(t("Failed to generate export HTML"));
      }
    },
    [open, blocks, t],
  );

  usePubSub(CHAI_BUILDER_EVENTS.OPEN_EXPORT_CODE, handleExportEvent);

  const handleCopy = useCallback(
    async (text: string) => {
      try {
        await copy(text);
        toast.success(t("Export code copied!"));
      } catch (error) {
        toast.error(t("Failed to copy export code"));
      }
    },
    [copy, t],
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

  const handleClose = () => {
    setOpen(false);
    setExportContent("");
    setSelectedBlockIds([]);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl overflow-hidden border-border">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-foreground">{t("Export Code")}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <Suspense
            fallback={
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                Loading code editor...
              </div>
            }>
            <ErrorBoundary fallback={<div>Something went wrong</div>}>
              <CodeDisplay code={exportContent} onCopy={handleCopy} onDownload={downloadExportContent} />
            </ErrorBoundary>
          </Suspense>
        </div>
      </DialogContent>
    </Dialog>
  );
};
