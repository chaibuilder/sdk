import { LANGUAGES } from "@/core/constants/LANGUAGES";
import { useCodeEditor, useLanguages, useSelectedBlock } from "@/core/hooks";
import { ChaiBlock } from "@/types/chai-block";
import { Button } from "@/ui/shadcn/components/ui/button";
import { ChaiBlockDefinition, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { WidgetProps } from "@rjsf/utils";
import { get, includes } from "lodash-es";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const CodeEditor = ({ id, placeholder }: WidgetProps) => {
  const { t } = useTranslation();
  const [, setCodeEditor] = useCodeEditor();
  const { selectedLang } = useLanguages();
  const selectedBlock = useSelectedBlock() as ChaiBlock;
  if (typeof window === "undefined") return null;
  const blockProp = id.replace("root.", "");
 const registeredBlock = getRegisteredChaiBlock(selectedBlock?._type) as ChaiBlockDefinition;
  const hasI18n = includes(get(registeredBlock, "i18nProps", []), blockProp);
  const blockPropWithLang = hasI18n ? (selectedLang ? `${blockProp}-${selectedLang}` : blockProp) : blockProp;
  const value = get(selectedBlock, blockPropWithLang, "");
  const currentLanguage = useMemo(() => get(LANGUAGES, selectedLang, selectedLang), [selectedLang]);

  const openCodeEditor = () => {
    const blockId = selectedBlock?._id;
    // @ts-ignore
    setCodeEditor({ blockId, blockProp: blockPropWithLang, placeholder, initialCode: value });
  };

  return (
    <div className={"mt-2 flex flex-col gap-y-1"}>
      <label htmlFor={id}>
        HTML Code
        {currentLanguage && <small className="text-[9px] text-zinc-400">&nbsp;{currentLanguage}</small>}
      </label>

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
