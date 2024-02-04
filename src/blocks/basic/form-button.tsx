import * as React from "react";
import { ButtonIcon } from "@radix-ui/react-icons";
import type { ChaiBlock } from "../../core/main";
import { generateUUID } from "../../core/lib";
import { Icon, registerChaiBlock, SelectOption, SingleLineText, Styles } from "@chaibuilder/blocks";

const FormButtonBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    inputStyles: Record<string, string>;
  },
) => {
  const { blockProps, inBuilder, label, placeholder, styles, inputStyles, icon, iconPos } = block;
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
      placeholder={placeholder}>
      {label}
      {icon && <span className={iconPos} dangerouslySetInnerHTML={{ __html: icon }} />}
    </button>
  );
};

registerChaiBlock(FormButtonBlock as React.FC<any>, {
  type: "FormButton",
  label: "Submit Button",
  category: "core",
  icon: ButtonIcon,
  group: "form",
  props: {
    label: SingleLineText({ title: "Label", default: "Submit" }),
    styles: Styles({
      default: "text-white bg-primary disabled:bg-gray-400 px-4 py-2 rounded-global flex items-center gap-x-2",
    }),
    icon: Icon({ title: "Icon", default: "" }),
    iconPos: SelectOption({
      title: "Icon Position",
      default: "order-last",
      options: [
        { title: "Start", value: "order-first" },
        { title: "End", value: "order-last" },
      ],
    }),
  },
});
