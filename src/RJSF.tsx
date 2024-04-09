import { RJSFSchema, UiSchema } from "@rjsf/utils";
import RjForm from "@rjsf/core";
import { get, includes } from "lodash";
import { getBlockJSONFromSchemas, getBlockJSONFromUISchemas } from "./core/functions/Controls.ts";
import { BindingWidget } from "./ui/widgets/rjsf/widgets/binding.tsx";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "./ui";
import validator from "@rjsf/validator-ajv8";
import { useState } from "react";
import { Checkbox, Link, SingleLineText, SelectOption, MultilineText } from "@chaibuilder/runtime/controls";

const propsSchema: RJSFSchema = { type: "object", properties: {} };
const uiSchema: UiSchema = {};

const activeLang = "en";
const properties = {
  name: SingleLineText({ title: "Name", default: "" }),
  area: MultilineText({ title: "Multiline", default: "" }),
  link: Link({ title: "Link", default: { href: "", type: "", target: "" } }),
  select: SelectOption({ title: "Select", options: [{ title: "Select", value: "One" }] }),
  border: Checkbox({ title: "Show Border", default: true }),
};
Object.keys(properties).forEach((key) => {
  const control = properties[key];
  if (includes(["slot", "styles"], control.type)) return;
  const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
  propsSchema.properties[propKey] = getBlockJSONFromSchemas(control, activeLang);
  uiSchema[propKey] = getBlockJSONFromUISchemas(control, activeLang);
});

function RJSF() {
  const [formData] = useState({});
  return (
    <RjForm
      widgets={{
        binding: BindingWidget,
        richtext: RTEField,
        icon: IconPickerField,
        image: ImagePickerField,
      }}
      fields={{
        link: LinkField,
      }}
      idSeparator="."
      autoComplete="off"
      omitExtraData={false}
      liveOmit={false}
      liveValidate
      validator={validator}
      uiSchema={uiSchema}
      onBlur={() => {}}
      schema={propsSchema}
      formData={formData}
      onChange={() => {}}
    />
  );
}

export default RJSF;
