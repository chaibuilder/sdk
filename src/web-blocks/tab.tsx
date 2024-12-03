import {
  ChaiBlockComponentProps,
  ChaiStyles,
  registerChaiBlock,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";
import { LayoutGridIcon, ListIcon, FileIcon, PanelTopIcon, LinkIcon } from "lucide-react";
// Tabs Component
type TabsProps = {
  styles: ChaiStyles;
};

// TabsList Component
type TabListProps = {
  styles: ChaiStyles;
};

// TabLink Component
type TabLinkProps = {
  styles: ChaiStyles;
};

// TabsContent Component
type TabContentProps = {
  styles: ChaiStyles;
};

// TabPanel Component
type TabPanelProps = {
  styles: ChaiStyles;
};

const Component = (props: ChaiBlockComponentProps<TabsProps>) => {
  const { blockProps, children, styles } = props;

  return (
    <div {...blockProps} {...styles} className="space-y-2 p-2">
      {children}
    </div>
  );
};

const Config = {
  type: "Tabs",
  label: "Tabs",
  group: "basic",
  category: "core",
  icon: LayoutGridIcon,
  blocks: () => [
    { _type: "Tabs", _id: "tabs", styles: "#styles:" },
    { _type: "TabsList", _id: "tabs-list", _parent: "tabs", styles: "#styles:" },
    { _type: "TabLink", _id: "tab-link-1", _parent: "tabs-list", styles: "#styles:bg-white" },
    { _type: "TabLink", _id: "tab-link-2", _parent: "tabs-list", styles: "#styles:" },
    { _type: "TabsContent", _id: "tabs-content", _parent: "tabs", styles: "#styles:" },
    { _type: "TabPanel", _id: "tab-panel", _parent: "tabs-content", styles: "#styles:" },
  ],
  canDelete: () => true,
  canAcceptBlock: (childType) => childType === "TabsList" || childType === "TabsContent",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
};

const TabsList = (props: ChaiBlockComponentProps<TabListProps>) => {
  const { blockProps, children, styles } = props;

  return (
    <div
      {...blockProps}
      {...styles}
      className="inline-flex items-center justify-center rounded-sm bg-muted p-1 text-muted-foreground">
      {children}
    </div>
  );
};

registerChaiBlock(TabsList, {
  type: "TabsList",
  label: "Tabs List",
  group: "basic",
  category: "core",
  icon: ListIcon,
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Tabs",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const TabLink = (props: ChaiBlockComponentProps<TabLinkProps>) => {
  const { blockProps, children, styles} = props;

  return (
    <div
      {...blockProps}
      {...styles}
      className="rounded-sm px-4 py-2 text-sm font-medium transition-colors data-[state=active]:bg-white">
      {children || "Tab Link"}
    </div>
  );
};

registerChaiBlock(TabLink, {
  type: "TabLink",
  label: "Tab Link",
  group: "basic",
  icon: LinkIcon,
  category: "core",
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "TabsList",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const TabsContent = (props: ChaiBlockComponentProps<TabContentProps>) => {
  const { blockProps, children, styles } = props;

  return (
    <div {...blockProps} {...styles} className="rounded-sm">
      {children || "Tab Content Area"}
    </div>
  );
};

registerChaiBlock(TabsContent, {
  type: "TabsContent",
  label: "Tabs Content",
  group: "basic",
  category: "core",
  icon: FileIcon,
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "Tabs",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

const TabPanel = (props: ChaiBlockComponentProps<TabPanelProps>) => {
  const { blockProps, children, styles } = props;

  return (
    <div {...blockProps} {...styles} className="border border-bg-card shadow rounded-sm">
      {children}
    </div>
  );
};

registerChaiBlock(TabPanel, {
  type: "TabPanel",
  label: "Tab Panel",
  group: "basic",
  category: "core",
  icon: PanelTopIcon,
  canDelete: () => true,
  canAcceptBlock: () => true,
  canBeNested: (type: string) => type === "TabsContent",
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
    },
  }),
});

// Exporting Components
export { Component, Config };

// Exporting Types
export type { TabsProps, TabListProps, TabLinkProps, TabContentProps, TabPanelProps };
