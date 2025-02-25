import { useThrottledCallback } from "@react-hookz/web";
import RjForm from "@rjsf/core";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import validator from "@rjsf/validator-ajv8";
import { includes } from "lodash-es";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getBlockJSONFromSchemas, getBlockJSONFromUISchemas } from "../../functions/Controls.ts";
import { useLanguages } from "../../hooks/useLanguages.ts";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "../../rjsf-widgets";
import { BindingWidget } from "../../rjsf-widgets/binding.tsx";
import { CodeEditor } from "../../rjsf-widgets/Code.tsx";

type JSONFormType = {
  id?: string;
  formData: any;
  properties: any;
  onChange: ({ formData }: any, key?: string) => void;
};
/**
 *
 * @param param0
 * @returns JSONForm for Static and name fields
 */
export const JSONForm = memo(({ id, properties, formData, onChange }: JSONFormType) => {
  const [form, setForm] = useState<any>(formData);
  const propsSchema: RJSFSchema = { type: "object", properties: {} };
  const uiSchema: UiSchema = {};
  const { t } = useTranslation();
  const { selectedLang, fallbackLang, languages } = useLanguages();
  const lang = languages.length === 0 ? "" : selectedLang.length ? selectedLang : fallbackLang;

  Object.keys(properties).forEach((key) => {
    const control = properties[key];
    if (includes(["slot", "styles"], control.type)) return;
    const propKey = key;
    propsSchema.properties[propKey] = getBlockJSONFromSchemas(control, t, lang);
    uiSchema[propKey] = getBlockJSONFromUISchemas(control);
  });

  useEffect(() => {
    setForm(formData);
  }, [id, selectedLang]);

  const throttledChange = useThrottledCallback(
    async ({ formData }: any, id?: string) => {
      onChange({ formData }, id);
    },
    [onChange],
    400, // save only every 5 seconds
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
      fields={{ link: LinkField }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate={false}
      validator={validator}
      uiSchema={uiSchema}
      schema={propsSchema}
      formData={form}
      onChange={({ formData: fD }, id) => {
        if (!id) return;
        setForm(fD);
        throttledChange({ formData: fD }, id);
      }}
    />
  );
});
