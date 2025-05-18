import { ChaiBlock } from "@chaibuilder/runtime";
import { pick, values } from "lodash-es";
import { useEffect } from "react";

export const AsyncPropsWrapper = ({
  children,
  deps,
  block,
}: {
  children: React.ReactNode;
  deps: string[];
  block: ChaiBlock;
}) => {
  const depsArr = JSON.stringify(values(pick(block, deps)));
  useEffect(() => {
    console.log("async props wrapper", depsArr, pick(block, deps));
  }, [depsArr]);
  return <>{children}</>;
};
