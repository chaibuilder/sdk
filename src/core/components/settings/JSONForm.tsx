import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { useThrottledCallback } from "@react-hookz/web";
import RjForm from "@rjsf/core";
import { FieldTemplateProps, RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { useAtom } from "jotai";
import { get, isEmpty, take } from "lodash-es";
import { ChevronDown, ChevronRight, List, Plus } from "lucide-react";
import { memo, useEffect, useState } from "react";
import { Badge } from "../../../ui/index.ts";
import { chaiRjsfFieldsAtom, chaiRjsfTemplatesAtom, chaiRjsfWidgetsAtom } from "../../atoms/builder.ts";
import { LANGUAGES } from "../../constants/LANGUAGES.ts";
import { useLanguages } from "../../hooks/useLanguages.ts";
import { useSelectedBlock } from "../../hooks/useSelectedBlockIds.ts";
import { IconPickerField, ImagePickerField, LinkField, RTEField, RowColField, SliderField } from "../../rjsf-widgets";
import { BindingWidget } from "../../rjsf-widgets/binding.tsx";
import { CodeEditor } from "../../rjsf-widgets/Code.tsx";

type JSONFormType = {
  id?: string;
  formData: any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  onChange: ({ formData }: any, key?: string) => void;
};

const CustomFieldTemplate = ({
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
}: FieldTemplateProps) => {
  const { selectedLang, fallbackLang, languages } = useLanguages();
  const lang = isEmpty(languages) ? "" : isEmpty(selectedLang) ? fallbackLang : selectedLang;
  const currentLanguage = get(LANGUAGES, lang, lang);

  const selectedBlock = useSelectedBlock();
  const registeredBlocks = useRegisteredChaiBlocks();
  const i18nProps = get(registeredBlocks, [selectedBlock?._type, "i18nProps"], []) || [];
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
        <label htmlFor={id} className={schema.type === "object" ? "pb-2" : ""}>
          {label} {showLangSuffix && <small className="text-[9px] text-zinc-400"> {currentLanguage}</small>}
          {required && schema.type !== "object" ? " *" : null}
        </label>
      )}
      {description}
      {children}
      {errors}
      {help}
    </div>
  );
};

const CustomAddButton = (props) => (
  <button {...props} className="duration absolute right-2 top-2 cursor-pointer text-blue-400 hover:text-blue-500">
    <div className="flex items-center gap-x-0.5 text-[11px] leading-tight">
      <Plus className="h-3 w-3" /> <span>Add</span>
    </div>
  </button>
);

export const JSONForm = memo(({ id, schema, uiSchema, formData, onChange }: JSONFormType) => {
  const [form, setForm] = useState<any>(formData);
  const { selectedLang } = useLanguages();
  const [widgets] = useAtom(chaiRjsfWidgetsAtom);
  const [fields] = useAtom(chaiRjsfFieldsAtom);
  const [templates] = useAtom(chaiRjsfTemplatesAtom);

  useEffect(() => {
    setForm(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedLang]);

  const throttledChange = useThrottledCallback(
    async ({ formData }: any, id?: string) => {
      onChange({ formData }, id);
    },
    [onChange, selectedLang],
    1000, // save only every 5 seconds
  );

  return (
    <RjForm
      key={selectedLang}
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
        code: CodeEditor,
        colCount: RowColField,
        ...widgets,
      }}
      fields={{
        link: LinkField,
        slider: SliderField,
        ...fields,
      }}
      templates={{
        FieldTemplate: CustomFieldTemplate,
        ButtonTemplates: {
          AddButton: CustomAddButton,
        },
        ...templates,
      }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate={false}
      validator={validator}
      uiSchema={uiSchema}
      schema={schema}
      formData={form}
      onChange={({ formData: fD }, id) => {
        if (!id) return;
        const prop = take(id.split("."), 2).join(".").replace("root.", "");
        setForm(fD);
        throttledChange({ formData: fD }, prop);
      }}
    />
  );
});
