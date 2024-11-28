import {
  ChaiBlockComponentProps,
  ChaiStyles,
  registerChaiBlock,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";
import { get } from "lodash-es";
import { Columns, Rows } from "lucide-react";

export type RowProps = {
  styles: ChaiStyles;
};

const Column = (props: ChaiBlockComponentProps<{ children: React.ReactNode; styles: ChaiStyles }>) => {
  const { blockProps, children, styles, colSpan, tabletColSpan, desktopColSpan } = props;

  const className = [
    get(styles, "className", ""),
    `col-span-${isNaN(colSpan) || !colSpan ? 6 : colSpan}`,
    tabletColSpan ? `md:col-span-${tabletColSpan}` : "",
    desktopColSpan ? `lg:col-span-${desktopColSpan}` : "",
  ];
  const _styles = { className: className.join(" ") };

  return (
    <div {...blockProps} {...styles} {..._styles}>
      {children || (
        <div className="min-h-12 h-full w-full border-2 border-dashed border-gray-400 bg-gray-100 dark:bg-gray-900" />
      )}
    </div>
  );
};

registerChaiBlock(Column, {
  type: "Column",
  label: "Column",
  hidden: true,
  canMove: () => false,
  canDelete: () => true,
  icon: Columns,
  wrapper: true,
  canAcceptBlock: () => true,
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
});

const Component = (props: ChaiBlockComponentProps<RowProps>) => {
  const { blockProps, children, styles, gutter } = props;

  const className = [get(styles, "className", ""), " grid grid-cols-12", isNaN(gutter) ? "" : `gap-[${gutter}px]`];
  const _styles = { className: className.join(" ") };

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
  blocks: () => [
    { _type: "Row", _id: "row", styles: "#styles:,p-1" },
    { _type: "Column", id: "column", _parent: "row", styles: "#styles:," },
    { _type: "Column", id: "column", _parent: "row", styles: "#styles:," },
  ],
  category: "core",
  wrapper: true,
  canAcceptBlock: (childType) => childType === "Column",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      colCount: {
        type: "number",
        title: "Columns Count",
        default: 2,
        minimum: 0,
        ui: { "ui:widget": "colCount" },
      },
      gutter: {
        type: "number",
        title: "Gutter",
        default: 16,
        minimum: 0,
      },
    },
  }),
};

export { Component, Config };
