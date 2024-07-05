import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { STYLES_KEY } from "../../../core/constants/STRINGS.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";
import { flatten, map } from "lodash";

const AccordionGroup = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-accordion-group");
  return (
    <div {...blockProps} {...forcedStyles}>
      {children}
    </div>
  );
};

registerChaiBlock(AccordionGroup, {
  type: "AccordionGroup",
  label: "Accordion Group",
  category: "core",
  group: "advanced",
  props: {
    styles: Styles({ default: "" }),
  },
  // @ts-ignore
  blocks: () => {
    return [
      { _id: "aa", _type: "AccordionGroup", _name: "Accordion Group" },
      ...flatten(
        map([1, 2], (num) => {
          const id = `accordion-` + generateUUID();
          return [
            { _id: "a" + num, _type: "Accordion", _name: "Accordion", _parent: "aa" },
            {
              _id: "b" + num,
              _type: "AccordionToggle",
              _parent: "a" + num,
              _name: "Accordion Toggle",
              styles_attrs: { "aria-controls": id },
            },
            {
              _id: "b1" + num,
              _type: "Icon",
              _parent: "b" + num,
              styles: `${STYLES_KEY},hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
              icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
          <path d="M12 5v14"></path>
        </svg>`,
            },
            {
              _id: "b2" + num,
              _type: "Icon",
              _parent: "b" + num,
              styles: `${STYLES_KEY},hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
              icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14"></path>
        </svg>`,
            },
            { _id: "b3" + num, _type: "Text", _parent: "b" + num, content: "Accordion Title" },
            {
              _id: "c" + num,
              _type: "AccordionContent",
              _parent: "a" + num,
              _name: "Accordion Content",
              styles: `${STYLES_KEY},w-full overflow-hidden transition-[height] duration-300 px-6 py-3`,
              styles_attrs: { "aria-labelledby": id },
            },
            {
              _id: "c1" + num,
              _type: "Text",
              _parent: "c" + num,
              content:
                "It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.",
            },
          ];
        }),
      ),
    ];
  },
});

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
    const id = `accordion-` + generateUUID();
    const num = "1";
    return [
      { _id: "a" + num, _type: "Accordion", _name: "Accordion" },
      {
        _id: "b" + num,
        _type: "AccordionToggle",
        _parent: "a" + num,
        _name: "Accordion Toggle",
        styles_attrs: { "aria-controls": id },
      },
      {
        _id: "b1" + num,
        _type: "Icon",
        _parent: "b" + num,
        styles: `${STYLES_KEY},hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"></path>
    <path d="M12 5v14"></path>
  </svg>`,
      },
      {
        _id: "b2" + num,
        _type: "Icon",
        _parent: "b" + num,
        styles: `${STYLES_KEY},hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400`,
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M5 12h14"></path>
  </svg>`,
      },
      { _id: "b3" + num, _type: "Text", _parent: "b" + num, content: "Accordion Title" },
      {
        _id: "c" + num,
        _type: "AccordionContent",
        _parent: "a" + num,
        _name: "Accordion Content",
        styles: `${STYLES_KEY},w-full overflow-hidden transition-[height] duration-300 px-6 py-3`,
        styles_attrs: { "aria-labelledby": id },
      },
      {
        _id: "c1" + num,
        _type: "Text",
        _parent: "c" + num,
        content:
          "It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.",
      },
    ];
  },
});

const AccordionToggle = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-accordion-toggle");
  return (
    <button {...forcedStyles} {...blockProps}>
      {children}
    </button>
  );
};

registerChaiBlock(AccordionToggle, {
  type: "AccordionToggle",
  label: "Accordion Toggle",
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
