import { CheckboxIcon } from "@radix-ui/react-icons";
import { Checkbox, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { generateUUID } from "../../core/functions/Functions.ts";

const CheckboxBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
    required: boolean;
    checked: boolean;
  },
) => {
  const { blockProps, fieldName, label, styles, inputStyles, required, checked, showLabel = true } = block;
  const fieldId = generateUUID();

  if (!showLabel)
    return (
      <input
        id={fieldId}
        {...blockProps}
        {...inputStyles}
        {...styles}
        type="checkbox"
        required={required}
        name={fieldName}
      />
    );

  return (
    <div {...styles} {...blockProps}>
      <input
        {...inputStyles}
        name={fieldName}
        id={fieldId}
        type="checkbox"
        required={required}
        defaultChecked={checked}
      />
      {label && label !== "Label" && <label htmlFor={fieldId}>{label}</label>}
    </div>
  );
};

const Config = {
  type: "Checkbox",
  label: "web_blocks.checkbox",
  category: "core",
  icon: CheckboxIcon,
  group: "form",
  props: {
    fieldName: SingleLineText({ title: "Field Name", default: "checkbox" }),
    styles: Styles({ default: "flex items-center gap-x-2" }),
    label: SingleLineText({ title: "web_blocks.label", default: "Label" }),
    checked: Checkbox({ title: "web_blocks.checked", default: false }),
    required: Checkbox({ title: "web_blocks.required", default: false }),
  },
};

export { CheckboxBlock as Component, Config };
