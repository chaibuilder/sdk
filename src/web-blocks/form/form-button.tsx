import { ButtonIcon } from "@radix-ui/react-icons";
import { Icon, SelectOption, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { generateUUID } from "../../core/functions/Functions.ts";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

const FormButtonBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
  },
) => {
  const { blockProps, inBuilder, label, styles, inputStyles, icon, iconPos } = block;
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
      type={inBuilder ? "button" : "submit"}>
      {label}
      {icon && <span className={iconPos} dangerouslySetInnerHTML={{ __html: icon }} />}
    </button>
  );
};

const Config = {
  type: "FormButton",
  label: "web_blocks.submit_button",
  category: "core",
  icon: ButtonIcon,
  group: "form",
  props: {
    label: SingleLineText({ title: "web_blocks.label", default: "Submit" }),
    styles: Styles({
      default: "text-white bg-primary disabled:bg-gray-400 px-4 py-2 rounded-global flex items-center gap-x-2",
    }),
    icon: Icon({ title: "Icon", default: "" }),
    iconPos: SelectOption({
      title: "web_blocks.icon_position",
      default: "order-last",
      options: [
        { title: "web_blocks.start", value: "order-first" },
        { title: "web_blocks.end", value: "order-last" },
      ],
    }),
  },
};

export { FormButtonBlock as Component, Config };
