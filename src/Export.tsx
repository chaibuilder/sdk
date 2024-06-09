import { useState } from "react";

import { ClipboardIcon } from "@radix-ui/react-icons";
import { useCopyToClipboard } from "./core/hooks/useCopyToClipboard";

import clsx from "clsx";

import { ErrorBoundary } from "./core/components/ErrorBoundary";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/radix/components/ui/tooltip";

import { CodeBlock, oneLight } from "@react-email/components";

interface ExportModalProps {
  content: any;
  handleClick: () => Promise<string>;
}

const ExportModal: React.FC<ExportModalProps> = ({ content, handleClick }) => {
  const [emailHTMLContent, setEmailHTMLContent] = useState<string>("");

  const [copiedText, copy] = useCopyToClipboard();

  const [isCopied, setIsCopied] = useState<boolean>(false);

  const handleCopy = (text: string) => () => {
    copy(text)
      .then(() => {
        setIsCopied(true);
        console.log("Copied!", { copiedText, text });
      })
      .catch((error) => {
        setIsCopied(false);
        console.error("Failed to copy!", error);
      });
  };

  return (
    <Dialog>
      <DialogTrigger
        className="rounded-md bg-blue-500 px-4 py-2 text-white"
        onClick={() => {
          handleClick().then((html) => {
            setEmailHTMLContent(html);
          });
        }}>
        {content}
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] max-w-xl gap-0 overflow-auto p-0 lg:max-w-2xl xl:max-w-3xl 2xl:max-w-4xl">
        <ErrorBoundary>
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between px-4 py-3.5 font-bold">HTML</DialogTitle>
          </DialogHeader>
          <div className="absolute inset-0 right-2 top-[3.8rem] flex justify-end">
            <Tooltip>
              <TooltipTrigger asChild>
                <ClipboardIcon
                  onClick={handleCopy(emailHTMLContent)}
                  className={clsx(
                    "size-6 cursor-pointer rounded-md border bg-zinc-200 p-1 transition-all ease-in-out hover:bg-zinc-400",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="left">
                <p className="text-sm tracking-wide">{`${!isCopied ? "Copy" : "Copied"} to clipboard`}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <CodeBlock code={emailHTMLContent} language="html" theme={oneLight} />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
