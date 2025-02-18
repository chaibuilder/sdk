import {
  ChaiBlock,
  ChaiBlockComponentProps,
  ChaiRuntimeProp,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  runtimeProp,
  StylesProp,
} from "@chaibuilder/runtime";
import { DropdownMenuIcon } from "@radix-ui/react-icons";

export type DropdownLinksProps = {
  showDropdown: ChaiRuntimeProp<boolean>;
  children: React.ReactNode;
  styles: ChaiStyles;
};

const alpineAttrs = {
  wrapper: { "x-data": "{ open: false }" },
  button: { "x-on:click": "open = !open" },
  menu: {
    "x-show": "open",
    "x-on:click": "open = false",
    "x-on:click.away": "open = false",
    "x-cloak": "",
    "x-transition": "",
  },
};

const DropdownButton = (
  props: ChaiBlockComponentProps<{
    content: string;
    icon: string;
    iconWidth: string;
    iconHeight: string;
    styles: ChaiStyles;
    show: ChaiRuntimeProp<boolean>;
  }>,
) => {
  const { blockProps, content, icon, iconWidth, iconHeight, styles, show } = props;
  return (
    <button aria-label={content} {...blockProps} {...styles} {...alpineAttrs.button}>
      {content}
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
      content: { type: "string", title: "Title", default: "Menu Item" },
      icon: { type: "string", title: "Icon", default: "", ui: { "ui:widget": "icon" } },
      iconWidth: { type: "string", title: "Icon Width", default: "16px" },
      iconHeight: { type: "string", title: "Icon Height", default: "16px" },
      styles: StylesProp("flex items-center gap-2 px-4 py-1"),
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
});

const DropdownContent = (
  props: ChaiBlockComponentProps<{ children: React.ReactNode; styles: ChaiStyles; show: ChaiRuntimeProp<boolean> }>,
) => {
  const { blockProps, children, styles, show, inBuilder } = props;
  if (inBuilder && !show) return null;

  return (
    <div {...blockProps} {...alpineAttrs.menu} {...styles}>
      {children}
    </div>
  );
};

registerChaiBlock(DropdownContent, {
  type: "DropdownContent",
  label: "Dropdown Content",
  group: "basic",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  canAcceptBlock: () => true,
  ...registerChaiBlockSchema({
    properties: {
      show: closestBlockProp("Dropdown", "showDropdown"),
      styles: StylesProp("absolute left-0 p-2 w-80 mt-2 bg-white rounded-lg shadow-lg z-50"),
    },
  }),
});

const Component = (props: ChaiBlockComponentProps<DropdownLinksProps>) => {
  const { blockProps, children, styles } = props;
  return (
    <div {...blockProps} {...styles} {...alpineAttrs.wrapper}>
      {children}
    </div>
  );
};

const Config = {
  type: "Dropdown",
  label: "Dropdown",
  group: "basic",
  icon: DropdownMenuIcon,
  blocks: () =>
    [
      { _type: "Dropdown", _id: "dropdown" },
      {
        _type: "DropdownButton",
        _id: "button",
        _parent: "dropdown",
        title: "Menu Item",
        icon: `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24"> <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"/> </svg>`,
        styles: "#styles:,flex items-center gap-2 px-4 py-1",
      },
      {
        _type: "DropdownContent",
        _id: "content",
        _parent: "dropdown",
        styles: "#styles:,absolute left-0 w-80 mt-0.5 bg-white rounded-lg shadow-lg z-50",
      },
      {
        _type: "Link",
        _id: "link",
        _parent: "content",
        content: "Link",
        styles: "#styles:,flex items-center gap-2 px-4 py-1",
        link: { href: "https://www.google.com", type: "url", target: "_self" },
      },
    ] as ChaiBlock[],
  category: "core",
  wrapper: true,
  ...registerChaiBlockSchema({
    properties: {
      showDropdown: runtimeProp({
        type: "boolean",
        title: "Show Dropdown",
        default: false,
      }),
      styles: StylesProp("relative w-max"),
    },
  }),
};

export { Component, Config };
