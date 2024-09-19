import { DropdownMenuIcon } from "@radix-ui/react-icons";
import { get, map } from "lodash-es";
import { Checkbox, List, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { generateUUID } from "../../core/functions/Functions.ts";

const SelectBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
    required: boolean;
    options: { label: string; value: string }[];
  },
) => {
  const {
    blockProps,
    fieldName,
    label,
    placeholder,
    styles,
    inputStyles,
    required,
    showLabel,
    _multiple = false,
  } = block;
  const fieldId = generateUUID();

  if (!showLabel) {
    return (
      <select
        id={fieldId}
        {...styles}
        {...blockProps}
        required={required}
        multiple={_multiple as boolean}
        name={fieldName}>
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {map(block.options, (option) => (
          <option
            selected={get(option, "selected", false)}
            key={option.value}
            value={option.value}
            dangerouslySetInnerHTML={{ __html: option.label }}
          />
        ))}
      </select>
    );
  }

  return (
    <div {...styles}>
      {showLabel && <label htmlFor={fieldId}>{label}</label>}
      <select {...inputStyles} id={fieldId} required={required} multiple={_multiple as boolean} name={fieldName}>
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {map(block.options, (option) => (
          <option
            key={option.value}
            selected={get(option, "selected", false)}
            value={option.value}
            dangerouslySetInnerHTML={{ __html: option.label }}
          />
        ))}
      </select>
    </div>
  );
};

const Config = {
  type: "Select",
  label: "web_blocks.select",
  category: "core",
  icon: DropdownMenuIcon,
  group: "form",
  props: {
    styles: Styles({ default: "" }),
    fieldName: SingleLineText({ title: "web_blocks.field_name", default: "select" }),
    showLabel: Checkbox({ title: "web_blocks.show_label", default: true }),
    inputStyles: Styles({ default: "w-full p-1" }),
    label: SingleLineText({ title: "web_blocks.label", default: "Label" }),
    placeholder: SingleLineText({
      title: "web_blocks.placeholder",
      default: "Placeholder",
    }),
    required: Checkbox({ title: "web_blocks.required", default: false }),
    _multiple: Checkbox({ title: "web_blocks.multiple", default: false }),
    options: List({
      title: "web_blocks.options",
      itemProperties: {
        label: SingleLineText({ title: "web_blocks.label", default: "" }),
        value: SingleLineText({ title: "web_blocks.value", default: "" }),
      },
    }),
  },
};

export { SelectBlock as Component, Config };
