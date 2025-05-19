import { useState } from "react";

type AsyncPropsWrapperProps = {
  children: (asyncProps: Record<string, any>) => React.ReactNode;
};

export const AsyncPropsWrapper = ({ children }: AsyncPropsWrapperProps) => {
  // const registeredChaiBlock = useMemo(() => getRegisteredChaiBlock(block._type) as any, [block._type]);
  // const deps = get(registeredChaiBlock, "asyncProps", []);
  const [asyncProps] = useState({ $fetching: false });
  // const getBlockAsyncProps = useBuilderProp("getBlockAsyncProps", async (_block: ChaiBlock) => Promise.resolve({}));
  // const depsArr = JSON.stringify([block._id, ...values(pick(block, deps))]);
  // const [, setRepeaterAsyncData] = useAsyncRepeaterData();

  // useEffect(() => {
  //   setAsyncProps({ $fetching: true });
  //   getBlockAsyncProps(block)
  //     .then((props = {}) => {
  //       setAsyncProps({ $fetching: false, ...props });
  //       setRepeaterAsyncData({ [block._id]: props });
  //     })
  //     .catch(() => setAsyncProps({ $fetching: false }));
  // }, [depsArr, setRepeaterAsyncData]);

  return children(asyncProps);
};
