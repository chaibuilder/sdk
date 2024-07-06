import { addForcedClasses } from "../helper.ts";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SelectOption, Styles } from "@chaibuilder/runtime/controls";
import { STYLES_KEY } from "../../../core/constants/STRINGS.ts";

const DarkModeButton = ({ styles, blockProps, children }) => {
  const forcedStyles = addForcedClasses(styles, "hs-dark-mode");
  return (
    <button {...blockProps} {...forcedStyles}>
      {children}
    </button>
  );
};

registerChaiBlock(DarkModeButton, {
  type: "DarkModeButton",
  label: "Dark Mode Button",
  category: "core",
  group: "advanced",
  props: {
    styles: Styles({ default: "" }),
    theme: SelectOption({
      title: "On Click Theme",
      options: [
        { value: "dark", title: "Dark" },
        { value: "light", title: "Light" },
      ],
      default: "light",
    }),
  },
  blocks: () => {
    return [
      {
        _type: "DarkModeButton",
        _id: "a",
        styles:
          STYLES_KEY +
          ",hs-dark-mode-active:hidden inline-flex items-center gap-x-2 py-2 px-3 bg-white/10 rounded-full text-sm text-white hover:bg-white/20",
      },
      {
        _type: "Icon",
        _id: "b",
        _parent: "a",
        styles: `${STYLES_KEY},flex-shrink-0 size-4`,
        icon: `<svg  xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>`,
      },
    ];
  },
});
