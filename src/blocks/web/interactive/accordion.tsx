import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { STYLES_KEY } from "../../../core/constants/STRINGS.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";

const Accordion = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-accordion");
  return (
    <div {...blockProps} {...forcedStyles}>
      {children}
    </div>
  );
};

registerChaiBlock(Accordion, {
  type: "Accordion",
  label: "Accordion",
  category: "core",
  group: "advanced",
  props: {
    styles: Styles({ default: "" }),
  },
  // @ts-ignore
  blocks: () => {
    const id = `accordion` + generateUUID();
    return [
      { _id: "a", _type: "Accordion", _name: "Accordion" },
      {
        _id: "b",
        _type: "AccordionTrigger",
        _parent: "a",
        _name: "Accordion Trigger",
        styles_attrs: { "aria-controls": id },
      },
      {
        _id: "b1",
        _type: "Icon",
        _parent: "b",
        styles: `${STYLES_KEY},hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>`,
      },
      {
        _id: "b2",
        _type: "Icon",
        _parent: "b",
        styles: `${STYLES_KEY},hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
        </svg>`,
      },
      { _id: "b1", _type: "Text", _parent: "b", content: "Accordion Title" },
      {
        _id: "c",
        _type: "AccordionContent",
        _parent: "a",
        _name: "Accordion Content",
        styles: `${STYLES_KEY},w-full overflow-hidden transition-[height] duration-300 px-6 py-3`,
        styles_attrs: { "aria-labelledby": id },
      },
      {
        _id: "c1",
        _type: "Text",
        _parent: "c",
        content:
          "It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.",
      },
    ];
  },
});

const AccordionTrigger = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-accordion-toggle");
  return (
    <button {...forcedStyles} {...blockProps}>
      {children}
    </button>
  );
};

registerChaiBlock(AccordionTrigger, {
  type: "AccordionTrigger",
  label: "Accordion Trigger",
  category: "core",
  group: "advanced",
  hidden: true,
  props: {
    styles: Styles({
      default:
        "hs-accordion-active:text-blue-600 dark:hs-accordion-active:text-blue-500 inline-flex w-full items-center gap-x-3 rounded-lg px-6 py-3 text-start text-sm font-semibold text-gray-800 hover:text-gray-500 disabled:pointer-events-none disabled:opacity-50 dark:text-neutral-200 dark:hover:text-neutral-400",
    }),
  },
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});

const AccordionContent = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-accordion-content");
  return (
    <div {...forcedStyles} {...blockProps}>
      {children}
    </div>
  );
};

registerChaiBlock(AccordionContent, {
  type: "AccordionContent",
  label: "Accordion Content",
  category: "core",
  group: "advanced",
  hidden: true,
  props: {
    styles: Styles({ default: "w-full overflow-hidden transition-[height] duration-300" }),
  },
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});
