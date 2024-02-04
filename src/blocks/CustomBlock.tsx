import {
  Checkbox,
  List,
  Model,
  MultilineText,
  Numeric,
  registerChaiBlock,
  SingleLineText,
  Styles,
} from "@chaibuilder/blocks";

const CustomBlockBuilder = ({ blockProps, _bindings }) => {
  return (
    <div {...blockProps}>
      <h1>{JSON.stringify(_bindings)}</h1>
    </div>
  );
};

registerChaiBlock(CustomBlockBuilder, {
  type: "CustomBlock",
  label: "Custom Block",
  group: "Custom Blocks",
  props: {
    styles: Styles({ default: "" }),
    heading: MultilineText({ title: "Heading" }),
    content: MultilineText({ title: "Content" }),
    subheading: MultilineText({ title: "Sub heading" }),
    items: List({
      title: "Items",
      default: [{ item: "First" }],
      itemProperties: {
        item: SingleLineText({ title: "Item", default: "" }),
      },
    }),
    meta: Model({
      title: "Meta",
      default: {
        height: 0,
        visible: false,
      },
      properties: {
        height: Numeric({ title: "Height", default: 0 }),
        visible: Checkbox({ title: "Visible", default: false }),
        // language: ["en", "fs"],
        // offset: {
        //   x: 10,
        //   y: 20,
        // },
      },
    }),
  },
});
