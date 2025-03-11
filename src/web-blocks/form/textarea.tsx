import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { InputIcon } from "@radix-ui/react-icons";
import { generateUUID } from "../../core/functions/Functions";

export type TextAreaProps = {
  fieldName: string;
  showLabel: boolean;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  rows: number;
  label: string;
  placeholder: string;
};

const TextAreaBlock = (props: ChaiBlockComponentProps<TextAreaProps>) => {
  const { blockProps, fieldName, label, placeholder, styles, inputStyles, rows, showLabel, required } = props;
  const fieldId = generateUUID();

  if (!showLabel) {
    return (
      <textarea
        id={fieldId}
        name={fieldName}
        {...blockProps}
        {...inputStyles}
        {...styles}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    );
  }

  return (
    <div {...styles} {...blockProps}>
      {showLabel && <label htmlFor={fieldId}>{label}</label>}
      <textarea
        name={fieldName}
        {...inputStyles}
        id={fieldId}
        placeholder={placeholder}
        rows={rows}
        required={required}
      />
    </div>
  );
};

const Config = {
  type: "TextArea",
  label: "web_blocks.textarea",
  category: "core",
  icon: InputIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      fieldName: {
        type: "string",
        title: "Field Name",
        default: "fieldName",
      },
      styles: StylesProp(""),
      inputStyles: StylesProp("w-full p-1"),
      showLabel: {
        type: "boolean",
        title: "Show Label",
        default: true,
      },
      label: {
        type: "string",
        title: "Label",
        default: "Label",
        ui: { "ui:widget": "textarea", "ui:autosize": true, "ui:rows": 3 },
      },
      placeholder: {
        type: "string",
        title: "Placeholder",
        default: "Placeholder",
      },
      rows: {
        type: "number",
        title: "Rows",
        default: 3,
      },
      required: {
        type: "boolean",
        title: "Required",
        default: false,
      },
    },
  }),
  aiProps: ["label", "placeholder"],
  i18nProps: ["label", "placeholder"],
};

export { TextAreaBlock as Component, Config };
