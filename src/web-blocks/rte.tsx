import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";
import { CursorTextIcon } from "@radix-ui/react-icons";
import { addForcedClasses } from "./helper";

export type RichTextProps = {
  styles: ChaiStyles;
  content: string;
};

const RichTextBlock = (props: ChaiBlockComponentProps<RichTextProps>) => {
  const { blockProps, content, styles } = props;
  const forcedStyles = addForcedClasses(
    styles,
    "prose dark:prose-invert prose-p:m-0 prose-p:min-h-[1rem] prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
    "max-w-full",
  );
  return <div {...blockProps} {...forcedStyles} dangerouslySetInnerHTML={{ __html: content }}></div>;
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
