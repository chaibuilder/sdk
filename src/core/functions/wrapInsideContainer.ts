import { ChaiBlock } from "@/types/chai-block";
import { getDefaultBlockProps } from "@chaibuilder/runtime";

export const wrapInsideContainer = (container: ChaiBlock | "Body" | "Html") => {
  return container ? container : { ...getDefaultBlockProps(container as string), _id: "container", _type: container };
};
