import { useCodeEditor, useSelectedBlock } from "@/core/hooks";
import { ChaiBlock } from "@/types/chai-block";
import { Button } from "@/ui/shadcn/components/ui/button";
import { WidgetProps } from "@rjsf/utils";
import { get } from "lodash-es";
import { useTranslation } from "react-i18next";

const CodeEditor = ({ id, placeholder }: WidgetProps) => {
  const { t } = useTranslation();
  const [, setCodeEditor] = useCodeEditor();
  const selectedBlock = useSelectedBlock() as ChaiBlock;
  if (typeof window === "undefined") return null;
  const blockProp = id.replace("root.", "");
  const value = get(selectedBlock, blockProp, "");
  const openCodeEditor = () => {
    const blockId = selectedBlock?._id;

    // @ts-ignore
    setCodeEditor({ blockId, blockProp, placeholder, initialCode: get(selectedBlock, blockProp, value) });
  };

  return (
    <div className={"mt-2 flex flex-col gap-y-1"}>
      <button
        onClick={openCodeEditor}
        className="w-[90%] max-w-full cursor-default truncate text-pretty rounded border border-border bg-background p-2 text-left text-[10px]">
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
