import { get } from "lodash-es";
import React from "react";
import { getBlockComponent } from "@chaibuilder/runtime";
import { has } from "lodash";

export type ChaiBlock = {
  activeCls?: string;

  alt?: string;
  animation?: string;
  attrs?: Array<{ [key: string]: string }>;
  backgroundImage?: string;
  baseClasses?: string;
  blockId?: string;
  children?: React.ReactNode;
  classes: string;
  content?: string;
  darkModeIcon?: string;
  description?: string;
  dialogId?: string;
  // headless ui
  dialogTitle?: string;
  dynamicClasses?: string;
  expanded?: boolean;
  global?: boolean;
  icon?: string;
  iconPos?: string;
  id: string;
  index?: number;
  // form widgets
  inputType?: string;

  itemLink?: string;

  itemText?: string;
  label?: string;

  level?: string | number;
  lightModeIcon?: string;

  link?: string;
  menuText?: string;

  parent?: string | null;
  placeholder?: string;

  props?: object;

  rows?: number;

  source?: string;
  svg?: string;
  svgIcon?: string;
  tag?: string;
  tagId?: string;
  tempClasses?: string;
  text?: string;

  title?: string;
  type: string;
  url?: string;

  vertical?: boolean;
};

type BlockDefinition = {
  canAcceptBlock?: (target: string) => boolean;
  canDelete?: () => boolean;
  canDuplicate?: () => boolean;
  canMove?: () => boolean;
};

/**
 *
 * @param parentType
 * @param childType
 */
export const canAcceptChildBlock = (parentType: string, childType: string) => {
  if (!parentType) return true; // this is root
  const blockDefinition = getBlockComponent(parentType) as BlockDefinition;
  if (!blockDefinition) return false;
  return has(blockDefinition, "canAcceptBlock") ? blockDefinition.canAcceptBlock(childType) : false;
};

/**
 *
 * @param type
 */
export const canDuplicateBlock = (type: string) => {
  const blockDefinition = getBlockComponent(type) as BlockDefinition;
  if (!blockDefinition) return true;
  return has(blockDefinition, "canDuplicate") ? blockDefinition.canDuplicate() : true;
};

/**
 *
 * @param type
 */
export const canDeleteBlock = (type: string) => {
  const blockDefinition = getBlockComponent(type) as BlockDefinition;
  if (!blockDefinition) return true;
  return has(blockDefinition, "canDelete") ? blockDefinition.canDelete() : true;
};

/**
 *
 * @param currentTree
 * @param _currentTree
 * @param dragSource
 * @param dropTarget
 */
export const canDropBlock = (_currentTree: any, { dragSource, dropTarget }: any) => {
  const dragSourceType = get(dragSource, "data._type", "");
  const dropTargetType = get(dropTarget, "data._type", "");
  return canAcceptChildBlock(dropTargetType, dragSourceType);
};
