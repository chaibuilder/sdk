import { CursorTextIcon } from "@radix-ui/react-icons";
import { ChaiBlockComponentProps, ChaiStyles, StylesProp } from "@chaibuilder/runtime";
import { registerChaiBlockSchema } from "@chaibuilder/runtime";

export type RichTextProps = {
  styles: ChaiStyles;
  content: string;
};

const RichTextBlock = (props: ChaiBlockComponentProps<RichTextProps>) => {
  const { blockProps, content, styles } = props;
  return (
    <div className="max-w-full">
      <div {...blockProps} {...styles} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

const Config = {
  type: "RichText",
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
