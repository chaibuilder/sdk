import { memo } from "react";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { includes } from "lodash-es";
import { getBlockJSONFromSchemas, getBlockJSONFromUISchemas } from "../../functions/Controls.ts";
import RjForm from "@rjsf/core";
import { BindingWidget } from "../../../ui/widgets/rjsf/widgets/binding.tsx";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "../../../ui";
import validator from "@rjsf/validator-ajv8";

type JSONFormType = {
  formData: any;
  properties: any;
  onChange: ({ formData }: any, key?: string) => void;
};
/**
 *
 * @param param0
 * @returns JSONForm for Static and name fields
 */
export const JSONForm = memo(({ properties, formData, onChange }: JSONFormType) => {
  const propsSchema: RJSFSchema = { type: "object", properties: {} };
  const uiSchema: UiSchema = {};

  Object.keys(properties).forEach((key) => {
    const control = properties[key];
    if (includes(["slot", "styles"], control.type)) return;
    const propKey = key;
    propsSchema.properties[propKey] = getBlockJSONFromSchemas(control);
    uiSchema[propKey] = getBlockJSONFromUISchemas(control);
  });

  return (
    <RjForm
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
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
      formData={formData}
      onChange={onChange}
    />
  );
});
