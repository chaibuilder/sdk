import { getDefaultBlockProps } from "@chaibuilder/runtime";
import { ChaiBlock } from "../../types/chai-block.ts";

export const wrapInsideContainer = (container: ChaiBlock | "Body" | "Html") => {
  return container ? container : { ...getDefaultBlockProps(container as string), _id: "container", _type: container };
};
