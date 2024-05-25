import * as React from "react";
import { Styles } from "@chaibuilder/runtime/controls";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";
import { cn } from "../../core/functions/Functions.ts";

const SlotBlock = (
  props: ChaiBlock & { children: React.ReactNode } & {
    blockProps: Record<string, string>;
    styles: Record<string, string>;
    emptyStyles?: Record<string, string>;
  },
) => {
  const { blockProps, styles, children } = props;
  let emptySlot: React.ReactNode | null = null;
  if (!children) {
    emptySlot = (
      // @ts-ignore
      <div className={cn("flex flex-col items-center justify-center", props.emptyStyles?.className)}>
        <div className="h-full w-full rounded-md border-4 border-dashed">
          <p className="truncate p-1 text-left text-xs text-gray-400">Slot: {props.name}</p>
        </div>
      </div>
    );
  }
  return React.createElement("div", { ...styles, ...blockProps, droppable: "yes" }, children || emptySlot);
};

registerChaiBlock(SlotBlock, {
  type: "Slot",
  label: "Slot",
  group: "basic",
  category: "core",
  hidden: true,
  props: {
    styles: Styles({ default: "" }),
    emptyStyles: Styles({ default: "" }),
  },
});

export default SlotBlock;
