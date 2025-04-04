import { useRegisteredChaiBlocks } from "@chaibuilder/runtime";
import { BoxModelIcon } from "@radix-ui/react-icons";
import { get } from "lodash-es";
import React from "react";

type Props = {
  type?: string;
};

const ICON_CLASS = "h-3 w-3 stroke-[2]";

export const TypeIcon: React.FC<Props> = (props) => {
  const allChaiBlocks = useRegisteredChaiBlocks();
  const blockIcon: any = get(allChaiBlocks, [props?.type, "icon"]);

  if (blockIcon) {
    return React.createElement(blockIcon, { className: ICON_CLASS });
  }

  // * Fallback Icon
  return <BoxModelIcon className={ICON_CLASS} />;
};
