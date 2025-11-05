import { Button } from "@/ui/shadcn/components/ui/button";
import Editor from "@monaco-editor/react";
import { useState } from "react";

interface CodeDisplayProps {
  code: string;
  onCopy: (code: string) => void;
  onDownload: (code: string) => void;
}

export default function CodeDisplay({ code, onCopy, onDownload }: CodeDisplayProps) {
  const [editorCode, setEditorCode] = useState(code);

  const handleCopy = () => {
    onCopy(editorCode);
  };

  const handleDownload = () => {
    onDownload(editorCode);
  };

  return (
    <div className="flex flex-col gap-4">
      
      <div className="h-[600px] max-h-full rounded-md border overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="jsx"
          value={editorCode}
          onChange={(value) => setEditorCode(value || "")}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: "on",
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            wordWrap: "on",
            bracketPairColorization: { enabled: true },
            suggest: {
              showKeywords: false,
              showSnippets: false,
            },
          }}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCopy}>
          Copy
        </Button>
        <Button type="button" onClick={handleDownload}>
          Download
        </Button>
      </div>
    </div>
  );
}
