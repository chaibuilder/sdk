import * as React from "react";
import { CheckboxIcon } from "@radix-ui/react-icons";
import type { ChaiBlock } from "../../core/main";
import { generateUUID } from "../../core/lib";
import { Checkbox, registerChaiBlock, SingleLineText, Styles } from "@chaibuilder/blocks";

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

registerChaiBlock(CheckboxBlock as React.FC<any>, {
  type: "Checkbox",
  label: "Checkbox",
  category: "core",
  icon: CheckboxIcon,
  group: "form",
  props: {
    fieldName: SingleLineText({ title: "Field Name", default: "checkbox" }),
    styles: Styles({ default: "flex items-center gap-x-2" }),
    label: SingleLineText({ title: "Label", default: "Label" }),
    checked: Checkbox({ title: "Checked", default: false }),
    required: Checkbox({ title: "Required", default: false }),
  },
});
