import React, { useState, useCallback } from "react";
import { ClipboardIcon, DownloadIcon } from "@radix-ui/react-icons";
import { useCopyToClipboard } from "./core/hooks/useCopyToClipboard";
import { ErrorBoundary } from "./core/components/ErrorBoundary";
import { Button, Dialog, DialogContent, DialogFooter, DialogTrigger } from "./ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/radix/components/ui/tooltip";
import { CodeBlock, oneLight } from "@react-email/components";
import { DialogClose } from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";

interface ExportModalProps {
  content: any;
  handleClick: () => Promise<string>;
}

const ExportModal: React.FC<ExportModalProps> = React.memo(({ content, handleClick }) => {
  const [emailHTMLContent, setEmailHTMLContent] = useState<string>("");
  const [copiedText, copy] = useCopyToClipboard();
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const { t } = useTranslation();

  const handleCopy = useCallback(
    (text: string) => () => {
      copy(text)
        .then(() => {
          setIsCopied(true);
          console.log("Copied!", { copiedText, text });
        })
        .catch((error) => {
          setIsCopied(false);
          console.error("Failed to copy!", error);
        });
    },
    [copy, copiedText],
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
            HTML
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <DownloadIcon
                    onClick={() => downloadHTMLContent(emailHTMLContent)}
                    className={`size-6 cursor-pointer rounded-md border p-1 transition-all ease-in-out`}
                  />
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-sm tracking-wide">Download</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ClipboardIcon
                    onClick={handleCopy(emailHTMLContent)}
                    className={`size-6 cursor-pointer rounded-md border p-1 transition-all ease-in-out`}
                  />
                </TooltipTrigger>
                <TooltipContent side="left">
                  <p className="text-sm tracking-wide">{`${!isCopied ? "Copy" : "Copied"} to clipboard`}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          <CodeBlock code={emailHTMLContent} language="html" theme={oneLight} />
          <DialogFooter className="flex px-4 pb-2">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {t("cancel")}
              </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="button">{t("save")}</Button>
            </DialogClose>
          </DialogFooter>
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
});

export default ExportModal;
