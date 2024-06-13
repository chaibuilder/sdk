import * as React from "react";
import { SketchLogoIcon } from "@radix-ui/react-icons";
import { Icon, Numeric, Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { isEmpty } from "lodash-es";
import EmptySlot from "./empty-slot";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { cn } from "../../core/functions/Functions.ts";

const IconBlock = (
  block: ChaiBlock & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
  },
) => {
  const { blockProps, icon, styles, width, height } = block;
  const iStyles = {
    ...styles,
    className: cn(styles.className, "inline-block c-inline-block", `w-[${width}px]`, `h-[${height}px]`),
  };

  if (isEmpty(icon)) {
    return <EmptySlot blockProps={blockProps} text="" className="h-8 w-14" />;
  }

  return React.createElement("span", {
    ...blockProps,
    ...iStyles,
    dangerouslySetInnerHTML: { __html: icon },
  });
};

registerChaiBlock(IconBlock, {
  type: "Icon",
  label: "Icon",
  category: "core",
  icon: SketchLogoIcon,
  group: "basic",
  props: {
    styles: Styles({ default: "text-black" }),
    icon: Icon({
      title: "Icon",
      default: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16"  xmlns="http://www.w3.org/2000/svg"><path d="M8 16c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zM8 1.5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5zM8 9.356c1.812 0 3.535-0.481 5-1.327-0.228 2.788-2.393 4.971-5 4.971s-4.772-2.186-5-4.973c1.465 0.845 3.188 1.329 5 1.329zM4 5.5c0-0.828 0.448-1.5 1-1.5s1 0.672 1 1.5c0 0.828-0.448 1.5-1 1.5s-1-0.672-1-1.5zM10 5.5c0-0.828 0.448-1.5 1-1.5s1 0.672 1 1.5c0 0.828-0.448 1.5-1 1.5s-1-0.672-1-1.5z"></path></svg>`,
    }),
    width: Numeric({ title: "Width", default: 40 }),
    height: Numeric({ title: "Height", default: 40 }),
  },
});

export default IconBlock;
