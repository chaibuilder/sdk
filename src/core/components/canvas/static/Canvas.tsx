import { useAtom } from "jotai";
import { first, isEmpty, omit, throttle } from "lodash-es";
import { Bold, Italic, Strikethrough, Underline } from "lucide-react";
import React, { useCallback, useEffect } from "react";
import ReactDOM from "react-dom";
import { createEditor, Descendant, Editor, Node, Element as SlateElement, Text } from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { pageBlocksAtomsAtom } from "../../../atoms/blocks.ts";
import { inlineEditingActiveAtom, treeRefAtom } from "../../../atoms/ui.ts";
import { useFrame } from "../../../frame";
import { useBlockHighlight, useSelectedBlockIds, useSelectedStylingBlocks, useUpdateBlocksProps } from "../../../hooks";
import { useGetBlockAtomValue } from "../../../hooks/useUpdateBlockAtom.ts";
import { ChaiBlock } from "../../../types/ChaiBlock.ts";
import { useDnd } from "../dnd/useDnd.ts";

// Define custom types for our Slate editor
type CustomElement = {
  type: "paragraph";
  children: CustomText[];
};

type CustomText = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strike?: boolean;
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
  if (!html) return [{ type: "paragraph", children: [{ text: "" }] }];

  try {
    // First try to parse as JSON (for backward compatibility)
    return JSON.parse(html);
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
    case "P":
    case "DIV":
      return [{ type: "paragraph", children } as CustomElement];
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
      case "paragraph":
        return `<p>${children}</p>`;
      default:
        return children;
    }
  }

  return children;
};

function getTargetedBlock(target) {
  // First check if the target is the canvas itself
  if (target.getAttribute("data-block-id") === "canvas") {
    return null;
  }

  // Then check for other blocks
  if (target.getAttribute("data-block-id") || target.getAttribute("data-block-parent")) {
    return target;
  }

  // When looking for parent blocks, exclude the canvas
  const closest = target.closest("[data-block-id]");
  return closest?.getAttribute("data-block-id") === "canvas" ? null : closest;
}

function destroySlateEditor(editor, container) {
  if (!editor || !container) return;

  // Clear the contents of the editor container
  container.innerHTML = "";

  // Remove the container from the DOM
  if (container.parentNode) {
    container.parentNode.removeChild(container);
  }
}

// Simple toolbar button component
const ToolbarButton = ({ icon, isActive, onMouseDown }) => {
  return (
    <button
      type="button"
      className={`h-6 w-6 rounded p-1 ${isActive ? "bg-slate-200" : "hover:bg-slate-100"}`}
      onMouseDown={onMouseDown}>
      {icon}
    </button>
  );
};

// Simple toolbar for inline editing
const InlineToolbar = ({ editor }) => {
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

  return (
    <div className="flex items-center gap-1 border-b bg-white p-1">
      <ToolbarButton
        icon={<Bold size={14} />}
        isActive={isMarkActive("bold")}
        onMouseDown={(e) => toggleMark("bold", e)}
      />
      <ToolbarButton
        icon={<Italic size={14} />}
        isActive={isMarkActive("italic")}
        onMouseDown={(e) => toggleMark("italic", e)}
      />
      <ToolbarButton
        icon={<Underline size={14} />}
        isActive={isMarkActive("underline")}
        onMouseDown={(e) => toggleMark("underline", e)}
      />
      <ToolbarButton
        icon={<Strikethrough size={14} />}
        isActive={isMarkActive("strike")}
        onMouseDown={(e) => toggleMark("strike", e)}
      />
    </div>
  );
};

const useHandleCanvasDblClick = () => {
  const INLINE_EDITABLE_BLOCKS = ["Heading", "Paragraph", "Text", "Link", "Span", "Button"];
  const updateContent = useUpdateBlocksProps();
  const [editingBlockId, setEditingBlockId] = useAtom(inlineEditingActiveAtom);
  const { clearHighlight } = useBlockHighlight();
  const getBlockAtomValue = useGetBlockAtomValue(pageBlocksAtomsAtom);
  return useCallback(
    (e) => {
      if (editingBlockId) return;
      const chaiBlock: HTMLElement = getTargetedBlock(e.target);
      const blockType = chaiBlock.getAttribute("data-block-type");
      if (!blockType || !INLINE_EDITABLE_BLOCKS.includes(blockType)) {
        return;
      }
      const blockId = chaiBlock.getAttribute("data-block-id");
      const content = (getBlockAtomValue(blockId) as ChaiBlock)["content"];
      const newBlock = document.createElement("div");

      chaiBlock.style.display = "none";

      if (blockType === "Text") {
        newBlock.style.display = "inline-block";
      }

      chaiBlock.parentNode.insertBefore(newBlock, chaiBlock.nextSibling);

      // Create Slate editor
      const editor = withHistory(withReact(createEditor()));

      // Initialize with content
      let initialValue: Descendant[] = deserialize(content);

      // Render Slate editor
      const root = ReactEditor.findDocumentOrShadowRoot(editor);
      const slateRoot = document.createElement("div");
      newBlock.appendChild(slateRoot);

      // Create a React component for the editor
      const SlateEditor = () => {
        const [value, setValue] = React.useState(initialValue);

        return (
          <Slate editor={editor} initialValue={initialValue} onChange={setValue}>
            <div className="overflow-hidden rounded border">
              <InlineToolbar editor={editor} />
              <Editable
                placeholder="Type here..."
                style={{ minHeight: "20px", padding: "4px" }}
                renderLeaf={(props) => <Leaf {...props} />}
                onBlur={() => {
                  // Serialize the content to preserve formatting
                  const content = serialize(value);

                  updateContent([blockId], { content });
                  chaiBlock.removeAttribute("style");
                  setEditingBlockId("");
                  clearHighlight();
                  destroySlateEditor(editor, newBlock);
                }}
              />
            </div>
          </Slate>
        );
      };

      // Render the editor
      ReactDOM.render(<SlateEditor />, slateRoot);

      // Focus the editor
      ReactEditor.focus(editor);

      // Set editing block ID
      setEditingBlockId(blockId);
    },
    [editingBlockId, updateContent, setEditingBlockId, clearHighlight, getBlockAtomValue],
  );
};

