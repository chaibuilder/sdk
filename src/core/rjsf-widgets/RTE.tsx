// @ts-ignore
import { WidgetProps } from "@rjsf/utils";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { BaseEditor, createEditor, Descendant, Editor, Node, Element as SlateElement, Text, Transforms } from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";

// Define custom types for our Slate editor
type CustomElement = {
  type: "paragraph" | "block-quote" | "bulleted-list" | "numbered-list" | "list-item";
  align?: "left" | "center" | "right";
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
};

// Extend the Slate types
declare module "slate" {
  interface CustomTypes {
    Editor: BaseEditor & ReactEditor & HistoryEditor;
    Element: CustomElement;
    Text: CustomText;
  }
}

// Define the rich text elements
const Element = ({ attributes, children, element }: any) => {
  const style = element.align ? { textAlign: element.align } : {};

  switch (element.type) {
    case "block-quote":
      return (
        <blockquote style={style} className="border-l-4 border-gray-300 pl-4 italic text-gray-700" {...attributes}>
          {children}
        </blockquote>
      );
    case "bulleted-list":
      return (
        <ul style={style} className="list-disc pl-5" {...attributes}>
          {children}
        </ul>
      );
    case "numbered-list":
      return (
        <ol style={style} className="list-decimal pl-5" {...attributes}>
          {children}
        </ol>
      );
    case "list-item":
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

// Define leaf rendering
const Leaf = ({ attributes, children, leaf }: any) => {
  let el = <>{children}</>;

  if (leaf.bold) {
    el = <strong>{el}</strong>;
  }

  if (leaf.italic) {
    el = <em>{el}</em>;
  }

  if (leaf.underline) {
    el = <u>{el}</u>;
  }

  if (leaf.strike) {
    el = <s>{el}</s>;
  }

  return <span {...attributes}>{el}</span>;
};

// Convert HTML string to Slate nodes
const deserialize = (html: string): Descendant[] => {
  if (!html) return [{ type: "paragraph", children: [{ text: "" }] } as CustomElement];

  try {
    // First try to parse as JSON (for backward compatibility)
    return JSON.parse(html) as Descendant[];
  } catch (error) {
    // If it's not valid JSON, treat it as HTML
    const div = document.createElement("div");
    div.innerHTML = html.trim();

    return deserializeHTMLToSlate(div);
  }
};

// Helper function to convert DOM nodes to Slate nodes
const deserializeHTMLToSlate = (el: HTMLElement): Descendant[] => {
  if (el.nodeType === 3) {
    // Text node
    return [{ text: el.textContent || "" }];
  } else if (el.nodeType !== 1) {
    // Not an element node
    return [{ text: "" }];
  }

  const { nodeName } = el;
  let parent = el;

  // Handle specific HTML elements
  let children: Descendant[] = Array.from(parent.childNodes)
    .map((node) => deserializeHTMLToSlate(node as HTMLElement))
    .flat();

  // If there are no children, add an empty text node
  if (children.length === 0) {
    children = [{ text: "" }];
  }

  // Map HTML elements to Slate elements
  switch (nodeName) {
    case "BLOCKQUOTE":
      return [{ type: "block-quote", children } as CustomElement];
    case "UL":
      return [{ type: "bulleted-list", children } as CustomElement];
    case "OL":
      return [{ type: "numbered-list", children } as CustomElement];
    case "LI":
      return [{ type: "list-item", children } as CustomElement];
    case "P": {
      // Check for text alignment
      const style = el.getAttribute("style") || "";
      const alignMatch = style.match(/text-align:\s*(\w+)/);
      const align = alignMatch ? (alignMatch[1] as "left" | "center" | "right") : undefined;

      return [{ type: "paragraph", align, children } as CustomElement];
    }
    case "DIV": {
      // Check for text alignment in divs too
      const style = el.getAttribute("style") || "";
      const alignMatch = style.match(/text-align:\s*(\w+)/);
      const align = alignMatch ? (alignMatch[1] as "left" | "center" | "right") : undefined;

      return [{ type: "paragraph", align, children } as CustomElement];
    }
    case "STRONG":
    case "B":
      return children.map((child) => {
        if (Text.isText(child)) {
          return { ...child, bold: true };
        }
        return child;
      });
    case "EM":
    case "I":
      return children.map((child) => {
        if (Text.isText(child)) {
          return { ...child, italic: true };
        }
        return child;
      });
    case "U":
      return children.map((child) => {
        if (Text.isText(child)) {
          return { ...child, underline: true };
        }
        return child;
      });
    case "S":
    case "STRIKE":
    case "DEL":
      return children.map((child) => {
        if (Text.isText(child)) {
          return { ...child, strike: true };
        }
        return child;
      });
    case "BR":
      return [{ text: "\n" }];
    default:
      return children;
  }
};

// Convert Slate nodes to HTML string
const serialize = (nodes: Descendant[]): string => {
  return nodes.map((node) => serializeNodeToHTML(node)).join("");
};

// Helper function to convert a Slate node to HTML
const serializeNodeToHTML = (node: Node): string => {
  if (Text.isText(node)) {
    let text = node.text;

    // Escape HTML special characters
    text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

    // Apply text formatting
    if (node.bold) {
      text = `<strong>${text}</strong>`;
    }
    if (node.italic) {
      text = `<em>${text}</em>`;
    }
    if (node.underline) {
      text = `<u>${text}</u>`;
    }
    if (node.strike) {
      text = `<s>${text}</s>`;
    }

    return text;
  }

  const children = node.children.map((n) => serializeNodeToHTML(n)).join("");

  // Check if node is a CustomElement
  if (!Editor.isEditor(node) && SlateElement.isElement(node)) {
    // Handle different element types
    switch (node.type) {
      case "block-quote":
        return `<blockquote>${children}</blockquote>`;
      case "bulleted-list":
        return `<ul>${children}</ul>`;
      case "numbered-list":
        return `<ol>${children}</ol>`;
      case "list-item":
        return `<li>${children}</li>`;
      case "paragraph":
        if (node.align) {
          return `<p style="text-align: ${node.align}">${children}</p>`;
        }
        return `<p>${children}</p>`;
      default:
        return children;
    }
  }

  return children;
};

// Custom button component for the toolbar
const ToolbarButton = ({ icon, isActive, onMouseDown }) => {
  return (
    <button
      type="button"
      className={`h-8 w-8 rounded p-1 ${isActive ? "bg-slate-200" : "hover:bg-slate-100"}`}
      onMouseDown={onMouseDown}>
      {icon}
    </button>
  );
};

// Toolbar component
const Toolbar = ({ editor }) => {
  // Check if mark is active
  const isMarkActive = (format) => {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  };

  // Toggle mark
  const toggleMark = (format, event) => {
    event.preventDefault();
    const isActive = isMarkActive(format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  };

  // Check if block type is active
  const isBlockActive = (format) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.type === format,
    });
    return !!match;
  };

  // Check if alignment is active
  const isAlignActive = (align) => {
    const [match] = Editor.nodes(editor, {
      match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) && n.align === align,
    });
    return !!match;
  };

  // Toggle block type
  const toggleBlock = (format, event) => {
    event.preventDefault();

    // Handle list types specially
    if (format === "bulleted-list" || format === "numbered-list") {
      const isList = isBlockActive("bulleted-list") || isBlockActive("numbered-list");
      const isActive = isBlockActive(format);

      Transforms.unwrapNodes(editor, {
        match: (n) =>
          !Editor.isEditor(n) &&
          SlateElement.isElement(n) &&
          (n.type === "bulleted-list" || n.type === "numbered-list"),
        split: true,
      });

      const newProperties: Partial<SlateElement> = {
        type: isActive ? "paragraph" : "list-item",
      };

      Transforms.setNodes(editor, newProperties);

      if (!isActive && !isList) {
        const block = { type: format, children: [] };
        Transforms.wrapNodes(editor, block);
      }
    } else if (format === "block-quote") {
      const isActive = isBlockActive(format);

      Transforms.setNodes(
        editor,
        { type: isActive ? "paragraph" : format },
        { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) },
      );
    }
  };

  // Set text alignment
  const setTextAlign = (align, event) => {
    event.preventDefault();
    const isActive = isAlignActive(align);

    Transforms.setNodes(
      editor,
      { align: isActive ? undefined : align },
      { match: (n) => !Editor.isEditor(n) && SlateElement.isElement(n) },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b p-1">
      <ToolbarButton
        icon={<Bold size={16} />}
        isActive={isMarkActive("bold")}
        onMouseDown={(e) => toggleMark("bold", e)}
      />
      <ToolbarButton
        icon={<Italic size={16} />}
        isActive={isMarkActive("italic")}
        onMouseDown={(e) => toggleMark("italic", e)}
      />
      <ToolbarButton
        icon={<Underline size={16} />}
        isActive={isMarkActive("underline")}
        onMouseDown={(e) => toggleMark("underline", e)}
      />
      <ToolbarButton
        icon={<Strikethrough size={16} />}
        isActive={isMarkActive("strike")}
        onMouseDown={(e) => toggleMark("strike", e)}
      />
      <div className="mx-1 h-6 w-px bg-gray-300" />
      <ToolbarButton
        icon={<List size={16} />}
        isActive={isBlockActive("bulleted-list")}
        onMouseDown={(e) => toggleBlock("bulleted-list", e)}
      />
      <ToolbarButton
        icon={<ListOrdered size={16} />}
        isActive={isBlockActive("numbered-list")}
        onMouseDown={(e) => toggleBlock("numbered-list", e)}
      />
      <ToolbarButton
        icon={<Quote size={16} />}
        isActive={isBlockActive("block-quote")}
        onMouseDown={(e) => toggleBlock("block-quote", e)}
      />
      <div className="mx-1 h-6 w-px bg-gray-300" />
      <ToolbarButton
        icon={<AlignLeft size={16} />}
        isActive={isAlignActive("left")}
        onMouseDown={(e) => setTextAlign("left", e)}
      />
      <ToolbarButton
        icon={<AlignCenter size={16} />}
        isActive={isAlignActive("center")}
        onMouseDown={(e) => setTextAlign("center", e)}
      />
      <ToolbarButton
        icon={<AlignRight size={16} />}
        isActive={isAlignActive("right")}
        onMouseDown={(e) => setTextAlign("right", e)}
      />
    </div>
  );
};

