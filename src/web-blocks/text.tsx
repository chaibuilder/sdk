import { SpaceBetweenVerticallyIcon } from "@radix-ui/react-icons";

import { ChaiBlockComponentProps, registerChaiBlockSchema, StylesProp, ChaiStyles } from "@chaibuilder/runtime";

export type TextBlockProps = {
  styles: ChaiStyles;
  content: string;
};

const RawTextBlock = (props: ChaiBlockComponentProps<TextBlockProps>) => {
  if (props.inBuilder || props.forceWrapper) {
    return (
      <span  {...props.blockProps}>
        {props.content}
      </span>
    );
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
        type: "string",
        default: "",
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
};

export { RawTextBlock as Component, Config };
