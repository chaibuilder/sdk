import * as React from "react";
import { TextIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { isNull } from "lodash-es";

export type ParagraphProps = {
  styles: ChaiStyles;
  content: string;
};

const ParagraphBlock = (props: ChaiBlockComponentProps<ParagraphProps>) => {
  const { blockProps, styles, content } = props;

  if (!isNull(props.children)) return React.createElement("p", { ...styles, ...blockProps }, props.children);

  return React.createElement("p", {
    ...styles,
    ...blockProps,
    dangerouslySetInnerHTML: { __html: content },
  });
};

const Config = {
  type: "Paragraph",
  label: "Paragraph",
  category: "core",
  icon: TextIcon,
  group: "typography",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        title: "Content",
        default: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros elementum tristique. 
        Duis cursus, mi quis viverra ornare, eros dolor interdum nulla, ut commodo diam libero vitae erat. Aenean faucibus 
        nibh et justo cursus id rutrum lorem imperdiet. Nunc ut sem vitae risus tristique posuere.`,
        ui: { "ui:widget": "textarea", "ui:autosize": true, "ui:rows": 5 },
      },
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
  canAcceptBlock: (type) => type === "Span" || type === "Link" || type === "Text",
};

export { ParagraphBlock as Component, Config };
