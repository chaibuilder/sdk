import Editor from "@monaco-editor/react";
import { Button } from "../../../../ui";
import { useTranslation } from "react-i18next";

export default function CodeEditor() {
  const { t } = useTranslation();
  return (
    <div className="h-full border-t-4 border-green-600">
      <div className="flex items-center justify-between">
        <h1>Code Editor</h1>
        <div>
          <Button size={"sm"} variant={"outline"} className={"w-fit"}>
            {t("Update")}
          </Button>
          <Button size={"sm"} variant={"outline"} className={"w-fit"}>
            {t("Close")}
          </Button>
        </div>
      </div>
      <Editor
        height="100%"
        defaultLanguage="html"
        defaultValue=""
        options={{
          minimap: {
            enabled: false,
          },
        }}
      />
    </div>
  );
}
