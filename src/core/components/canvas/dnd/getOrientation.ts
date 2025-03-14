export function getOrientation(target: HTMLElement): "vertical" | "horizontal" {
  const computedStyle = window.getComputedStyle(target);
  const display = computedStyle.display;

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
  } else if (display === "block" || display === "inline-block") {
    // For block and inline-block, we assume vertical by default, though this might depend on other CSS properties.
    return "vertical";
  }

  return "horizontal";
}

if (import.meta.vitest) {
  const { test, expect } = import.meta.vitest;

  test("getOrientation default div should be vertical", () => {
    expect(getOrientation(document.createElement("div"))).toBe("vertical");
  });

  test("getOrientation flex with default direction should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation inline-flex with default direction should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "inline-flex";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation flex with row direction should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "row";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation flex with row-reverse direction should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "row-reverse";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation flex with column direction should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation flex with column-reverse direction should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "flex";
    div.style.flexDirection = "column-reverse";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation grid with default settings should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation grid with row auto-flow should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.style.gridAutoFlow = "row";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation grid with column auto-flow should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.style.gridAutoFlow = "column";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation grid with dense column auto-flow should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.style.gridAutoFlow = "column dense";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation grid with single column should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.style.gridTemplateColumns = "1fr";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation grid with multiple columns should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "grid";
    div.style.gridTemplateColumns = "1fr 1fr";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation block should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "block";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation inline-block should be vertical", () => {
    const div = document.createElement("div");
    div.style.display = "inline-block";
    expect(getOrientation(div)).toBe("vertical");
  });

  test("getOrientation inline should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "inline";
    expect(getOrientation(div)).toBe("horizontal");
  });

  test("getOrientation table should be horizontal", () => {
    const div = document.createElement("div");
    div.style.display = "table";
    expect(getOrientation(div)).toBe("horizontal");
  });
}
