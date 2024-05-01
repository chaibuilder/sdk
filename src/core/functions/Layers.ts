import { get, isEmpty } from "lodash";
import React from "react";

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

/**
 *
 * @param type
 */
export const canAddChildBlock = (type: string) =>
  [
    "Box",
    "Slot",
    "Form",
    "DataProvider",
    "Link",
    "List",
    "ListItem",
    "Row",
    "Column",
    "Table",
    "Row",
    "TableCell",
  ].includes(type);

/**
 *
 * @param type
 */
export const canDuplicateBlock = (type: string) => !["Slot"].includes(type);

/**
 *
 * @param type
 */
export const canDeleteBlock = (type: string) => !["Slot"].includes(type);

export function canAddAsChild(dragSourceType: string, dropTargetType: string) {
  if (dragSourceType === "Slot") return false;
  if (dropTargetType === "List" && dragSourceType !== "ListItem") {
    return false;
  }
  if (dropTargetType === "Row" && dragSourceType !== "Column") {
    return false;
  }

  return canAddChildBlock(dropTargetType);
}

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
  if (dragSourceType === "Slot" || (get(dragSource, "id") && get(dragSource, "id") === get(dropTarget, "id")))
    return false;
  if (isEmpty(dropTargetType)) return true;
  return canAddAsChild(dragSourceType, dropTargetType);
};
