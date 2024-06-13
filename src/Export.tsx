import React, { useState, useCallback } from "react";
import { useCopyToClipboard } from "./core/hooks/useCopyToClipboard";
import { ErrorBoundary } from "./core/components/ErrorBoundary";
import { Button, Dialog, DialogContent, DialogFooter, DialogTrigger } from "./ui";
import { CodeBlock, oneLight } from "@react-email/components";
import { useTranslation } from "react-i18next";

interface ExportModalProps {
  content: any;
  handleClick: () => Promise<string>;
}

const ExportModal: React.FC<ExportModalProps> = React.memo(({ content, handleClick }) => {
  const [emailHTMLContent, setEmailHTMLContent] = useState<string>("");
  const [, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleCopy = useCallback(
    (text: string) => () => {
      copy(text)
        .then(() => {
          setIsCopied(true);
          console.log("Copied!",  isCopied);
        })
        .catch((error) => {
          setIsCopied(false);
          console.error("Failed to copy!", error);
        });
    },
    [copy, isCopied],
  );

  const downloadHTMLContent = (htmlContent: string) => {
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "index.html";
    document.body.appendChild(anchor);
    anchor.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(anchor);
  };

  const triggerClick = useCallback(() => {
    handleClick().then(setEmailHTMLContent).catch(console.error);
  }, [handleClick]);

  return (
    <Dialog>
      <DialogTrigger className="rounded-md bg-blue-500 px-4 py-2 text-white" onClick={triggerClick}>
        {content}
      </DialogTrigger>
      <DialogContent className="flex max-h-[80vh] max-w-xl flex-col gap-0 overflow-auto p-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
        <ErrorBoundary>
          <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-4 pt-3.5 text-lg font-bold">
            Export Email Template
          </div>
          <CodeBlock code={emailHTMLContent} language="html" theme={oneLight} />
          <DialogFooter className="flex px-4 pb-2">
            <Button type="button" onClick={() => downloadHTMLContent(emailHTMLContent)}>
              {t("Download")}
            </Button>
            <Button type="button" variant="outline" onClick={handleCopy(emailHTMLContent)}>
              {t("Copy")}
            </Button>
          </DialogFooter>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
});

export default ExportModal;
