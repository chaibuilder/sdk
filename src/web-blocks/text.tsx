import { SpaceBetweenVerticallyIcon } from "@radix-ui/react-icons";

import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";

export type TextBlockProps = {
  styles: ChaiStyles;
  content: string;
  forceWrapper?: boolean;
};

const RawTextBlock = (props: ChaiBlockComponentProps<TextBlockProps>) => {
  if (props.inBuilder || props.forceWrapper) {
    return <span {...props.blockProps}>{props.content}</span>;
  }
  return `${props.content}`;
};

const Config = {
  type: "Text",
  label: "Text",
  hidden: true,
  category: "core",
  group: "typography",
  icon: SpaceBetweenVerticallyIcon,
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("text-black"),
      content: {
        title: "Content",
        type: "string",
        default: "",
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
};

export { RawTextBlock as Component, Config };
