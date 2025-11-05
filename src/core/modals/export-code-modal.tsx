import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksStore, useCopyToClipboard } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui";
import { Button } from "@/ui/shadcn/components/ui/button";
import { ScrollArea } from "@/ui/shadcn/components/ui/scroll-area";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

export const ExportCodeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [exportContent, setExportContent] = useState<string>("");
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [, copy] = useCopyToClipboard();
  const [blocks] = useBlocksStore();

  const handleExportEvent = useCallback(
    (blockIds: string[] | undefined) => {
      // Prevent modal from opening if it's already open
      if (open) return;

      setSelectedBlockIds(blockIds || []);
      setOpen(true);

      try {
        const html = "";
        setExportContent(html);
      } catch (error) {
        console.error("Error generating HTML:", error);
        const fallbackContent = `<div>Export failed. Please try again.</div>`;
        setExportContent(fallbackContent);
        toast.error(t("Failed to generate export HTML"));
      }
    },
    [blocks, t, open],
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
    const blob = new Blob([content], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "export.html";
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
          <div className="text-sm text-muted-foreground">
            {selectedBlockIds.length > 0
              ? t("Exporting {{count}} blocks", { count: selectedBlockIds.length })
              : t("Exporting all blocks")}
          </div>
          <ScrollArea className="h-[400px] max-h-full rounded-md border p-4">
            <pre className="whitespace-pre-wrap text-xs">{exportContent}</pre>
          </ScrollArea>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleCopy(exportContent)}>
              {t("Copy")}
            </Button>
            <Button type="button" onClick={() => downloadExportContent(exportContent)}>
              {t("Download")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
