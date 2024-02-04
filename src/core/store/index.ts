import { atom, getDefaultStore } from "jotai";
import React, { LazyExoticComponent } from "react";
import { ChaiBlock } from "../types/ChaiBlock";

/**
 * Jotai store for global state management
 */
export const builderStore = getDefaultStore();

type BuilderBlock = {
  component: React.FC<ChaiBlock>;
  group: string;
  icon?: any;
  label?: string;
  props?: any;
  type: string;
  builderComponent: React.FC<ChaiBlock> | LazyExoticComponent<any>;
};
export const builderBlocksAtom = atom<{ [key: string]: BuilderBlock }>({});
