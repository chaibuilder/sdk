import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { RadiobuttonIcon } from "@radix-ui/react-icons";
import { generateUUID } from "../../core/functions/Functions.ts";

export type RadioProps = {
  label: string;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  required: boolean;
  checked: boolean;
  showLabel: boolean;
  fieldName: string;
};

const RadioBlock = (props: ChaiBlockComponentProps<RadioProps>) => {
  const { blockProps, fieldName, label, styles, inputStyles, required, checked, showLabel = true } = props;
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

export { RadioBlock as Component, Config };
