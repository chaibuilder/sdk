import { Link } from "@react-email/components";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { Link as link, SingleLineText, Styles } from "@chaibuilder/runtime/controls";
import { Link1Icon } from "@radix-ui/react-icons";

const LinkBlock = ({ blockProps, styles, href, content, target }: any) => {
  return (
    <Link {...blockProps} {...styles} href={href} target={target}>
      {content}
    </Link>
  );
};

const LinkBuilder = ({ blockProps, styles, href, content, target }: any) => {
  return (
    <a {...blockProps} {...styles} href={href} target={target}>
      {content}
    </a>
  );
};

registerChaiBlock(LinkBlock, {
  type: "Link",
  label: "Link",
  group: "basic",
  category: "core",
  icon: Link1Icon,
  builderComponent: LinkBuilder,
  props: {
    content: SingleLineText({ title: "Content", default: "I am a link." }),
    link: link({ title: "Link", default: { href: "https://chaibuilder.com", target: "_blank", type: "url" } }),
    styles: Styles({ default: "font-bold" }),
  },
});

export default LinkBlock;
