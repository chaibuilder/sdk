import { usePageExternalData } from "@/core/atoms/builder";
import { LANGUAGES } from "@/core/constants/LANGUAGES";
import { useLanguages, useSelectedBlock } from "@/core/hooks";
import { Badge } from "@/ui/shadcn/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/ui/shadcn/components/ui/tooltip";
import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { FieldTemplateProps } from "@rjsf/utils";
import { get, isEmpty } from "lodash-es";
import { ChevronDown, ChevronRight, Info, List } from "lucide-react";
import { useMemo, useState } from "react";
import { DataBindingSelector } from "./data-binding-selector";

const JSONFormFieldTemplate = ({
  id,
  classNames,
  label,
  children,
  errors,
  help,
  description,
  hidden,
  required,
  schema,
  formData,
  onChange,
}: FieldTemplateProps) => {
  const { selectedLang, fallbackLang, languages } = useLanguages();
  const lang = useMemo(
    () => (isEmpty(languages) ? "" : isEmpty(selectedLang) ? fallbackLang : selectedLang),
    [languages, selectedLang, fallbackLang],
  );
  const currentLanguage = useMemo(() => get(LANGUAGES, lang, lang), [lang]);
  const pageExternalData = usePageExternalData();

  const selectedBlock = useSelectedBlock();
  const registeredBlocks = useRegisteredChaiBlocks();
  const i18nProps = useMemo(
    () => get(registeredBlocks, [selectedBlock?._type, "i18nProps"], []),
    [registeredBlocks, selectedBlock?._type],
  );
  const [openedList, setOpenedList] = useState<null | string>(null);

  if (hidden) {
    return null;
  }

  const isCheckboxOrRadio = schema.type === "boolean";
  if (isCheckboxOrRadio) return <div className={classNames}>{children}</div>;

  const showLangSuffix = i18nProps?.includes(id.replace("root.", ""));

  if (schema.type === "array") {
    const isListOpen = openedList === id;

    return (
      <div className={`${classNames} relative`}>
        {schema.title && (
          <label
            htmlFor={id}
            onClick={() => setOpenedList(isListOpen ? null : id)}
            className="flex cursor-pointer items-center gap-x-1 py-1 leading-tight duration-200 hover:bg-slate-100">
            {isListOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
            <List className="h-3 w-3" />
            <span className="leading-tight">{label}</span>&nbsp;
            <Badge className="m-0 bg-gray-200 px-2 leading-tight text-gray-500 hover:bg-gray-200 hover:text-gray-500">
              <span className="text-[9px] font-medium text-slate-600">{formData?.length}</span>
            </Badge>
          </label>
        )}
        {formData?.length === 0 ? (
          <div className="h-0 overflow-hidden">{children}</div>
        ) : (
          <div className={`${!isListOpen ? "h-0 overflow-hidden" : "pt-0.5"}`}>
            {description}
            {children}
            {errors}
            {help}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={classNames}>
      {schema.title && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor={id} className={schema.type === "object" ? "pb-2" : ""}>
              {label} {showLangSuffix && <small className="text-[9px] text-zinc-400"> {currentLanguage}</small>}
              {required && schema.type !== "object" ? " *" : null}
            </label>
            {schema.description && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground/70" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                   {schema.description}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {!schema.enum && !schema.oneOf && pageExternalData && (
            <>
              <DataBindingSelector
                schema={schema}
                onChange={(value) => {
                  onChange(value, formData, id);
                }}
                id={id}
                formData={formData}
              />
            </>
          )}
        </div>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
};

export default JSONFormFieldTemplate;
