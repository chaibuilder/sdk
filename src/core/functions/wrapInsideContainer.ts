import { getDefaultBlockProps } from "@/runtime/index";
import type { ChaiBlock } from "@/types/common";

export const wrapInsideContainer = (container: ChaiBlock | "Body" | "Html") => {
  return container ? container : { ...getDefaultBlockProps(container as string), _id: "container", _type: container };
};
