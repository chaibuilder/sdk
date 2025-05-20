import { useAsyncProps } from "@/core/async-props/use-async-props";
import { ChaiBlock, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { get, has } from "lodash-es";
import { useMemo } from "react";

type AsyncPropsWrapperProps = {
  children: (asyncProps: Record<string, any>) => React.ReactNode;
  block: ChaiBlock;
};

export const MayBeAsyncPropsWrapper = ({ children, block }: AsyncPropsWrapperProps) => {
  const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  const hasAsyncProps = has(registeredChaiBlock, "asyncProps");
  const asyncPropsByBlockId = useAsyncProps(
    hasAsyncProps ? block : undefined,
    get(registeredChaiBlock, "asyncProps", []),
  );
  return children(asyncPropsByBlockId);
};
