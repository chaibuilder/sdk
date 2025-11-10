import { CHAI_BUILDER_EVENTS } from "@/core/events";
import { useBlocksHtmlForAi, useSelectedBlock } from "@/core/hooks";
import { usePubSub } from "@/core/hooks/use-pub-sub";
import { shadcnTheme } from "@/tailwind/get-chai-builder-tailwind-config";
import { Dialog, DialogContent, DialogHeader, DialogTitle, Tabs, TabsList, TabsTrigger } from "@/ui";
import { camelCase } from "lodash-es";
import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
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
    const children = Array.from(tempDiv.children) as Element[];
    const jsx = domToJsx(children.length === 1 ? children[0] : children);
    return { jsx, html: tempDiv.innerHTML };
  } catch (error) {
    return { html, jsx: html };
  }
}

const getExportedCoded = async ({
  selectedBlock,
  html,
  isTypeScript = false,
}: {
  selectedBlock: ChaiBlock;
  html: string;
  isTypeScript?: boolean;
}) => {
  let componentName = selectedBlock?._name || selectedBlock?._type || "Component";
  componentName = camelCase(componentName).replace(/^./, (str) => str.toUpperCase());

  const SPACE = "  ";
  let { jsx, html: convertedHTML } = await convertHtmlToJsx(html);
  jsx = jsx?.split("\n").join(`\n${SPACE}${SPACE}`);

  // Add TypeScript type annotations if TypeScript is enabled
  const typeAnnotation = isTypeScript ? ": React.FC" : "";
  const importStatement = isTypeScript ? "import React from 'react';\n\n" : "";

  jsx = `${importStatement}export const ${componentName}${typeAnnotation} = () => {
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
  const [show, setShow] = useState(false);

  const getFileName = () => {
    switch (tab) {
      case "js":
        return `${fileName}.jsx`;
      case "ts":
        return `${fileName}.tsx`;
      case "html":
        return `${fileName}.html`;
      case "tailwind-v3":
        return "tailwind.config.js";
      case "tailwind-v4":
        return "global.css";
    }
  };

  const getLanguage = () => {
    switch (tab) {
      case "js":
      case "ts":
        return "javascript";
      case "html":
        return "HTML";
      case "tailwind-v3":
        return "javascript";
      case "tailwind-v4":
        return "css";
    }
  };

  const handleExportEvent = useCallback(async () => {
    try {
      setShow(false);
      let html = blocksHtmlForAi({ EXTRA_CORE_BLOCKS: ["Icon"] })
      
      const isTypeScript = tab === "ts";
      const isTailwindExport = tab === "tailwind-v3" || tab === "tailwind-v4";
      if (!isTailwindExport) {
        const {
          jsx: jsxCode,
          html: htmlCode,
          componentName,
        } = await getExportedCoded({
          selectedBlock,
          html,
          isTypeScript,
        });
        setExportContent({ html: htmlCode, jsx: jsxCode });
        setFileName(componentName);
      } else {
        setFileName(`tailwind.config.${tab === "tailwind-v4" ? "ts" : "js"}`);
      }
      setShow(true);
    } catch (error) {
      const fallbackContent = `<div>Export failed. Close the modal and try again.</div>`;
      setExportContent({ html: fallbackContent, jsx: fallbackContent });
      toast.error(t("Failed to generate export HTML"));
    }
  }, [t, tab, selectedBlock, blocksHtmlForAi]);

  useEffect(() => {
    handleExportEvent();
  }, [handleExportEvent, tab]);

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

  const tailwindConfig = useMemo(() => {
    if (tab === "tailwind-v3") {
      const theme = { extend: shadcnTheme() };
      const extend = JSON.stringify(theme, null, 2);
      return `export default {
  // Your tailwind v3 config ...

  "theme": ${extend?.split("\n").join("\n  ")},
}`;
    } else if (tab === "tailwind-v4") {
      return `@import "tailwindcss";

/* Tailwind v4 CSS-based configuration */

:root {
  --background: oklch(0.9818 0.0054 95.0986);
  --foreground: oklch(0.3438 0.0269 95.7226);
  --card: oklch(0.9818 0.0054 95.0986);
  --card-foreground: oklch(0.1908 0.0020 106.5859);
  --popover: oklch(1.0000 0 0);
  --popover-foreground: oklch(0.2671 0.0196 98.9390);
  --primary: oklch(0.6171 0.1375 39.0427);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9245 0.0138 92.9892);
  --secondary-foreground: oklch(0.4334 0.0177 98.6048);
  --muted: oklch(0.9341 0.0153 90.2390);
  --muted-foreground: oklch(0.6059 0.0075 97.4233);
  --accent: oklch(0.9245 0.0138 92.9892);
  --accent-foreground: oklch(0.2671 0.0196 98.9390);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.8847 0.0069 97.3627);
  --input: oklch(0.7621 0.0156 98.3528);
  --ring: oklch(0.6171 0.1375 39.0427);
  --radius: 0.5rem;
}

.dark {
  --background: oklch(0.2679 0.0036 106.6427);
  --foreground: oklch(0.8074 0.0142 93.0137);
  --card: oklch(0.2679 0.0036 106.6427);
  --card-foreground: oklch(0.9818 0.0054 95.0986);
  --popover: oklch(0.3085 0.0035 106.6039);
  --popover-foreground: oklch(0.9211 0.0040 106.4781);
  --primary: oklch(0.6724 0.1308 38.7559);
  --primary-foreground: oklch(1.0000 0 0);
  --secondary: oklch(0.9818 0.0054 95.0986);
  --secondary-foreground: oklch(0.3085 0.0035 106.6039);
  --muted: oklch(0.2213 0.0038 106.7070);
  --muted-foreground: oklch(0.7713 0.0169 99.0657);
  --accent: oklch(0.2130 0.0078 95.4245);
  --accent-foreground: oklch(0.9663 0.0080 98.8792);
  --destructive: oklch(0.6368 0.2078 25.3313);
  --destructive-foreground: oklch(1.0000 0 0);
  --border: oklch(0.3618 0.0101 106.8928);
  --input: oklch(0.4336 0.0113 100.2195);
  --ring: oklch(0.6724 0.1308 38.7559);
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@keyframes accordion-down {
  from {
    height: 0;
  }
  to {
    height: var(--radix-accordion-content-height);
  }
}

@keyframes accordion-up {
  from {
    height: var(--radix-accordion-content-height);
  }
  to {
    height: 0;
  }
}`;
    }
    return '';
  }, [tab]);

  return (tab === "tailwind-v3" || tab === "tailwind-v4" || exportContent?.jsx?.length > 0) && show ? (
    <CodeDisplay
      key={tab}
      onCopy={handleCopy}
      code={tab === "tailwind-v3" || tab === "tailwind-v4" ? tailwindConfig : tab === "html" ? exportContent.html : exportContent.jsx}
      language={getLanguage()}
      downloadText={downloadText}
      onDownload={downloadExportContent}
    />
  ) : (
    <div className="flex h-[620px] w-full items-center justify-center p-4">Generating code...</div>
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
              <TabsTrigger value="tailwind-v3">Tailwind v3</TabsTrigger>
              <TabsTrigger value="tailwind-v4">Tailwind v4</TabsTrigger>
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
