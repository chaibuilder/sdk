import {
  ChaiBlockComponentProps,
  ChaiRuntimeProp,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  runtimeProp,
  StylesProp,
} from "@chaibuilder/runtime";

export type DropdownLinksProps = {
  title: string;
  icon: string;
  showDropdown: ChaiRuntimeProp<boolean>;
  children: React.ReactNode;
};

const alpineAttrs = {
  wrapper: { "x-data": "{ open: false }" },
  button: { "x-on:click": "open = !open" },
  menu: { "x-show": "open", "x-on:click.away": "open = false" },
};

const DropdownButton = (
  props: ChaiBlockComponentProps<{
    title: string;
    icon: string;
    iconWidth: string;
    iconHeight: string;
    styles: ChaiStyles;

    show: ChaiRuntimeProp<boolean>;
  }>,
) => {
  const { blockProps, title, icon, iconWidth, iconHeight, styles, show } = props;
  return (
    <button {...blockProps} {...alpineAttrs.button} {...styles}>
      {title}
      <span
        className={show ? "rotate-180" : ""}
        dangerouslySetInnerHTML={{ __html: icon }}
        style={{ width: iconWidth, height: iconHeight }}
      />
    </button>
  );
};

registerChaiBlock(DropdownButton, {
  type: "DropdownButton",
  label: "Dropdown Button",
  group: "advanced",
  category: "core",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  ...registerChaiBlockSchema({
    properties: {
      show: closestBlockProp("DropdownMenu", ["showDropdown"]),
      title: { type: "string", title: "Title", default: "Menu Item" },
      icon: { type: "string", title: "Icon", default: "", ui: { "ui:widget": "icon" } },
      iconWidth: { type: "string", title: "Icon Width", default: "16px" },
      iconHeight: { type: "string", title: "Icon Height", default: "16px" },
      styles: StylesProp("flex items-center gap-2 px-4 py-1"),
    },
  }),
});

const DropdownMenuContent = (props: ChaiBlockComponentProps<{ children: React.ReactNode; styles: ChaiStyles }>) => {
  const { blockProps, children, styles } = props;
  return (
    <div {...blockProps} {...alpineAttrs.wrapper} className="relative">
      <div {...styles}>{children}</div>
    </div>
  );
};

registerChaiBlock(DropdownMenuContent, {
  type: "DropdownMenuContent",
  label: "Dropdown Content",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  canAcceptBlock: () => true,
  ...registerChaiBlockSchema({
    properties: {
      show: closestBlockProp("Dropdown", ["showDropdown"]),
      styles: StylesProp("absolute left-0 w-80 mt-2 bg-white rounded-lg shadow-lg z-50"),
    },
  }),
});

const Component = (props: ChaiBlockComponentProps<DropdownLinksProps>) => {
  const { blockProps, children } = props;
  return <div {...blockProps}>{children}</div>;
};

const Config = {
  type: "DropdownMenu",
  label: "Dropdown Menu",
  group: "advanced",
  blocks: () => [
    { _type: "DropdownMenu", _id: "menu" },
    {
      _type: "DropdownButton",
      _id: "button",
      _parent: "menu",
      title: "Menu Item",
      icon: "",
      styles: "#styles:,flex items-center gap-2 px-4 py-1",
    },
    {
      _type: "DropdownMenuContent",
      _id: "content",
      _parent: "menu",
      styles: "#styles:,absolute left-0 w-80 mt-2 bg-white rounded-lg shadow-lg z-50",
    },
  ],
  category: "core",
  ...registerChaiBlockSchema({
    properties: {
      showDropdown: runtimeProp({
        type: "boolean",
        title: "Show Dropdown",
        default: false,
      }),
    },
  }),
};

export { Component, Config };
