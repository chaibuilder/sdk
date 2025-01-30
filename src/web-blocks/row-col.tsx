import {
  ChaiBlock,
  ChaiBlockComponentProps,
  ChaiStyles,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";
import { get } from "lodash-es";
import { Columns, Rows } from "lucide-react";
import { NUMBER_TO_COL_SPAN } from "../core/constants/TWCLASS_VALUES";

export type RowProps = {
  styles: ChaiStyles;
  gutter: number;
};

export type ColumnProps = {
  styles: ChaiStyles;
  colSpan: number;
  tabletColSpan: number;
  desktopColSpan: number;
};

const Column = (props: ChaiBlockComponentProps<ColumnProps>) => {
  const { blockProps, children, styles, colSpan, tabletColSpan, desktopColSpan } = props;

  const className = [
    get(styles, "className", ""),
    get(NUMBER_TO_COL_SPAN, ["SMALL", isNaN(colSpan) || !colSpan ? 6 : colSpan], ""),
    tabletColSpan ? get(NUMBER_TO_COL_SPAN, ["MEDIUM", tabletColSpan || colSpan], "") : "",
    desktopColSpan ? get(NUMBER_TO_COL_SPAN, ["LARGE", tabletColSpan || colSpan], "") : "",
  ];
  const _styles = { className: className.join(" ") };

  return (
    <div {...blockProps} {...styles} {..._styles}>
      {children || (
        <div className="h-full min-h-12 w-full border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-900" />
      )}
    </div>
  );
};

const ColumnConfig = {
  type: "Column",
  label: "Column",
  group: "basic",
  category: "core",
  icon: Columns,
  wrapper: true,
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Row",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      colSpan: {
        type: "number",
        title: "Column Span",
        default: 6,
        enum: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
      tabletColSpan: {
        type: "number",
        title: "Column Span (Tablet)",
        default: null,
        enumNames: ["Default", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        enum: [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
      desktopColSpan: {
        type: "number",
        title: "Column Span (Desktop)",
        default: null,
        enumNames: ["Default", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        enum: [null, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      },
    },
  }),
};

const Component = (props: ChaiBlockComponentProps<RowProps>) => {
  const { blockProps, children, styles, gutter } = props;

  const className = [get(styles, "className", ""), " grid grid-cols-12"];
  const _styles: any = { className: className.join() };

  if (typeof styles?.style === "object") {
    // @ts-ignore
    styles.style.gap = `${gutter}px`;
  } else {
    _styles.style = { gap: `${gutter}px` };
  }

  return (
    <div {...blockProps} {...styles} {..._styles}>
      {children}
    </div>
  );
};

const Config = {
  type: "Row",
  label: "Row",
  group: "basic",
  icon: Rows,
  blocks: () =>
    [
      { _type: "Row", _id: "row", styles: "#styles:,p-1" },
      { _type: "Column", id: "column", _parent: "row", styles: "#styles:," },
      { _type: "Column", id: "column", _parent: "row", styles: "#styles:," },
    ] as ChaiBlock[],
  category: "core",
  wrapper: true,
  canAcceptBlock: (childType) => childType === "Column",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      colCount: {
        type: "number",
        default: 2,
        minimum: 0,
        ui: { "ui:widget": "colCount" },
      },
      gutter: {
        type: "number",
        title: "Gutter (in px)",
        default: 16,
        minimum: 0,
      },
    },
  }),
};

export { Column, ColumnConfig, Component, Config };
