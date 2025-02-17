import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { InputIcon } from "@radix-ui/react-icons";
import { generateUUID } from "../../core/functions/Functions";

export type InputProps = {
  fieldName: string;
  showLabel: boolean;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  inputType: string;
  label: string;
  placeholder: string;
};

const InputBlock = (props: ChaiBlockComponentProps<InputProps>) => {
  const { blockProps, fieldName, label, placeholder, styles, inputStyles, showLabel, required, inputType } = props;
  const fieldId = generateUUID();

  if (!showLabel) {
    return (
      <input
        id={fieldId}
        name={fieldName}
        {...blockProps}
        {...inputStyles}
        {...styles}
        type={inputType}
        placeholder={placeholder}
        required={required}
      />
    );
  }

  return (
    <div {...styles} {...blockProps}>
      {showLabel && <label htmlFor={fieldId}>{label}</label>}
      <input
        name={fieldName}
        {...inputStyles}
        id={fieldId}
        type={inputType}
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

const Config = {
  type: "Input",
  label: "web_blocks.input",
  category: "core",
  icon: InputIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      inputStyles: StylesProp("w-full p-1"),
      fieldName: {
        type: "string",
        title: "Field Name",
        default: "fieldName",
      },
      showLabel: {
        type: "boolean",
        title: "Show Label",
        default: true,
      },
      label: {
        type: "string",
        title: "Label",
        default: "Label",
        ai: true,
        i18n: true,
      },
      placeholder: {
        type: "string",
        title: "Placeholder",
        default: "Placeholder",
      },
      required: {
        type: "boolean",
        title: "Required",
        default: false,
      },
      inputType: {
        type: "string",
        title: "Input Type",
        default: "text",
        enum: [
          "text",
          "email",
          "password",
          "number",
          "tel",
          "file",
          "hidden",
          "range",
          "submit",
          "color",
          "date",
          "time",
        ],
      },
    },
  }),
  aiProps: ["label", "placeholder"],
  i18nProps: ["label", "placeholder"],
};

export { InputBlock as Component, Config };
