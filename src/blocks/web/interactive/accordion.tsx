import { registerChaiBlock } from "@chaibuilder/runtime";
import { Checkbox, Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";
import { getBlocksFromHTML } from "../../../core/import-html/html-to-json.ts";
import { ChaiBlock } from "../../../core/types/ChaiBlock.ts";

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
    const id = `dnd-accordion-` + generateUUID();
    const html = `<div class="hs-accordion-group">
        <div class="hs-accordion active" id="hs-unstyled-heading-one">
          <button class="hs-accordion-toggle" aria-controls="hs-unstyled-collapse-one">
            Accordion #1
          </button>
          <div id="hs-unstyled-collapse-one" class="hs-accordion-content overflow-hidden transition-[height] duration-300" aria-labelledby="hs-unstyled-heading-one">
            It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
          </div>
        </div>
      
        <div class="hs-accordion" id="hs-unstyled-heading-two">
          <button class="hs-accordion-toggle" aria-controls="hs-unstyled-collapse-two">
            Accordion #2
          </button>
          <div id="hs-unstyled-collapse-two" class="hs-accordion-content hidden overflow-hidden transition-[height] duration-300" aria-labelledby="hs-unstyled-heading-two">
            It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
          </div>
        </div>
      </div>`;
    return getBlocksFromHTML(html.replace(/hs-unstyled-heading/g, id).replace(/hs-unstyled-collapse/g, id));
  },
  canAcceptBlock: (type) => type === "Accordion",
});

const Accordion = ({ children, blockProps, styles, blockState }) => {
  const forcedStyles = addForcedClasses(
    styles,
    "hs-accordion " + (blockState ? (blockState?.active ? "active" : "") : ""),
  );
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
  props: { styles: Styles({ default: "" }) },

  //@ts-ignore
  customStylingStates: {
    "hs-accordion-active": "Accordion Active",
  },

  //@ts-ignore
  blockState: {
    active: Checkbox({ default: false, title: "Show content in canvas" }),
  },
  getBlockStateFrom: (block: ChaiBlock) => [block._id],

  // @ts-ignore
  blocks: () => {
    const id = `dnd-accordion-` + generateUUID();
    const html = `
              <div class="hs-accordion active" id="hs-unstyled-heading-one">
          <button class="hs-accordion-toggle" aria-controls="hs-unstyled-collapse-one">
            Accordion #1
          </button>
          <div id="hs-unstyled-collapse-one" class="hs-accordion-content overflow-hidden transition-[height] duration-300" aria-labelledby="hs-unstyled-heading-one">
            It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
          </div>
        </div>
          `;
    return getBlocksFromHTML(html.replace(/hs-unstyled-heading/g, id).replace(/hs-unstyled-collapse/g, id));
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

const AccordionContent = ({ children, blockProps, styles, blockState, inBuilder }) => {
  const forcedStyles = addForcedClasses(
    styles,
    "hs-accordion-content",
    inBuilder && blockState ? (blockState?.active ? "!block !opacity-100" : "!hidden !opacity-0") : "",
  );
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
    styles: Styles({ default: "w-full overflow-hidden transition-height hidden duration-300" }),
  },
  //@ts-ignore
  getBlockStateFrom: (block) => [block._parent],
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});
