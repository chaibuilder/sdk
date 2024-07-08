import { registerChaiBlock } from "@chaibuilder/runtime";
import { Checkbox, Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { getBlocksFromHTML } from "../../../core/import-html/html-to-json.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";
import { find, get } from "lodash-es";
import { ChaiBlock } from "../../../core/types/ChaiBlock.ts";

const CollapseToggle = ({ children, blockProps, styles, blockState, inBuilder }) => {
  const blockStateClasses = inBuilder && blockState?.active ? " open" : "";
  const forcedStyles = addForcedClasses(styles, "hs-collapse-toggle", blockStateClasses);
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
  getBlockStateFrom: (block: ChaiBlock, allBlocks: ChaiBlock[]) => {
    const id = get(block, "styles_attrs.data-hs-collapse", "").replace("#", "");
    if (!id) return [];
    const collapse = find(allBlocks, (b) => get(b, "styles_attrs.id") === id);
    return collapse ? [collapse?._id] : [];
  },
});

const CollapseContent = ({ children, blockProps, styles, blockState, inBuilder }) => {
  const blockStateClasses = inBuilder
    ? { "!block !opacity-100 open": blockState?.active, "hidden opacity-0": !blockState?.active }
    : {};
  // take truthy values from blockStateClasses and add them to the forcedStyles
  const blockStateClassNames = Object.keys(blockStateClasses)
    .filter((key) => blockStateClasses[key])
    .join(" ");
  const forcedStyles = addForcedClasses(styles, "hs-collapse", blockStateClassNames);
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
  blockState: {
    active: Checkbox({ default: false, title: "Show collapse in canvas" }),
  },
  getBlockStateFrom: (block) => [block._id],
  // @ts-ignore
  blocks: () => {
    const html = `<button type="button" class="hs-collapse-toggle" id="hs-unstyled-collapse" data-hs-collapse="#hs-unstyled-collapse-content">
          Collapse
        </button>
        <div id="hs-unstyled-collapse-content" class="hs-collapse hidden w-full overflow-hidden transition-[height] duration-300" aria-labelledby="hs-unstyled-collapse">
          This is a collapse body. It is hidden by default, until the collapse plugin adds the appropriate classes that we use to style each element. These classes control the overall appearance, as well as the showing and hiding via CSS transitions.
        </div>`;
    return getBlocksFromHTML(html.replace(/hs-unstyled-collapse/g, `dnd-collapse-${generateUUID()}`));
  },
});
