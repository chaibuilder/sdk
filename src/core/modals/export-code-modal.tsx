import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksHtmlForAi, useSelectedBlock } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger } from "@/ui";
import { camelCase } from "lodash";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useEditorMode } from "../hooks/use-editor-mode";
import { ChaiBlock } from "../main";
import { domToJsx, formatHtml } from "./domToJsx";

// Lazy load the CodeDisplay component
const CodeDisplay = lazy(() => import("./code-display"));

async function convertHtmlToJsx(html: string): Promise<{ jsx: string; html: string }> {
  try {
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = html;
    const jsx = domToJsx(tempDiv?.children[0] as Element);
    return { jsx, html: tempDiv?.children[0].outerHTML };
  } catch (error) {
    return { html, jsx: html };
  }
}

const getExportedCoded = async ({ selectedBlock, html }: { selectedBlock: ChaiBlock; html: string }) => {
  let componentName = selectedBlock?._name || selectedBlock?._type || "Component";
  componentName = camelCase(componentName).replace(/^./, (str) => str.toUpperCase());

  const SPACE = "  ";
  let { jsx, html: convertedHTML } = await convertHtmlToJsx(html);
  jsx = jsx?.split("\n").join(`\n${SPACE}${SPACE}`);
  jsx = `export const ${componentName} = () => {
${SPACE}return (
${SPACE}${SPACE}${jsx?.trimEnd()}
${SPACE})
}`;
  return { jsx, html: formatHtml(convertedHTML), componentName };
};

const ExportCodeModalContent = ({ tab }: { tab: string }) => {
  const { t } = useTranslation();
  const [exportContent, setExportContent] = useState<{ html: string; jsx: string }>({ html: "", jsx: "" });
  const selectedBlock = useSelectedBlock();
  const blocksHtmlForAi = useBlocksHtmlForAi();
  const [fileName, setFileName] = useState<string>("");

  const getFileName = () => {
    switch (tab) {
      case "js":
        return `${fileName}.jsx`;
      case "ts":
        return `${fileName}.tsx`;
      case "html":
        return `${fileName}.html`;
      case "tailwind":
        return "tailwind.config.js";
    }
  };

  const getLanguage = () => {
    switch (tab) {
      case "js":
      case "ts":
      case "tailwind":
        return "javascript";
      case "html":
        return "HTML";
    }
  };

  const handleExportEvent = useCallback(async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const html = blocksHtmlForAi();
      const { jsx: jsxCode, html: htmlCode, componentName } = await getExportedCoded({ selectedBlock, html });
      setExportContent({ html: htmlCode, jsx: jsxCode });
      setFileName(componentName);
    } catch (error) {
      const fallbackContent = `<div>Export failed. Close the modal and try again.</div>`;
      setExportContent({ html: fallbackContent, jsx: fallbackContent });
      toast.error(t("Failed to generate export HTML"));
    }
  }, [t]);

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
    anchor.download = getFileName();
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
    toast.success(t("Export code downloaded successfully!"));
  };

  const downloadText = (
    <span>
      Download <span className="font-mono text-xs font-light text-gray-300">{getFileName()}</span>
    </span>
  );

  return exportContent?.jsx?.length > 0 ? (
    <CodeDisplay
      key={tab}
      onCopy={handleCopy}
      code={tab === "html" ? exportContent.html : exportContent.jsx}
      language={getLanguage()}
      downloadText={downloadText}
      onDownload={downloadExportContent}
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center p-4">Generating code...</div>
  );
};

export const ExportCodeModal = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { setMode } = useEditorMode();
  const [tab, setTab] = useState("js");

  const handleOpenModal = useCallback(async () => {
    setTab("js");
    setMode("view");
    setOpen(true);
  }, [open]);

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
          <Tabs defaultValue="js" onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="js">Javascript</TabsTrigger>
              <TabsTrigger value="ts">Typescript</TabsTrigger>
              <TabsTrigger value="html">HTML</TabsTrigger>
              <TabsTrigger value="tailwind" className="hidden">
                Tailwind config
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div />
        </DialogHeader>
        <div className="flex min-h-[400px] flex-col gap-4">
          {open && (
            <Suspense
              fallback={
                <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                  Loading code editor...
                </div>
              }>
              <ErrorBoundary fallback={<div>Something went wrong</div>}>
                <ExportCodeModalContent tab={tab} />
              </ErrorBoundary>
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
