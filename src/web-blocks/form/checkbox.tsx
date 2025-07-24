import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { CheckboxIcon } from "@radix-ui/react-icons";

export type CheckboxProps = {
  label: string;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  checked: boolean;
  showLabel: boolean;
  fieldName: string;
};

const CheckboxBlock = (props: ChaiBlockComponentProps<CheckboxProps>) => {
  const { blockProps, fieldName, label, styles, inputStyles, required, checked, showLabel = true } = props;

  if (!showLabel)
    return (
      <input
        name={fieldName}
        {...blockProps}
        {...inputStyles}
        {...styles}
        type="checkbox"
        required={required}
        defaultChecked={checked}
      />
    );

  return (
    <div {...styles} {...blockProps}>
      <input {...inputStyles} name={fieldName} type="checkbox" required={required} defaultChecked={checked} />
      {label && <label htmlFor={fieldName}>{label}</label>}
    </div>
  );
};

const Config = {
  type: "Checkbox",
  label: "web_blocks.checkbox",
  category: "core",
  icon: CheckboxIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("flex items-center gap-x-2"),
      inputStyles: StylesProp(""),
      fieldName: {
        type: "string",
        title: "Field Name",
        default: "fieldName",
      },
      label: {
        type: "string",
        title: "Label",
        default: "Label",
      },
      checked: {
        type: "boolean",
        title: "Checked",
        default: false,
      },
      required: {
        type: "boolean",
        title: "Required",
        default: false,
      },
      showLabel: {
        type: "boolean",
        title: "Show Label",
        default: true,
      },
    },
  }),
  aiProps: ["label"],
  i18nProps: ["label"],
};

export { CheckboxBlock as Component, Config };
