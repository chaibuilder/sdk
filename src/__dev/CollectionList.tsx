import {
  builderProp,
  ChaiBlockComponentProps,
  ChaiStyles,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";

type Sort = {
  field: string;
  order: string;
};

export type CollectionListProps = {
  title1: string;
  sort: Sort[];
  wrapperStyles: ChaiStyles;
  listStyles: ChaiStyles;
  itemStyles: ChaiStyles;
};

type ServerProps = {
  items: any[];
};

const Component = (props: ChaiBlockComponentProps<CollectionListProps & ServerProps>) => {
  const { title1, blockProps, wrapperStyles, listStyles, itemStyles, items } = props;
  return (
    <div {...blockProps} {...wrapperStyles}>
      <h1>{title1}</h1>
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
      showTitle: builderProp({
        type: "boolean",
        title: "Show Title",
        default: true,
      }),
      title1: {
        type: "string",
        title: "Title",
        default: "Collection List 111",
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
      },
      wrapperStyles: StylesProp("bg-red-100 p-2 border border-red-500"),
      listStyles: StylesProp("text-blue-500"),
      itemStyles: StylesProp("text-green-500"),
    },
  }),
  i18nProps: ["sort", "title"],
};

export { Component, Config };
