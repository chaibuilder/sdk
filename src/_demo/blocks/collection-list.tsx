import {
  builderProp,
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
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
  tag: string;
  showTitle: boolean;
  wrapperStyles: ChaiStyles;
  listStyles: ChaiStyles;
  itemStyles: ChaiStyles;
  binding: string;
  keyName: string;
  depsName: string;
  newName?: string;
};

type ServerProps = {
  items: any[];
};

const Component = (props: ChaiBlockComponentProps<CollectionListProps & ServerProps>) => {
  const { title1, blockProps, newName, wrapperStyles, listStyles, itemStyles, items, showTitle } = props;
  return (
    <div {...blockProps} {...wrapperStyles}>
      {showTitle && <h1>{title1}</h1>}
      <p>new name:{newName}</p>
      <div {...listStyles}>
        {items?.map((item) => (
          <div key={item._id} {...itemStyles}>
            {JSON.stringify(item)}
          </div>
        ))}
      </div>
    </div>
  );
};

const Config = {
  type: "CollectionList",
  label: "Collection List",
  category: "core",
  dataProvider: () => {
    return { newName: "New Name " + Math.random() };
  },
  dataProviderMode: "live" as const,
  group: "basic",
  ...registerChaiBlockSchema({
    properties: {
      tag: closestBlockProp("Box", "tag"),
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
      wrapperStyles: StylesProp("bg-green-100 p-2 border border-red-500"),
      listStyles: StylesProp("text-blue-300 bg-blue-100"),
      itemStyles: StylesProp("text-green-500 bg-red-400"),
    },
  }),
  i18nProps: ["sort", "title"],
};

export { Component, Config };
