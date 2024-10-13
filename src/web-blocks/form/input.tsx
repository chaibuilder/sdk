import { InputIcon } from "@radix-ui/react-icons";
import { map } from "lodash-es";
import { Checkbox, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { generateUUID } from "../../core/functions/Functions.ts";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const InputBlock = (
  block: ChaiBlock & {
    inBuilder: boolean;
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
    required: boolean;
    value: string;
    name: string;
  },
) => {
  const {
    blockProps,
    label,
    placeholder,
    styles,
    inputStyles,
    showLabel,
    required,
    inputType = "text",
    inBuilder,
    fieldName,
  } = block;
  const fieldId = generateUUID();

  if (!showLabel || inputType === "submit") {
    if (inputType === "submit") blockProps.value = label;

    return (
      <input
        id={fieldId}
        name={fieldName}
        readOnly={inBuilder}
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
        readOnly={inBuilder}
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
  label: "Input",
  category: "core",
  icon: InputIcon,
  group: "form",
  props: {
    styles: Styles({ default: "" }),
    fieldName: SingleLineText({ title: "Field Name", default: "input" }),
    inputType: SelectOption({
      title: "Type",
      options: map(
        ["text", "email", "password", "number", "tel", "file", "hidden", "range", "submit", "color", "date", "time"],
        (type) => ({
          value: type,
          title: type,
        }),
      ),
      default: "text",
    }),
    value: SingleLineText({ title: "Value", default: "", ai: true, i18n: true }),
    showLabel: Checkbox({ title: "Show Label", default: true }),
    inputStyles: Styles({ default: "w-full p-1" }),
    label: SingleLineText({ title: "Label", default: "Label", ai: true, i18n: true }),
    placeholder: SingleLineText({
      title: "Placeholder",
      default: "Placeholder",
    }),
    required: Checkbox({ title: "Required", default: false }),
  },
};

export { InputBlock as Component, Config };
