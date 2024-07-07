import { registerChaiBlock } from "@chaibuilder/runtime";
import { Checkbox, Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";
import { getBlocksFromHTML } from "../../../core/import-html/html-to-json.ts";

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
    const id = `accordion-` + generateUUID();
    const html = `<div class="hs-accordion-group">
              <div class="hs-accordion active" id="hs-basic-heading-one">
                <button class="hs-accordion-toggle hs-accordion-active:text-blue-600 px-6 py-3 inline-flex items-center gap-x-3 text-sm w-full font-semibold text-start text-gray-800 hover:text-gray-500 rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:hs-accordion-active:text-blue-500 dark:text-neutral-200 dark:hover:text-neutral-400" aria-controls="hs-basic-collapse-one">
                  <svg class="hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  <svg class="hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                  </svg>
                  Accordion #1
                </button>
                <div id="hs-basic-collapse-one" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" aria-labelledby="hs-basic-heading-one">
                  <div class="pb-4 px-6">
                    <p class="text-sm text-gray-600 dark:text-neutral-200">
                      It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
                    </p>
                  </div>
                </div>
              </div>
          
              <div class="hs-accordion" id="hs-basic-heading-two">
                <button class="hs-accordion-toggle hs-accordion-active:text-blue-600 px-6 py-3 inline-flex items-center gap-x-3 text-sm w-full font-semibold text-start text-gray-800 hover:text-gray-500 rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:hs-accordion-active:text-blue-500 dark:text-neutral-200 dark:hover:text-neutral-400" aria-controls="hs-basic-collapse-two">
                  <svg class="hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  <svg class="hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                  </svg>
                  Accordion #2
                </button>
                <div id="hs-basic-collapse-two" class="hs-accordion-content hidden w-full overflow-hidden transition-[height] duration-300" aria-labelledby="hs-basic-heading-two">
                  <div class="pb-4 px-6">
                    <p class="text-sm text-gray-600 dark:text-neutral-200">
                      It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
                    </p>
                  </div>
                </div>
              </div>
            </div>`;
    return getBlocksFromHTML(html.replace(/hs-basic-heading/g, id).replace(/hs-basic-collapse/g, id));
  },
  canAcceptBlock: (type) => type === "Accordion",
});

const Accordion = ({ children, blockProps, styles, canvasSettings }) => {
  const forcedStyles = addForcedClasses(
    styles,
    "hs-accordion " + (canvasSettings ? (canvasSettings?.active ? "active" : "") : ""),
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
  props: {
    styles: Styles({ default: "" }),
  },

  //@ts-ignore
  customStylingStates: {
    "hs-accordion-active": "Accordion Active",
  },

  //@ts-ignore
  canvasSettings: {
    active: Checkbox({ default: false, title: "Show content in canvas" }),
  },
  getCanvasSettingsFrom: (block) => [block._id],

  // @ts-ignore
  blocks: () => {
    const id = `accordion-` + generateUUID();
    const html = `
              <div class="hs-accordion" id="hs-basic-heading-one">
                <button class="hs-accordion-toggle hs-accordion-active:text-blue-600 px-6 py-3 inline-flex items-center gap-x-3 text-sm w-full font-semibold text-start text-gray-800 hover:text-gray-500 rounded-lg disabled:opacity-50 disabled:pointer-events-none dark:hs-accordion-active:text-blue-500 dark:text-neutral-200 dark:hover:text-neutral-400" aria-controls="hs-basic-collapse-one">
                  <svg class="hs-accordion-active:hidden hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 block size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                  <svg class="hs-accordion-active:block hs-accordion-active:text-blue-600 hs-accordion-active:group-hover:text-blue-600 hidden size-4 text-gray-600 group-hover:text-gray-500 dark:text-neutral-400" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                  </svg>
                  Accordion #1
                </button>
                <div id="hs-basic-collapse-one" class="hs-accordion-content w-full overflow-hidden transition-[height] duration-300" aria-labelledby="hs-basic-heading-one">
                  <div class="py-4 px-6">
                    <p class="text-sm text-gray-600 dark:text-neutral-200">
                      It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element.
                    </p>
                  </div>
                </div>
              </div>
          `;
    return getBlocksFromHTML(html.replace(/hs-basic-heading/g, id).replace(/hs-basic-collapse/g, id));
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

const AccordionContent = ({ children, blockProps, styles, canvasSettings }) => {
  const forcedStyles = addForcedClasses(
    styles,
    "hs-accordion-content " +
      (canvasSettings ? (canvasSettings?.active ? "!block !opacity-100" : "!hidden !opacity-0") : ""),
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
  getCanvasSettingsFrom: (block) => [block._parent],
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});
