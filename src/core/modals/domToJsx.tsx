export function domToJsx(element: Element, indent = 0): string {
  const indentStr = "  ".repeat(indent);

  if (element.nodeType === Node.TEXT_NODE) {
    const text = element.textContent?.trim();
    return text ? `${indentStr}${text}\n` : "";
  }

  if (element.nodeType !== Node.ELEMENT_NODE) {
    return "";
  }

  const tagName = element.tagName.toLowerCase();

  // Handle self-closing tags
  const selfClosingTags = [
    "img",
    "br",
    "hr",
    "input",
    "meta",
    "link",
    "area",
    "base",
    "col",
    "embed",
    "source",
    "track",
    "wbr",
  ];
  if (selfClosingTags.includes(tagName)) {
    return `${indentStr}<${tagName} />\n`;
  }

  let jsx = `${indentStr}<${tagName}`;

  // Add attributes
  const attributes: string[] = [];
  for (const attr of element.attributes) {
    if (attr.name === "class") {
      attributes.push(`className="${attr.value}"`);
    } else if (attr.name === "for") {
      attributes.push(`htmlFor="${attr.value}"`);
    } else if (attr.name.startsWith("on") && attr.name !== "on") {
      // Convert event handlers to camelCase
      const eventName = attr.name.toLowerCase().replace(/on(\w)/, (_, letter) => "on" + letter.toUpperCase());
      attributes.push(`${eventName}={${attr.value}}`);
    } else if (attr.name === "style" && attr.value) {
      // Convert style string to object
      const styleObject = attr.value.split(";").reduce(
        (acc, style) => {
          const [property, value] = style.split(":").map((s) => s.trim());
          if (property && value) {
            const camelCaseProperty = property.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            acc[camelCaseProperty] = value.replace(/['"]/g, "");
          }
          return acc;
        },
        {} as Record<string, string>
      );
      attributes.push(`style={${JSON.stringify(styleObject)}}`);
    } else {
      attributes.push(`${attr.name}="${attr.value}"`);
    }
  }

  if (attributes.length > 0) {
    jsx += " " + attributes.join(" ");
  }

  // Add children
  const children = Array.from(element.childNodes);
  const hasChildren = children.some((child) => (child.nodeType === Node.TEXT_NODE ? child.textContent?.trim() : true));

  if (!hasChildren) {
    jsx += " />\n";
  } else {
    jsx += ">\n";

    for (const child of children) {
      jsx += domToJsx(child as Element, indent + 1);
    }

    jsx += `${indentStr}</${tagName}>\n`;
  }

  return jsx;
}
