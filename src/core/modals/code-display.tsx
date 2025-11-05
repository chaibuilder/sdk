import { useState } from "react";
import { Button } from "@/ui/shadcn/components/ui/button";
import { ScrollArea } from "@/ui/shadcn/components/ui/scroll-area";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodeDisplayProps {
  code: string;
  onCopy: (code: string) => void;
  onDownload: (code: string) => void;
}

export default function CodeDisplay({ code, onCopy, onDownload }: CodeDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editableCode, setEditableCode] = useState(code);

  const handleEditToggle = () => {
    if (isEditing) {
      // When switching from edit to view, update the code
      setEditableCode(code);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    setEditableCode(editableCode);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditableCode(code);
    setIsEditing(false);
  };

  const handleCopy = () => {
    onCopy(isEditing ? editableCode : code);
  };

  const handleDownload = () => {
    onDownload(isEditing ? editableCode : code);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {isEditing ? "Editing JSX code" : "JSX code preview"}
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button type="button" size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={handleEditToggle}>
              Edit
            </Button>
          )}
        </div>
      </div>
      
      <ScrollArea className="h-[400px] max-h-full rounded-md border p-4">
        {isEditing ? (
          <textarea
            value={editableCode}
            onChange={(e) => setEditableCode(e.target.value)}
            className="w-full h-full min-h-[350px] p-3 font-mono text-xs bg-transparent border-none outline-none resize-none"
            style={{ 
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
              lineHeight: '1.5'
            }}
            spellCheck={false}
          />
        ) : (
          <SyntaxHighlighter 
            language="jsx" 
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: 0,
              background: 'transparent',
              fontSize: '12px',
            }}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </ScrollArea>
      
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
