import { registerChaiBlock } from "@chaibuilder/runtime";
import { Styles } from "@chaibuilder/runtime/controls";
import { addForcedClasses } from "../helper.ts";
import { STYLES_KEY } from "../../../core/constants/STRINGS.ts";
import { generateUUID } from "../../../core/functions/Functions.ts";

const Dropdown = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-dropdown");
  return (
    <div {...blockProps} {...forcedStyles}>
      {children}
    </div>
  );
};

registerChaiBlock(Dropdown, {
  type: "Dropdown",
  label: "Dropdown",
  category: "core",
  group: "advanced",
  props: {
    styles: Styles({ default: "relative inline-flex" }),
  },
  // @ts-ignore
  blocks: () => {
    const id = `dropdown-` + generateUUID();
    const num = "1";
    return [
      { _id: "a" + num, _type: "Dropdown", _name: "Dropdown" },
      {
        _id: "b" + num,
        _type: "DropdownToggle",
        _parent: "a" + num,
        _name: "Dropdown Toggle",
        styles_attrs: { "aria-controls": id },
      },
      { _id: "b3" + num, _type: "Text", _parent: "b" + num, content: "Dropdown Title" },
      {
        _id: "c" + num,
        _type: "DropdownContent",
        _parent: "a" + num,
        _name: "Dropdown Content",
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

const DropdownToggle = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-dropdown-toggle");
  return (
    <button type={"button"} {...forcedStyles} {...blockProps}>
      {children}
    </button>
  );
};

registerChaiBlock(DropdownToggle, {
  type: "DropdownToggle",
  label: "Dropdown Toggle",
  category: "core",
  group: "advanced",
  hidden: true,
  props: { styles: Styles({ default: "" }) },
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});

const DropdownMenu = ({ children, blockProps, styles }) => {
  const forcedStyles = addForcedClasses(styles, "hs-dropdown-menu");
  return (
    <div {...forcedStyles} {...blockProps}>
      {children}
    </div>
  );
};

registerChaiBlock(DropdownMenu, {
  type: "DropdownMenu",
  label: "Dropdown Menu",
  category: "core",
  group: "advanced",
  hidden: true,
  props: {
    styles: Styles({
      default:
        "transition-[opacity,margin] duration hs-dropdown-open:opacity-100 opacity-0 w-56 hidden z-10 mt-2 min-w-60 bg-white",
    }),
  },
  canAcceptBlock: () => true,
  canDelete: () => false,
  canMove: () => false,
  canDuplicate: () => false,
});
