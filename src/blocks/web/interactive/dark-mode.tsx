import { addForcedClasses } from "../helper.ts";
import { registerChaiBlock } from "@chaibuilder/runtime";
import { SelectOption, Styles } from "@chaibuilder/runtime/controls";
import { getBlocksFromHTML } from "../../../core/import-html/html-to-json.ts";

const DarkModeButton = ({ styles, blockProps, children, theme }) => {
  const forcedStyles = addForcedClasses(styles, "hs-dark-mode");
  return (
    <button {...blockProps} {...forcedStyles} data-hs-theme-click-value={theme}>
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
    const html = `<button type="button" class="hs-dark-mode hs-dark-mode-active:hidden block" data-hs-theme-click-value="dark">
          Dark
        </button>
        <button type="button" class="hs-dark-mode hs-dark-mode-active:inline-flex hidden" data-hs-theme-click-value="light">
          Light
        </button>`;
    return getBlocksFromHTML(html);
  },
});
