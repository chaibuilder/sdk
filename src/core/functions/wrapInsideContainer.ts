import { getDefaultBlockProps } from "@/runtime";
import { ChaiBlock } from "@/types/chai-block";

export const wrapInsideContainer = (container: ChaiBlock | "Body" | "Html") => {
  return container ? container : { ...getDefaultBlockProps(container as string), _id: "container", _type: container };
};
