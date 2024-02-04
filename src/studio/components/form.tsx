import React from "react";
import RjFrom, { IChangeEvent } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { RJSFSchema, UiSchema } from "@rjsf/utils";
import { first, get, includes, set } from "lodash";
import { IconPickerField, ImagePickerField, LinkField, RTEField } from "../../ui";

const getBlockJSONFromUISchemas = (control: any, activeLang: string = "") => {
  switch (control.type) {
    case "singular":
      return (control as any).uiSchema;
    case "model":
      const { properties: modelProperties } = control as any;

      const modelProps: Record<string, any> = {};
      Object.keys(modelProperties).forEach((key) => {
        const control = modelProperties[key];
        if (includes(["slot", "styles"], control.type)) return;
        const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
        modelProps[propKey] = getBlockJSONFromUISchemas(control, activeLang);
      });
      return modelProps;
    case "list":
      const { itemProperties } = control as any;
      const listProps: { items: Record<string, any> } = {
        items: {},
      };
      Object.keys(itemProperties).forEach((key) => {
        const control = itemProperties[key];
        if (includes(["slot", "styles"], control.type)) return;
        const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
        listProps.items[propKey] = getBlockJSONFromUISchemas(control, activeLang);
      });
      return listProps;
    default:
      return {};
  }
};

const getBlockJSONFromSchemas = (control: any, activeLang: string = "") => {
  switch (control.type) {
    case "singular":
      return (control as any).schema;
    case "model":
      const { properties: modelProperties, title: modelTitle } = control as any;
      const modelProps: Record<string, any> = {
        title: modelTitle,
        type: "object",
        properties: {},
      };
      Object.keys(modelProperties).forEach((key) => {
        const control = modelProperties[key];
        if (includes(["slot", "styles"], control.type)) return;
        const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
        modelProps.properties[propKey] = getBlockJSONFromSchemas(control, activeLang);
      });
      return modelProps;
    case "list":
      const { itemProperties, title: listTitle } = control as any;
      const listProps: Record<string, any> = {
        title: listTitle,
        type: "array",
        items: {
          type: "object",
          properties: {},
        },
      };
      Object.keys(itemProperties).forEach((key) => {
        const control = itemProperties[key];
        if (includes(["slot", "styles"], control.type)) return;
        const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
        listProps.items.properties[propKey] = getBlockJSONFromSchemas(control, activeLang);
        set(listProps.items, "title", get(control, "itemTitle", `${listTitle} item`));
      });
      return listProps;
    default:
      return {};
  }
};

const Form = ({
  title,
  properties = {},
  formData: _formData,
  onChange,
  disabled = false,
  activeLang = "",
}: {
  activeLang?: string;
  disabled?: boolean;
  formData: any;
  onChange: ({ formData }: any, key?: string) => void;
  properties: any;
  title?: string;
}): React.ReactElement => {
  const propsSchema: RJSFSchema = {
    type: "object",
    properties: {},
  };
  const uiSchema: UiSchema = {};

  Object.keys(properties).forEach((key) => {
    const control = properties[key];
    if (includes(["slot", "styles"], control.type)) return;
    const propKey = get(control, "i18n", false) ? `${key}-${activeLang}` : key;
    // @ts-ignore
    propsSchema.properties[propKey] = getBlockJSONFromSchemas(control, activeLang);
    uiSchema[propKey] = getBlockJSONFromUISchemas(control, activeLang);
  });

  const handleChange = ({ ...rest }: IChangeEvent, id?: string) => {
    const path = id?.replace("root.", "").split("/").pop() as string;
    if (!id || !path) return;
    const key: string = first(path.split(".")) as string;
    if (id && key) onChange({ ...rest } as any, key);
  };

  return (
    <>
      {title && <h1 className="px-1 text-sm font-semibold underline">{title}</h1>}
      <div className="-mx-3">
        <RjFrom
          widgets={{
            richtext: RTEField,
            icon: IconPickerField,
            image: ImagePickerField,
          }}
          fields={{
            link: LinkField,
          }}
          idSeparator="."
          autoComplete="off"
          omitExtraData
          liveOmit
          liveValidate
          uiSchema={uiSchema}
          schema={propsSchema}
          formData={_formData}
          validator={validator}
          onChange={handleChange}
          disabled={disabled}
        />
      </div>
    </>
  );
};

export { Form };
