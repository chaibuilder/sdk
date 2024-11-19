import { DropdownMenuIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { generateUUID } from "../../core/functions/Functions";
import { map } from "lodash-es";

export type SelectProps = {
  showLabel: boolean;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  _multiple: boolean;
  options: { label: string; value: string }[];
};

const SelectBlock = (props: ChaiBlockComponentProps<SelectProps>) => {
  const { blockProps, fieldName, label, placeholder, styles, inputStyles, required, showLabel, _multiple, options } =
    props;
  const fieldId = generateUUID();

  if (!showLabel) {
    return (
      <select id={fieldId} {...styles} {...blockProps} required={required} multiple={_multiple} name={fieldName}>
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {map(options, (option) => (
          <option key={option.value} value={option.value} dangerouslySetInnerHTML={{ __html: option.label }} />
        ))}
      </select>
    );
  }

  return (
    <div {...styles} {...blockProps}>
      {showLabel && <label htmlFor={fieldId}>{label}</label>}
      <select {...inputStyles} id={fieldId} required={required} multiple={_multiple} name={fieldName}>
        <option value="" disabled selected hidden>
          {placeholder}
        </option>
        {map(options, (option) => (
          <option key={option.value} value={option.value} dangerouslySetInnerHTML={{ __html: option.label }} />
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
  ...registerChaiBlockSchema({
    properties: {
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
      _multiple: {
        type: "boolean",
        title: "Multiple",
        default: false,
      },
      options: {
        title: "Options",
        type: "array",
        default: [],
        items: {
          type: "object",
          properties: {
            label: {
              type: "string",
              title: "Label",
              default: "",
            },
            value: {
              type: "string",
              title: "Value",
              default: "",
            },
          },
        },
      },
    },
  }),
  aiProps: ["label", "placeholder"],
  i18nProps: ["label", "placeholder"],
};

export { SelectBlock as Component, Config };
