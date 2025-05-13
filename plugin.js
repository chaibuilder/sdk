const plugin = require("tailwindcss/plugin");

module.exports = plugin(function ({ addVariant, e }) {
  addVariant("cb-dropdown-open", [
    // Match: .cb-dropdown.cb-dropdown-open > .cb-dropdown-toggle .cb-dropdown-open:rotate-180
    ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.cb-dropdown.cb-dropdown-open > .cb-dropdown-toggle .${e(`cb-dropdown-open${separator}${className}`)}`;
      });
    },
    // Match: .cb-dropdown.cb-dropdown-open > .cb-dropdown-menu > .cb-dropdown-open:bg-gray-100
    ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.cb-dropdown.cb-dropdown-open > .cb-dropdown-menu > .${e(`cb-dropdown-open${separator}${className}`)}`;
      });
    },
    // Match: .cb-dropdown-menu.cb-dropdown-open:block
    ({ modifySelectors, separator }) => {
      modifySelectors(({ className }) => {
        return `.cb-dropdown-menu.cb-dropdown-open.${e(`cb-dropdown-open${separator}${className}`)}`;
      });
    },
  ]);
});
