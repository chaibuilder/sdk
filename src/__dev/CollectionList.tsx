import { ChaiBlockComponentProps, ChaiStyles, registerChaiBlockSchema, StylesProp } from "@chaibuilder/runtime";

type Filter = {
  field: string;
  operator: string;
  value: string;
};

type Sort = {
  field: string;
  order: string;
};

export type CollectionListProps = {
  collection?: string;
  filters?: Filter[];
  sort?: Sort[];
  limit?: number;
  offset?: number;
  pagination?: {
    itemsPerPage: number;
  };
  wrapperStyles: ChaiStyles;
  listStyles: ChaiStyles;
  itemStyles: ChaiStyles;
};

const Component = (props: ChaiBlockComponentProps<CollectionListProps>) => {
  const { blockProps, wrapperStyles, listStyles, itemStyles } = props;
  return (
    <div {...blockProps} {...wrapperStyles}>
      <div {...listStyles}>
        <div {...itemStyles}></div>
      </div>
    </div>
  );
};

const Config = {
  type: "CollectionList",
  label: "Collection List",
  category: "core",
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      collection: {
        type: "string",
        title: "Collection",
        default: "",
        // ui: { "ui:widget": "collectionList" },
      },
      filters: {
        type: "array",
        title: "Filters",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            operator: { type: "string" },
            value: { type: "string" },
          },
        },
        default: [],
        // ui: { "ui:widget": "collectionFilters" },
      },
      sort: {
        type: "array",
        title: "Sort",
        items: {
          type: "object",
          properties: {
            field: { type: "string" },
            order: { type: "string" },
          },
        },
        default: [],
        // ui: { "ui:widget": "collectionSort" },
      },
      limit: {
        type: "number",
        title: "Limit",
        default: 10,
      },
      offset: {
        type: "number",
        title: "Offset",
        default: 0,
      },
      pagination: {
        type: "object",
        title: "Pagination",
        properties: {
          itemsPerPage: { type: "number" },
        },
        default: {
          itemsPerPage: 1,
        },
        // ui: { "ui:widget": "collectionPagination" },
      },
      wrapperStyles: StylesProp(""),
      listStyles: StylesProp(""),
      itemStyles: StylesProp(""),
    },
  }),
};

export { Component, Config };
