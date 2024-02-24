import React from "react";
import {
  ControlDefinition,
  ListControlDefinition,
  ModelControlDefinition,
  SlotControlDefinition,
  StylesControlDefinition,
} from "@chaibuilder/runtime/controls";
import { ChaiBlock } from "../../core/types/ChaiBlock.ts";

export interface ChaiCustomBlock {
  blocks?: ChaiBlock[];
  category?: string;
  group: string;
  preview?: string;
  hidden?: boolean;
  icon?: React.ReactNode | React.FC;
  label: string;
  props?: {
    [key: string]:
      | ControlDefinition
      | ModelControlDefinition
      | StylesControlDefinition
      | ListControlDefinition
      | SlotControlDefinition;
  };
  type: string;
  wrapper?: boolean;
}
