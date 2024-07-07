import { registerChaiBlock } from "@chaibuilder/runtime";
import { Checkbox, Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { getBlocksFromHTML } from "../../../core/import-html/html-to-json.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";
import { find, get } from "lodash";

const CollapseToggle = ({ children, blockProps, styles, canvasSettings }) => {
  const forcedStyles = addForcedClasses(styles, "hs-collapse-toggle " + (canvasSettings?.active ? "open" : ""));
  return (
    <button type={"button"} {...forcedStyles} {...blockProps}>
      {children}
    </button>
  );
};

registerChaiBlock(CollapseToggle, {
  type: "CollapseToggle",
  label: "Collapse Toggle",
  category: "core",
  group: "advanced",
  hidden: true,
  props: { styles: Styles({ default: "" }) },
  canAcceptBlock: () => true,
  //@ts-ignore
  customStylingStates: {
    "hs-collapse-open": "Collapse Open",
  },
  // @ts-ignore
  getCanvasSettingsFrom: (block, allBlocks) => {
    const id = get(block, "styles_attr.data-hs-collapse", "");
    if (!id) return [];
    const collapse = find(allBlocks, (b) => get(b, "styles_attr.id", "") === id);
    console.log("collapse", collapse);
    return collapse ? [collapse?._id] : [];
  },
});

const CollapseContent = ({ children, blockProps, styles, canvasSettings }) => {
  const forcedStyles = addForcedClasses(
    styles,
    "hs-collapse " + (canvasSettings?.active ? "!block !opacity-100 open" : ""),
  );
  return (
    <div {...forcedStyles} {...blockProps}>
      {children}
    </div>
  );
};

registerChaiBlock(CollapseContent, {
  type: "Collapse",
  label: "Collapse",
  category: "core",
  group: "advanced",
  props: {
    styles: Styles({
      default:
        "transition-opacity transition-margin duration hs-collapse-open:opacity-100 opacity-0 w-56 hidden z-10 mt-2 min-w-60 bg-white",
    }),
  },
  canAcceptBlock: () => true,
  //@ts-ignore
  canvasSettings: {
    active: Checkbox({ default: false, title: "Show collapse in canvas" }),
  },
  getCanvasSettingsFrom: (block) => [block._id],
  // @ts-ignore
  blocks: () => {
    const html = `<button type="button" class="hs-collapse-toggle py-3 px-4 inline-flex items-center gap-x-2 text-sm font-medium rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-white dark:hover:bg-neutral-800" id="hs-basic-collapse" data-hs-collapse="#hs-basic-collapse-heading">
      Collapse
      <svg class="hs-collapse-open:rotate-180 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m6 9 6 6 6-6"></path>
      </svg>
    </button>
    <div id="hs-basic-collapse-content" class="hs-collapse hidden w-full overflow-hidden transition-[height] duration-300" aria-labelledby="hs-basic-collapse">
      <div class="mt-5 bg-white rounded-lg py-3 px-4 dark:bg-neutral-800">
        <p class="text-gray-500 dark:text-neutral-400">
          This is a collapse body. It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions.
        </p>
      </div>
    </div>`;
    return getBlocksFromHTML(html.replace(/hs-basic-collapse/g, `collapse-${generateUUID()}`));
  },
});
