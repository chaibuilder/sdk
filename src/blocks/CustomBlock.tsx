import { Checkbox, List, Model, MultilineText, Numeric, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";

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

registerChaiBlock(CustomBlockBuilder, {
  type: "CustomBlock2",
  label: "Custom Block2",
  group: "Custom Blocks2",
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
