import {
  builderProp,
  ChaiBlock,
  ChaiBlockComponentProps,
  ChaiStyles,
  closestBlockProp,
  registerChaiBlock,
  registerChaiBlockSchema,
  StylesProp,
} from "@chaibuilder/runtime";
import { Layers } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "../../ui";

export type ModalProps = {
  children: React.ReactNode;
  styles: ChaiStyles;
  overlayStyles: ChaiStyles;
  show: boolean;
};

type ModalTriggerProps = {
  children: React.ReactNode;
  styles: ChaiStyles;
  content: string;
};

type ModalContentProps = {
  children: React.ReactNode;
  styles: ChaiStyles;
  show: boolean;
};

const ModalTriggerComponent = (props: ChaiBlockComponentProps<ModalTriggerProps>) => {
  const { blockProps, content, children, styles } = props;
  return (
    <DialogTrigger asChild>
      <div {...blockProps} {...styles}>
        {children || content}
      </div>
    </DialogTrigger>
  );
};

registerChaiBlock(ModalTriggerComponent, {
  type: "ModalTrigger",
  label: "Modal Trigger",
  group: "advanced",
  category: "core",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  canAcceptBlock: () => true,
  canDuplicate: () => false,
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("w-max"),
      content: {
        type: "string",
        title: "Content",
        default: "Edit Profile",
      },
    },
  }),
  i18nProps: ["content"],
  aiProps: ["content"],
});

const BuilderPortal = ({ children }: { children: any }) => {
  const container = document.getElementById("canvas-iframe");
  const width = container?.clientWidth;
  const height = container?.clientHeight;
  return (
    <div style={{ height, width }} className="absolute left-0 top-0 bg-black/80">
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] bg-background">
        {children}
      </div>
    </div>
  );
};

const ModalContentComponent = (props: ChaiBlockComponentProps<ModalContentProps>) => {
  const { blockProps, children, styles, inBuilder, show } = props;

  console.log("ModalContentComponent", props);

  if (inBuilder) {
    // * In builder showing children with a custom portal
    if (!show) return null;
    return (
      <BuilderPortal>
        <div {...blockProps} {...styles}>
          {children || "Modal Placeholder"}
        </div>
      </BuilderPortal>
    );
  }

  return (
    <DialogContent className="rounded-none border-none p-0 shadow-none sm:rounded-none">
      <div {...blockProps} {...styles}>
        {children || "Modal Placeholder"}
      </div>
    </DialogContent>
  );
};

registerChaiBlock(ModalContentComponent, {
  type: "ModalContent",
  label: "Modal Content",
  group: "advanced",
  hidden: true,
  canMove: () => false,
  canDelete: () => false,
  canAcceptBlock: () => true,
  canDuplicate: () => false,
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp("gap-4 border p-6 shadow-lg sm:rounded-lg"),
      show: closestBlockProp("Modal", "show"),
    },
  }),
});

const Component = (props: ChaiBlockComponentProps<ModalProps>) => {
  const { styles, children, blockProps, inBuilder } = props;

  return (
    <Dialog {...(inBuilder ? { open: false } : {})}>
      <div {...blockProps} {...styles}>
        {children}
      </div>
    </Dialog>
  );
};

const Config = {
  type: "Modal",
  label: "Modal",
  group: "advanced",
  category: "core",
  wrapper: true,
  icon: Layers,
  blocks: () =>
    [
      { _type: "Modal", _id: "modal" },
      {
        _type: "ModalTrigger",
        _id: "modal-trigger",
        _parent: "modal",
        content: "Edit Profile",
      },
      {
        _type: "ModalContent",
        _id: "modal-content",
        _parent: "modal",
      },
    ] as ChaiBlock[],
  ...registerChaiBlockSchema({
    properties: {
      styles: StylesProp(""),
      show: builderProp({
        type: "boolean",
        title: "Open Modal",
        default: false,
      }),
    },
  }),
};

export { Component, Config };
