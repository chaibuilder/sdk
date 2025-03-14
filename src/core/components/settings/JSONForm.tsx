import {useThrottledCallback} from "@react-hookz/web";
import RjForm from "@rjsf/core";
import {RJSFSchema, UiSchema} from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import {useAtom} from "jotai";
import {take} from "lodash-es";
import {Plus} from "lucide-react";
import {memo} from "react";
import {chaiRjsfFieldsAtom, chaiRjsfTemplatesAtom, chaiRjsfWidgetsAtom,} from "../../atoms/builder.ts";
import {useLanguages} from "../../hooks";
import {IconPickerField, ImagePickerField, LinkField, RowColField, RTEField, SliderField} from "../../rjsf-widgets";
import {BindingWidget} from "../../rjsf-widgets/binding.tsx";
import {CodeEditor} from "../../rjsf-widgets/Code.tsx";
import JSONFormFieldTemplate from "./JSONFormFieldTemplate.tsx";

type JSONFormType = {
  blockId?: string;
  formData: any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  onChange: ({ formData }: any, key?: string) => void;
};

const CustomAddButton = (props) => (
  <button {...props} className="duration absolute right-2 top-2 cursor-pointer text-blue-400 hover:text-blue-500">
    <div className="flex items-center gap-x-0.5 text-[11px] leading-tight">
      <Plus className="h-3 w-3" /> <span>Add</span>
    </div>
  </button>
);

export const JSONForm = memo(({ blockId, schema, uiSchema, formData, onChange }: JSONFormType) => {
  const { selectedLang } = useLanguages();
  const [widgets] = useAtom(chaiRjsfWidgetsAtom);
  const [fields] = useAtom(chaiRjsfFieldsAtom);
  const [templates] = useAtom(chaiRjsfTemplatesAtom);

  const throttledChange = useThrottledCallback(
    async ({ formData }: any, id?: string) => {
      onChange({ formData }, id);
    },
    [onChange, selectedLang],
    400, // save only every 5 seconds
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
        FieldTemplate: JSONFormFieldTemplate,
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
      formData={formData}
      onChange={({ formData: fD }, id) => {
        if (!id || blockId !== fD?._id) return;
        const prop = take(id.split("."), 2).join(".").replace("root.", "");
        throttledChange({ formData: fD }, prop);
      }}
    />
  );
});
