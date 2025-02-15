import { ButtonIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { generateUUID } from "../../core/functions/Functions";

export type FormButtonProps = {
  label: string;
  styles: ChaiStyles;
  inputStyles: ChaiStyles;
  icon: string;
  iconSize: number;
  iconPos: "order-first" | "order-last";
};

const FormButtonBlock = (props: ChaiBlockComponentProps<FormButtonProps>) => {
  const { blockProps, inBuilder, label, styles, inputStyles, icon, iconSize, iconPos } = props;
  const fieldId = generateUUID();

  // alpine js attrs
  const attrs = {
    "x-bind:disabled": "formLoading",
  };

  return (
    <button
      id={fieldId}
      {...attrs}
      {...inputStyles}
      {...styles}
      {...(blockProps || {})}
      type={inBuilder ? "button" : "submit"}
      aria-label={label}>
      {label}
      {icon && (
        <div
          style={{ width: iconSize + "px" }}
          className={iconPos + " " + (iconPos === "order-first" ? "mr-2" : "ml-2") || ""}
          dangerouslySetInnerHTML={{ __html: icon }}
        />
      )}
    </button>
  );
};

const Config = {
  type: "FormButton",
  label: "Submit Button",
  category: "core",
  icon: ButtonIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(
        "text-white bg-primary disabled:bg-gray-400 px-4 py-2 rounded-global flex items-center gap-x-2",
      ),
      inputStyles: StylesProp(""),
      label: {
        type: "string",
        title: "Label",
        default: "Submit",
        ai: true,
        i18n: true,
      },
      icon: {
        type: "string",
        title: "Icon",
        default: "",
        ui: { "ui:widget": "icon" },
      },
      iconSize: {
        type: "number",
        title: "Icon size",
        default: 24,
      },
      iconPos: {
        type: "string",
        title: "Icon Position",
        default: "order-last",
        enum: ["order-first", "order-last"],
      },
    },
  }),
  i18nProps: ["label"],
  aiProps: ["label"],
};

export { FormButtonBlock as Component, Config };
