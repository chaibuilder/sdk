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

type ServerProps = {
  items: any[];
};

const Component = (props: ChaiBlockComponentProps<CollectionListProps & ServerProps>) => {
  const { blockProps, wrapperStyles, listStyles, itemStyles, items } = props;
  return (
    <div {...blockProps} {...wrapperStyles}>
      <h1>Collection List</h1>
      {props.lang}
      <div {...listStyles}>{items?.map((item) => <div {...itemStyles}>{JSON.stringify(item)}</div>)}</div>
    </div>
  );
};

const Config = {
  type: "CollectionList",
  label: "Collection List",
  category: "core",
  group: "basic",
  dataProvider: () => {
    return {
      items: [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
      ],
    };
  },
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
      wrapperStyles: StylesProp("bg-red-100 p-2 border border-red-500"),
      listStyles: StylesProp("text-blue-500"),
      itemStyles: StylesProp("text-green-500"),
    },
  }),
};

export { Component, Config };
