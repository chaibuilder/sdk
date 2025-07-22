/**
 * This is the tailwind plugin for chai builder
 * Updated for Tailwind CSS v4
 */
export default {
  handler({ addBase, theme }) {
    addBase({
      "h1,h2,h3,h4,h5,h6": {
        fontFamily: theme("fontFamily.heading"),
      },
      body: {
        fontFamily: theme("fontFamily.body"),
        color: theme("colors.foreground"),
        backgroundColor: theme("colors.background"),
      },
    });
  },
};
