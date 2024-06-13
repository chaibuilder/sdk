import * as React from "react";
import { CursorTextIcon } from "@radix-ui/react-icons";
import { RichText, Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

/**
 * Heading component
 * @param props
 * @constructor
 */
const RichTextBlock = (
  props: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, content, styles } = props;
  // eslint-disable-next-line react/no-danger
  return (
    <div className="max-w-full">
      <div {...blockProps} {...styles} dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

registerChaiBlock(RichTextBlock as React.FC<any>, {
  type: "RichText",
  label: "Rich Text",
  category: "core",
  icon: CursorTextIcon,
  group: "typography",
  props: {
    styles: Styles({ default: "" }),
    content: RichText({
      title: "Content",
      default: "<p>This is a rich text block. You can add text, and other content here.</p>",
    }),
  },
});

export default RichTextBlock;
