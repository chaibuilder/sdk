import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { CursorTextIcon } from "@radix-ui/react-icons";

export type RichTextProps = {
  styles: ChaiStyles;
  content: string;
};

const RichTextBlock = (props: ChaiBlockComponentProps<RichTextProps>) => {
  const { blockProps, content, styles } = props;
  return <div {...blockProps} {...styles} dangerouslySetInnerHTML={{ __html: content }}></div>;
};

const Config = {
  type: "RichText",
  description: "A rich text block",
  label: "Rich Text",
  category: "core",
  icon: CursorTextIcon,
  group: "typography",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      content: {
        type: "string",
        title: "Content",
        default: "<p>This is a rich text block. You can add text, and other content here.</p>",
        ui: { "ui:widget": "richtext" },
      },
    },
  }),
  aiProps: ["content"],
  i18nProps: ["content"],
};

export { RichTextBlock as Component, Config };
