type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const isVisibleAtBreakpoint = (classes: string, breakpoint: Breakpoint): boolean => {
  const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const breakpointIndex = breakpoints.indexOf(breakpoint);

  const classArray = classes.split(" ");

  // Initialize all breakpoints as hidden
  let visibilityState = new Array(breakpoints.length).fill(false);

  for (const cls of classArray) {
    let [prefix, baseClass] = cls.split(":");

    if (!baseClass) {
      baseClass = prefix;
      prefix = "xs"; // No prefix means it applies from the smallest breakpoint
    }

    const classBreakpointIndex = breakpoints.indexOf(prefix as Breakpoint);

    if (classBreakpointIndex <= breakpointIndex) {
      const isVisible = ["block", "flex", "inline", "inline-block", "inline-flex", "grid", "table"].includes(baseClass);
      for (let i = classBreakpointIndex; i < breakpoints.length; i++) {
        visibilityState[i] = isVisible;
      }
    }
  }

  // Return the visibility state for the current breakpoint
  return visibilityState[breakpointIndex];
};

export { isVisibleAtBreakpoint };
