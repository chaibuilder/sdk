export function getOrientation(
  parentElement: HTMLElement,
  blockElement: HTMLElement = null,
): "vertical" | "horizontal" {
  const computedStyle = window.getComputedStyle(parentElement);
  const blockComputedStyle = blockElement ? window.getComputedStyle(blockElement) : null;
  const display = computedStyle.display;
  const blockDisplay = blockComputedStyle ? blockComputedStyle.display : null;

  if (display === "flex" || display === "inline-flex") {
    const flexDirection = computedStyle.flexDirection;

    return flexDirection === "column" || flexDirection === "column-reverse" ? "vertical" : "horizontal";
  } else if (display === "grid") {
    const gridAutoFlow = computedStyle.gridAutoFlow;
    const gridTemplateColumns = computedStyle.gridTemplateColumns;

    // If the grid auto flow is set to column, it's vertical
    if (gridAutoFlow.includes("column")) {
      return "vertical";
    }

    // Check if gridTemplateColumns is explicitly set to a single column
    // In JSDOM environment, gridTemplateColumns might be empty or "none" for default grid
    if (
      gridTemplateColumns &&
      gridTemplateColumns !== "none" &&
      gridTemplateColumns !== "" &&
      !gridTemplateColumns.includes("calc") && // Handle calc expressions
      gridTemplateColumns.split(" ").length <= 1
    ) {
      return "vertical";
    }

    return "horizontal";
  } else if (blockDisplay === "inline-block" || blockDisplay === "inline") {
    return "horizontal";
  }

  return "vertical";
}
