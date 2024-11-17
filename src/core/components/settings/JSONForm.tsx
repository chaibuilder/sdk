import { memo, useEffect, useState } from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import RjForm from "@rjsf/core";
import { BindingWidget } from "../../rjsf-widgets/binding.tsx";
import { IconPickerField, ImagePickerField, RTEField } from "../../rjsf-widgets";
import validator from "@rjsf/validator-ajv8";
import { useThrottledCallback } from "@react-hookz/web";
import { CodeEditor } from "../../rjsf-widgets/Code.tsx";
import { useLanguages } from "../../hooks/useLanguages.ts";

type JSONFormType = {
  id?: string;
  formData: any;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  onChange: ({ formData }: any, key?: string) => void;
};
/**
 *
 * @param param0
 * @returns JSONForm for Static and name fields
 */
export const JSONForm = memo(({ id, schema, uiSchema, formData, onChange }: JSONFormType) => {
  const [form, setForm] = useState<any>(formData);
  const { selectedLang, fallbackLang, languages } = useLanguages();
  const lang = languages.length === 0 ? "" : selectedLang.length ? selectedLang : fallbackLang;

  useEffect(() => {
    setForm(formData);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, selectedLang]);

  const throttledChange = useThrottledCallback(
    async ({ formData }: any, id?: string) => {
      onChange({ formData }, id);
    },
    [onChange],
    1000, // save only every 5 seconds
  );

  return (
    <RjForm
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
        code: CodeEditor,
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
        setForm(fD);
        throttledChange({ formData: fD }, id);
      }}
    />
  );
});
