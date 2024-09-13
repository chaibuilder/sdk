import { InputIcon } from "@radix-ui/react-icons";
import { Checkbox, Numeric, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../../core/types/ChaiBlock.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";

const TextAreaBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
    required: boolean;
    options: { label: string; value: string }[];
    _rows: number;
  },
) => {
  const { blockProps, fieldName, label, placeholder, styles, inputStyles, _rows, showLabel } = block;
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
        rows={_rows}
      />
    );
  }

  return (
    <div {...styles} {...blockProps}>
      {showLabel && <label htmlFor={fieldId}>{label}</label>}
      <textarea name={fieldName} {...inputStyles} id={fieldId} placeholder={placeholder} rows={_rows} />
    </div>
  );
};

const Config = {
  type: "TextArea",
  label: "TextArea",
  category: "core",
  icon: InputIcon,
  group: "form",
  hidden: true,
  props: {
    fieldName: SingleLineText({ title: "Field Name", default: "textarea" }),
    showLabel: Checkbox({ title: "Show label", default: true }),
    styles: Styles({ default: "" }),
    inputStyles: Styles({ default: "w-full p-1" }),
    label: SingleLineText({ title: "Label", default: "Label" }),
    placeholder: SingleLineText({
      title: "Placeholder",
      default: "Placeholder",
    }),
    _rows: Numeric({ title: "Rows", default: 3 }),
  },
};

export { TextAreaBlock as Component, Config };
