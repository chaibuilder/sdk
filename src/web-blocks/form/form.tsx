import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import EmptySlot from "../empty-slot";
import { GroupIcon } from "lucide-react";

export type FormProps = ChaiBlockComponentProps<{
  errorMessage: string;
  successMessage: string;
  action: string;
  styles: ChaiStyles;
}>;

const FormBlock = (props: FormProps) => {
  const { children, blockProps, errorMessage, successMessage, action, styles } = props;
  let nestedChildren = children;
  if (!children) {
    nestedChildren = <EmptySlot />;
  }

  const alpineAttrs = {
    "x-data": "{}",
    "x-on:submit.prevent": "post",
  };
  const formResponseAttr = {
    "x-html": "",
    ":class": "{'text-red-500': formStatus === 'ERROR', 'text-green-500': formStatus === 'SUCCESS'}",
  };

  return (
    <form
      {...alpineAttrs}
      data-error={errorMessage}
      data-success={successMessage}
      method={"post"}
      action={action}
      {...blockProps}
      {...styles}>
      <div {...formResponseAttr}></div>
      {nestedChildren}
    </form>
  );
};

const Config = {
  type: "Form",
  label: "Form",
  category: "core",
  icon: GroupIcon,
  group: "form",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      action: {
        type: "string",
        title: "Submit URL",
        default: "/api/form/submit",
      },
      errorMessage: {
        type: "string",
        title: "Error Message",
        default: "Something went wrong. Please try again",
        ui: { "ui:widget": "richtext" },
      },
      successMessage: {
        type: "string",
        title: "Success Message",
        default: "Thank you for your submission.",
        ui: { "ui:widget": "richtext" },
      },
    },
  }),
  i18nProps: ["errorMessage", "successMessage"],
  aiProps: ["errorMessage", "successMessage"],
  canAcceptBlock: () => true,
};

export { FormBlock as Component, Config };
