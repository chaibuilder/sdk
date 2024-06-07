import { Column, Row } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SelectOption, Styles } from "@chaibuilder/runtime/controls";
import { ImageIcon } from "@radix-ui/react-icons";

const RowBlock = ({ blockProps, styles, children }: any) => {
  return (
    <Row {...blockProps} {...styles}>
      {children}
    </Row>
  );
};

registerChaiBlock(RowBlock, {
  type: "Row",
  label: "Row",
  group: "basic",
  category: "core",
  icon: ImageIcon,
  props: {
    styles: Styles({ default: "" }),
  },
  canAcceptBlock: (type: string) => type === "Column",
});

const ColumnBlock = ({ blockProps, styles, children, align }: any) => {
  return (
    <Column {...blockProps} {...styles} align={align}>
      {children}
    </Column>
  );
};

registerChaiBlock(ColumnBlock, {
  type: "Column",
  label: "Column",
  group: "basic",
  category: "core",
  icon: ImageIcon,
  props: {
    styles: Styles({ default: "" }),
    align: SelectOption({
      title: "Align",
      default: "",
      options: [
        { value: "", title: "None" },
        { value: "left", title: "left" },
        { value: "center", title: "center" },
        { value: "right", title: "right" },
      ],
    }),
  },
  canAcceptBlock: () => true,
});
