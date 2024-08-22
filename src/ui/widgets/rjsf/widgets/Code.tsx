import { WidgetProps } from "@rjsf/utils";
import { useTranslation } from "react-i18next";
import { Button } from "../../../radix/components/ui/button.tsx";
import { useCodeEditor } from "../../../../core/hooks/useCodeEditor.ts";
import { useSelectedBlock } from "../../../../core/hooks";
import { ChaiBlock } from "../../../../core/types/ChaiBlock.ts";

const CodeEditor = ({ id, placeholder, value }: WidgetProps) => {
  const { t } = useTranslation();
  const [, setCodeEditor] = useCodeEditor();
  const selectedBlock = useSelectedBlock() as ChaiBlock;
  if (typeof window === "undefined") return null;

  const openCodeEditor = () => {
    const blockId = selectedBlock?._id;
    const blockProp = id.replace("root.", "");
    // @ts-ignore
    setCodeEditor({ blockId, blockProp, placeholder, initialCode: value });
  };

  return (
    <div className={"mt-2 flex flex-col gap-y-1"}>
      <button
        onClick={openCodeEditor}
        className="text-pretty w-[90%] max-w-full cursor-default truncate rounded border bg-white p-2 text-left text-[10px]">
        {value.trim().length > 0
          ? value.substring(0, 46)
          : placeholder || "Eg: <script>console.log('Hello, world!');</script>"}
      </button>
      <Button onClick={openCodeEditor} size={"sm"} variant={"outline"} className={"w-fit"}>
        {t("Open code editor")}
      </Button>
    </div>
  );
};

export { CodeEditor };
