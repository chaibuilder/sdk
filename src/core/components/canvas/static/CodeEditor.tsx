import Editor from "@monaco-editor/react";
import { Button, useToast } from "../../../../ui";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useAtom } from "jotai/index";
import { codeEditorOpenAtom } from "../../../atoms/ui.ts";

export default function CodeEditor() {
  const { t } = useTranslation();
  const [dirty, setDirty] = useState(false);
  const [, setCode] = useState("");
  const [, setShowCodeEditor] = useAtom(codeEditorOpenAtom);
  const { toast } = useToast();
  const closeCodeEditor = () => {
    if (dirty) {
      toast({
        title: t("Unsaved changes"),
        description: t("You have unsaved changes. Please save before closing the code editor or cancel"),
        variant: "destructive",
      });
      return;
    }
    setShowCodeEditor(false);
    setDirty(false);
    setCode("");
  };
  return (
    <div className="h-full rounded-t-lg border-t-4 border-black bg-black text-white">
      {dirty ? <button onClick={closeCodeEditor} className="fixed inset-0 z-[100000] bg-gray-400/10"></button> : null}
      <div className="relative z-[100001] h-full w-full flex-col gap-y-1">
        <div className="-mt-1 flex items-center justify-between px-2 py-2">
          <h3 className="space-x-3 text-sm font-semibold">
            <span>{t("HTML Code Editor |")}</span>
            <span className="text-xs text-gray-400">
              {t("Scripts will be only executed in preview and live mode.")}
            </span>
          </h3>
          <div className="flex gap-x-2">
            <Button
              onClick={() => setShowCodeEditor(false)}
              size={"sm"}
              variant={"outline"}
              className={"h-6 w-fit text-red-600"}>
              {t("Close")}
            </Button>
          </div>
        </div>
        <Editor
          onChange={(value) => {
            setDirty(true);
            setCode(value);
          }}
          height="100%"
          defaultLanguage="html"
          theme={"vs-dark"}
          defaultValue=""
          options={{
            minimap: {
              enabled: false,
            },
          }}
        />
      </div>
    </div>
  );
}
