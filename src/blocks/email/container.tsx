import { Button, CodeInline, Container, Hr } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";

const ContainerBlock = ({ blockProps, styles, children }) => {
  return (
    <Container {...blockProps} {...styles}>
      <h1>Hello</h1>
      <Button
        href={"https://example.com"}
        className={"c-bg-red-500 c-px-4 c-py-1 c-border c-rounded-md c-inline-block c-text-white c-font-bold"}>
        Click me
      </Button>
      <Hr />
      <CodeInline>@react-email/code-inline</CodeInline>;{children}
    </Container>
  );
};

registerChaiBlock(ContainerBlock, {
  type: "Container",
  label: "Container",
  group: "basic",
  category: "core",
  props: {
    styles: Styles({ default: "" }),
  },
});
