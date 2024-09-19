import { RadiobuttonIcon } from "@radix-ui/react-icons";
import { Checkbox, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { generateUUID } from "../../core/functions/Functions.ts";

const RadioBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
    required: boolean;
    checked: boolean;
  },
) => {
  const { blockProps, fieldName, label, styles, inputStyles, checked, required, showLabel = true } = block;
  const fieldId = generateUUID();

  if (!showLabel)
    return (
      <input
        id={fieldId}
        {...blockProps}
        {...inputStyles}
        {...styles}
        type="radio"
        required={required}
        checked={checked}
        name={fieldName}
      />
    );
  return (
    <div {...styles} {...blockProps}>
      <input {...inputStyles} name={fieldName} id={fieldId} type="radio" required={required} defaultChecked={checked} />
      {label && <label htmlFor={fieldId}>{label}</label>}
    </div>
  );
};

const Config = {
  type: "Radio",
  label: "web_blocks.radio",
  category: "core",
  icon: RadiobuttonIcon,
  group: "form",
  props: {
    styles: Styles({ default: "flex items-center w-max gap-x-2" }),
    fieldName: SingleLineText({ title: "web_blocks.field_name", default: "radio" }),
    label: SingleLineText({ title: "web_blocks.label", default: "Label" }),
    checked: Checkbox({ title: "web_blocks.checked", default: false }),
    required: Checkbox({ title: "web_blocks.required", default: false }),
  },
};

export { RadioBlock as Component, Config };
