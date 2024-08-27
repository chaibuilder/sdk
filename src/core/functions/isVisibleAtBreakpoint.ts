type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const isHiddenAtBreakpoint = (classes: string, breakpoint: Breakpoint): boolean => {
  const breakpoints: Breakpoint[] = ["xs", "sm", "md", "lg", "xl", "2xl"];
  const breakpointIndex = breakpoints.indexOf(breakpoint);

  const classArray = classes.split(" ");

  let visibilityState = new Array(breakpoints.length).fill(null);

  for (const cls of classArray) {
    let [prefix, baseClass] = cls.split(":");

    if (!baseClass) {
      baseClass = prefix;
      prefix = "xs"; // No prefix means it applies from the smallest breakpoint
    }

    const classBreakpointIndex = breakpoints.indexOf(prefix as Breakpoint);

    if (classBreakpointIndex <= breakpointIndex) {
      const isVisible = !["hidden"].includes(baseClass);
      for (let i = classBreakpointIndex; i < breakpoints.length; i++) {
        visibilityState[i] = isVisible;
      }
    }
  }

  // If no visibility class was applied for the current breakpoint, default to visible
  return visibilityState[breakpointIndex] ?? true;
};

export { isHiddenAtBreakpoint };