const useHandleCanvasClick = () => {
  const [, setStyleBlockIds] = useSelectedStylingBlocks();
  const [ids, setIds] = useSelectedBlockIds();
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const [treeRef] = useAtom(treeRefAtom);
  const { clearHighlight } = useBlockHighlight();
  return (e: any) => {
    if (editingBlockId) return;
    e.stopPropagation();
    const chaiBlock: HTMLElement = getTargetedBlock(e.target);
    if (chaiBlock?.getAttribute("data-block-id") && chaiBlock?.getAttribute("data-block-id") === "container") {
      setIds([]);
      setStyleBlockIds([]);
      clearHighlight();
      return;
    }

    if (chaiBlock?.getAttribute("data-block-parent")) {
      // check if target element has data-styles-prop attribute
      const styleProp = chaiBlock.getAttribute("data-style-prop") as string;
      const styleId = chaiBlock.getAttribute("data-style-id") as string;
      const blockId = chaiBlock.getAttribute("data-block-parent") as string;
      if (!ids.includes(blockId)) {
        treeRef?.closeAll();
      }

      setStyleBlockIds([{ id: styleId, prop: styleProp, blockId }]);
      setIds([blockId]);
    } else if (chaiBlock?.getAttribute("data-block-id")) {
      const blockId = chaiBlock.getAttribute("data-block-id");
      if (!ids.includes(blockId)) {
        treeRef?.closeAll();
      }
      setStyleBlockIds([]);
      setIds(blockId === "canvas" ? [] : [blockId]);
    }

    clearHighlight();
  };
};

const useHandleMouseMove = () => {
  const [editingBlockId] = useAtom(inlineEditingActiveAtom);
  const { highlightBlock } = useBlockHighlight();

  return throttle((e: any) => {
    if (editingBlockId) return;
    const chaiBlock = getTargetedBlock(e.target);
    if (chaiBlock) {
      highlightBlock(chaiBlock);
    }
  }, 20);
};

const useHandleMouseLeave = () => {
  const { clearHighlight } = useBlockHighlight();
  return clearHighlight;
};

export const Canvas = ({ children }: { children: React.ReactNode }) => {
  const { document } = useFrame();
  const [ids] = useSelectedBlockIds();
  const [styleIds, setSelectedStylingBlocks] = useSelectedStylingBlocks();
  const { clearHighlight } = useBlockHighlight();

  // Add cleanup effect
  useEffect(() => {
    return clearHighlight;
  }, [clearHighlight]);

  useEffect(() => {
    setTimeout(() => {
      if (!isEmpty(styleIds)) {
        return;
      }
      const element = getElementByDataBlockId(document, first(ids) as string);
      if (element) {
        const styleProp = element.getAttribute("data-style-prop") as string;
        if (styleProp) {
          const styleId = element.getAttribute("data-style-id") as string;
          const blockId = element.getAttribute("data-block-parent") as string;
          setSelectedStylingBlocks([{ id: styleId, prop: styleProp, blockId }]);
        }
      }
    }, 100);
  }, [document, ids, setSelectedStylingBlocks, styleIds]);

  const handleDblClick = useHandleCanvasDblClick();
  const handleCanvasClick = useHandleCanvasClick();
  const handleMouseMove = useHandleMouseMove();
  const handleMouseLeave = useHandleMouseLeave();
  const dnd = useDnd();

  return (
    <div
      data-block-id={"canvas"}
      id="canvas"
      onClick={handleCanvasClick}
      onDoubleClick={handleDblClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      {...omit(dnd, "isDragging")}
      className={`relative h-full max-w-full p-px ` + (dnd.isDragging ? "dragging" : "") + ""}>
      {children}
    </div>
  );
};

export const getElementByDataBlockId = (doc: any, blockId: string): HTMLElement =>
  doc.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
