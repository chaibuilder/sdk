import { WidgetProps } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai/index";
import { codeEditorOpenAtom } from "../../../../core/atoms/ui.ts";
import { Button } from "../../../radix/components/ui/button.tsx";

const CodeEditor = ({ id, placeholder, value }: WidgetProps) => {
  const { t } = useTranslation();
  const [, setShowCodeEditor] = useAtom(codeEditorOpenAtom);
  if (typeof window === "undefined") return null;

  console.log(id, value, placeholder);
  return (
    <div className={"flex flex-col gap-y-1"}>
      <Button onClick={() => setShowCodeEditor(true)} size={"sm"} variant={"outline"} className={"mt-2 w-fit"}>
        {t("Open in Code Editor")}
      </Button>
    </div>
  );
};

export { CodeEditor };
