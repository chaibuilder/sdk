import { ErrorBoundary } from "./core/components/ErrorBoundary";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui";
import { CodeBlock, oneLight } from "@react-email/components";

interface ExportModalProps {
  content: any;
  handleClick: () => Promise<string>;
}

const ExportModal: React.FC<ExportModalProps> = ({ content, handleClick }) => {
  const [emailHTMLContent, setEmailHTMLContent] = useState<string>("");

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
          <CodeBlock code={emailHTMLContent} language="html" theme={oneLight} />
        </ErrorBoundary>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
