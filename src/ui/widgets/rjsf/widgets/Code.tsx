// @ts-ignore
import ReactQuill from "react-quill";
import { WidgetProps } from "@rjsf/utils";
import { Textarea } from "../../../radix/components/ui/textarea.tsx";
import { Button } from "../../../radix/components/ui/button.tsx";
import { useTranslation } from "react-i18next";
import { useAtom } from "jotai/index";
import { codeEditorOpenAtom } from "../../../../core/atoms/ui.ts";

const CodeEditor = ({ id, placeholder, value, onChange, onBlur }: WidgetProps) => {
  const { t } = useTranslation();
  const [, setShowCodeEditor] = useAtom(codeEditorOpenAtom);
  if (typeof window === "undefined") return null;

  return (
    <div className={"flex flex-col gap-y-1"}>
      <Textarea
        id={id}
        rows={10}
        value={value}
        // @ts-ignore
        onBlur={(event: string) => onBlur(id, event.target.value)}
        onChange={(event: any) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-1 block rounded-md bg-white font-mono text-xs"
      />
      <Button onClick={() => setShowCodeEditor(true)} size={"sm"} variant={"outline"} className={"w-fit"}>
        {t("Open in Code Editor")}
      </Button>
    </div>
  );
};

export { CodeEditor };
