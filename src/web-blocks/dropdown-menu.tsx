import {
  ChaiBlockComponentProps,
  ChaiRuntimeProp,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  runtimeProp,
  stylesProp,
  StylesProp,
} from "@chaibuilder/runtime";

export type DropdownLinksProps = {
  showDropdown: ChaiRuntimeProp<boolean>;
  children: React.ReactNode;
  styles: ChaiStyles;
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
      show: closestBlockProp("Dropdown", "showDropdown"),
      title: { type: "string", title: "Title", default: "Menu Item" },
      icon: { type: "string", title: "Icon", default: "", ui: { "ui:widget": "icon" } },
      iconWidth: { type: "string", title: "Icon Width", default: "16px" },
      iconHeight: { type: "string", title: "Icon Height", default: "16px" },
      styles: StylesProp("flex items-center gap-2 px-4 py-1"),
    },
  }),
});

const DropdownContent = (
  props: ChaiBlockComponentProps<{ children: React.ReactNode; styles: ChaiStyles; show: ChaiRuntimeProp<boolean> }>,
) => {
  const { blockProps, children, styles, show } = props;
  if (!show) return null;

  return (
    <div {...blockProps} {...alpineAttrs.wrapper} {...styles}>
      {children}
    </div>
  );
};

registerChaiBlock(DropdownContent, {
  type: "DropdownContent",
  label: "Dropdown Content",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  canAcceptBlock: () => true,
  ...registerChaiBlockSchema({
    properties: {
      show: closestBlockProp("Dropdown", "showDropdown"),
      styles: stylesProp("absolute left-0 p-2 w-80 mt-2 bg-white rounded-lg shadow-lg z-50"),
    },
  }),
});

const Component = (props: ChaiBlockComponentProps<DropdownLinksProps>) => {
  const { blockProps, children, styles } = props;
  return (
    <div {...blockProps} {...styles}>
      {children}
    </div>
  );
};

const Config = {
  type: "Dropdown",
  label: "Dropdown",
  group: "basic",
  blocks: () => [
    { _type: "Dropdown", _id: "dropdown" },
    {
      _type: "DropdownButton",
      _id: "button",
      _parent: "dropdown",
      title: "Menu Item",
      icon: "",
      styles: "#styles:,flex items-center gap-2 px-4 py-1",
    },
    {
      _type: "DropdownContent",
      _id: "content",
      _parent: "dropdown",
      styles: "#styles:,absolute left-0 w-80 mt-2 bg-white rounded-lg shadow-lg z-50",
    },
    {
      _type: "Link",
      _id: "link",
      _parent: "content",
      content: "Link",
      styles: "#styles:,flex items-center gap-2 px-4 py-1",
      link: { href: "https://www.google.com", type: "url", target: "_self" },
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
      styles: StylesProp("relative"),
    },
  }),
};

export { Component, Config };