const RichTextEditorField = ({ id, placeholder, value, onChange, onBlur }: WidgetProps) => {
  // Create a Slate editor object that won't change across renders
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const editorRef = useRef(null);

  // Initialize with content
  const initialValue = useMemo(() => deserialize(value), [value]);

  // Define change handler
  const handleChange = useCallback(
    (newValue: Descendant[]) => {
      const isAstChange = editor.operations.some((op) => op.type !== "set_selection");
      if (isAstChange) {
        const content = serialize(newValue);
        onChange(content);
      }
    },
    [editor, onChange],
  );

  // Define blur handler
  const handleBlur = useCallback(() => {
    if (onBlur) {
      const content = serialize(editor.children);
      onBlur(id, content);
    }
  }, [editor, id, onBlur]);

  useEffect(() => {
    editorRef.current.__RTEditor = editor;
  }, [editor]);

  return (
    <div ref={editorRef} id={`slate-${id}`} className="mt-1 overflow-hidden rounded-md border">
      <Slate editor={editor} initialValue={initialValue} onChange={handleChange}>
        <Toolbar editor={editor} />
        <Editable
          placeholder={placeholder}
          onBlur={handleBlur}
          renderElement={(props) => <Element {...props} />}
          renderLeaf={(props) => <Leaf {...props} />}
          className="min-h-[100px] p-2 focus:outline-none"
        />
      </Slate>
    </div>
  );
};

export { RichTextEditorField as RTEField };
