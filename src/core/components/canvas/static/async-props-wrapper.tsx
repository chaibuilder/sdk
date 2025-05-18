import { useAsyncRepeaterData } from "@/core/collections/use-async-repeater-data";
import { useBuilderProp } from "@/core/hooks";
import { ChaiBlock, getRegisteredChaiBlock } from "@chaibuilder/runtime";
import { get, pick, values } from "lodash-es";
import { useEffect, useMemo, useState } from "react";

type AsyncPropsWrapperProps = {
  children: (asyncProps: Record<string, any>) => React.ReactNode;
  block: ChaiBlock;
};

export const AsyncPropsWrapper = ({ children, block }: AsyncPropsWrapperProps) => {
  const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  const deps = get(registeredChaiBlock, "asyncProps", []);
  const [asyncProps, setAsyncProps] = useState({ $fetching: false });
  const getBlockAsyncProps = useBuilderProp("getBlockAsyncProps", async (_block: ChaiBlock) => Promise.resolve({}));
  const depsArr = JSON.stringify([block._id, ...values(pick(block, deps))]);
  const [, setRepeaterAsyncData] = useAsyncRepeaterData();

  useEffect(() => {
    if (deps.length === 1) return;
    setAsyncProps({ $fetching: true });
    getBlockAsyncProps(block)
      .then((props = {}) => {
        setAsyncProps({ $fetching: false, ...props });
        setRepeaterAsyncData({ [block._id]: props });
      })
      .catch(() => setAsyncProps({ $fetching: false }));
  }, [depsArr, setRepeaterAsyncData]);

  return children(asyncProps);
};
