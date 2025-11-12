import { usePageExternalData } from "@/core/atoms/builder";
import { NestedPathSelector } from "@/core/components/nested-path-selector";
import { cn } from "@/core/utils/cn";
import { Button } from "@/ui/shadcn/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/ui/shadcn/components/ui/dialog";
import { WidgetProps } from "@rjsf/utils";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import { Editor, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  TextAlignCenterIcon,
  TextAlignLeftIcon,
  TextAlignRightIcon,
  FontItalicIcon,
  ListBulletIcon,
  ValueIcon,
  EnterFullScreenIcon,
  StrikethroughIcon,
  UnderlineIcon,
  FontBoldIcon,
  CaretDownIcon,
  Link2Icon,
  LinkBreak2Icon,
} from "@radix-ui/react-icons";
import React, { cloneElement, useEffect, useRef, useState } from "react";
import { DropdownMenu, Input } from "@/ui";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { HexAlphaColorPicker } from "react-colorful";
import { useDebouncedState } from "@react-hookz/web";
import { ChaiBlock } from "@/types/common";
import { useDarkMode, useInlineEditing, useSelectedBlock } from "../hooks";
import { lsThemeAtom } from "@/_demo/atoms-dev";
import { useAtom } from "jotai";
import { get, uniq } from "lodash-es";

const getActiveClasses = (editor: any, keys: string[] | boolean, from: string) => {
  const isFromSettings = from === "settings";
  const isActive = typeof keys === "boolean" ? keys : keys.some((key) => editor.isActive(key));
  return {
    "rounded p-1": true,
    "hover:bg-gray-200": !isActive,
    "hover:bg-gray-700": !isFromSettings && !isActive,
    "bg-gray-300 text-gray-900": isActive,
  };
};

const _DropdownMenu = ({
  trigger,
  content,
  from,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode | ((onClose: () => void) => React.ReactNode);
  from?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {from === "canvas" &&
        cloneElement(trigger as any, {
          onClick: () => setIsOpen((prev) => !prev),
        })}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className={`relative outline-none ${from === "canvas" ? "max-w-0 overflow-hidden" : ""}`}>
          {trigger}
        </DropdownMenuTrigger>
        {isOpen && (typeof content === "function" ? content(() => setIsOpen(false)) : content)}
      </DropdownMenu>
    </>
  );
};

// Common Color Picker Component
const ColorPickerContent = ({
  textColor,
  highlightColor,
  onChangeTextColor,
  onChangeHighlightColor,
  onRemoveTextColor,
  onRemoveHighlightColor,
  onClose,
}: {
  textColor: string;
  highlightColor: string;
  onChangeTextColor: (color: string, isInput?: boolean) => void;
  onChangeHighlightColor: (color: string, isInput?: boolean) => void;
  onRemoveTextColor: () => void;
  onRemoveHighlightColor: () => void;
  onClose: () => void;
}) => {
  const [moreColors, setMoreColors] = useState("TEXT");
  const [darkMode] = useDarkMode();
  const [theme]: [any, any] = useAtom(lsThemeAtom);
  const colors = theme?.colors || {};
  const themeColors = Object.values(colors).map((color) => get(color, darkMode ? "1" : "0"));

  const Commons = ({ type, title, color, onChange, onRemove }: any) => {
    return (
      <>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-medium">{title}</div>
          <Input
            type="text"
            value={color || "#000000f2"}
            onChange={(e) => onChange(e.target.value, true)}
            className="!h-5 !w-[90px] !p-0 text-center font-mono text-xs font-medium uppercase text-gray-600"
            placeholder="#000000"
          />
        </div>

        <div className="flex w-[180px] flex-wrap gap-2 pb-2">
          {themeColors?.length > 0 &&
            uniq(themeColors).map((hex) => (
              <button
                key={hex}
                className={cn(
                  "h-5 w-5 cursor-pointer rounded-full border border-gray-900 shadow hover:opacity-80 hover:shadow-lg",
                  {
                    "border-2": hex === color,
                  },
                )}
                style={{ backgroundColor: hex }}
                onClick={() => {
                  onChange(hex);
                  onClose();
                }}
                title={(hex || "#000000")?.toUpperCase()}
              />
            ))}
          <button
            className="relative flex h-5 w-5 cursor-pointer items-center justify-center overflow-hidden rounded-full hover:opacity-80 hover:shadow-lg"
            onClick={() => {
              setMoreColors((prev) => (prev !== type ? type : ""));
            }}
            title="#000000f2">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "conic-gradient(#ff0000, #ff5f00, #ffee00, #00ff40, #00ffe7, #0085ff, #7f00ff, #ff00aa, #ff0000)",
                boxShadow: "0 0 100px 40px #b7efd6",
              }}></div>
          </button>
          <button
            className="flex h-5 w-5 cursor-pointer items-center justify-center rounded-full bg-gray-500 shadow hover:opacity-80 hover:shadow-lg"
            onClick={() => {
              onRemove();
              onClose();
            }}
            title="Remove">
            <svg className="h-3 w-3" viewBox="0 0 167.751 167.751">
              <path d="M0 83.875c0 46.249 37.626 83.875 83.875 83.875s83.875-37.626 83.875-83.875S130.125 0 83.875 0 0 37.626 0 83.875m83.875 68.876C45.897 152.751 15 121.854 15 83.875c0-16.292 5.698-31.272 15.191-43.078l96.762 96.762c-11.806 9.493-26.785 15.192-43.078 15.192m68.875-68.876c0 16.292-5.698 31.272-15.19 43.078L40.797 30.191C52.603 20.698 67.583 15 83.875 15c37.978 0 68.875 30.897 68.875 68.875" />
            </svg>
          </button>
        </div>
        {moreColors === type && (
          <HexAlphaColorPicker color={color} onChange={onChange} style={{ width: "200px", height: "200px" }} />
        )}
      </>
    );
  };

  return (
    <div id="rte-widget-color-picker">
      <Commons
        type="TEXT"
        title="Text Color"
        onChange={onChangeTextColor}
        color={textColor}
        onRemove={onRemoveTextColor}
      />
      <div className="my-2 h-px bg-gray-400" />
      <Commons
        type="HIGHLIGHT"
        title="Highlight Color"
        onChange={onChangeHighlightColor}
        color={highlightColor}
        onRemove={onRemoveHighlightColor}
      />
    </div>
  );
};

// Text Color Picker Component
const TextColorPicker = ({ editor, value, from }: { editor: any; value?: string; from?: string }) => {
  const currentTextColor = editor?.getAttributes("textStyle")?.color;
  const [textColor, setTextColor] = useState(value || currentTextColor);
  const [debouncedTextColor, setDebouncedTextColor] = useDebouncedState(textColor, 500);

  const currentHighlightColor = editor?.getAttributes("highlight")?.color;
  const [highlightColor, setHighlightColor] = useState(value || currentHighlightColor);
  const [debouncedHighlightColor, setDebouncedHighlightColor] = useDebouncedState(highlightColor, 500);

  const handleHighlightColorChange = (newColor: string, isInput?: boolean) => {
    setHighlightColor(newColor);
    if (isInput) {
      setDebouncedHighlightColor(newColor);
    } else {
      editor?.chain().focus().setHighlight({ color: newColor }).run();
    }
  };

  useEffect(() => {
    if (currentHighlightColor) setHighlightColor(currentHighlightColor);
  }, [currentHighlightColor]);

  useEffect(() => {
    if (debouncedHighlightColor?.includes("#") && debouncedHighlightColor?.length >= 3) {
      editor?.chain().focus().setHighlight({ color: debouncedHighlightColor }).run();
    }
  }, [debouncedHighlightColor]);

  const handleTextColorChange = (newColor: string, isInput?: boolean) => {
    setTextColor(newColor);
    if (isInput) {
      setDebouncedTextColor(newColor);
    } else {
      editor?.chain().focus().setColor(newColor).run();
    }
  };

  useEffect(() => {
    if (debouncedTextColor?.includes("#") && debouncedTextColor?.length >= 3) {
      editor?.chain().focus().setColor(debouncedTextColor).run();
    }
  }, [debouncedTextColor]);

  return (
    <_DropdownMenu
      from={from}
      trigger={
        <button
          type="button"
          className={cn("relative flex items-center", getActiveClasses(editor, Boolean(currentTextColor), from))}
          title="Text Color">
          <div
            className="h-4 w-4 rounded-full outline outline-1 outline-gray-400"
            style={{ backgroundColor: currentTextColor || (from === "canvas" ? "#FFFFFF" : "#000000") }}
          />
          <CaretDownIcon className="h-3 w-3 opacity-50" />
        </button>
      }
      content={(onClose) => (
        <DropdownMenuContent className="z-50 rounded-md border bg-white p-3 shadow-xl">
          <ColorPickerContent
            textColor={textColor}
            highlightColor={highlightColor}
            onChangeTextColor={handleTextColorChange}
            onChangeHighlightColor={handleHighlightColorChange}
            onRemoveTextColor={() => {
              editor?.chain().focus().unsetColor().run();
              setTextColor("#000000");
            }}
            onRemoveHighlightColor={() => {
              editor?.chain().focus().unsetHighlight().run();
            }}
            onClose={onClose}
          />
        </DropdownMenuContent>
      )}
    />
  );
};
/**
 * Menu Bar Component
 */
export const MenuBar = ({
  editor,
  from = "settings",
  onExpand,
}: {
  editor: any;
  from?: string;
  onExpand?: () => void;
}) => {
  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt("URL");
    if (url) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  return (
    <div
      id="chai-rich-text-menu-bar"
      className={cn("mb-1 flex flex-wrap gap-0.5 rounded-t-md border-b border-border bg-gray-50 p-1", {
        "rounded-t-xs -ml-0.5 -mt-px mb-0 h-8 border-none bg-green-500 text-white": from === "canvas",
      })}>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={cn("", getActiveClasses(editor, ["bold"], from))}
        title="Bold">
        <FontBoldIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={cn("", getActiveClasses(editor, ["italic"], from))}
        title="Italic">
        <FontItalicIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={cn("", getActiveClasses(editor, ["underline"], from))}
        title="Underline">
        <UnderlineIcon className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={cn("", getActiveClasses(editor, ["strike"], from))}
        title="Strike">
        <StrikethroughIcon className="h-4 w-4" />
      </button>

      <div className="mx-1 h-5 w-px self-center bg-border" />

      <TextColorPicker editor={editor} from={from} />

      <div className="mx-1 h-5 w-px self-center bg-border" />

      <_DropdownMenu
        trigger={
          <button
            type="button"
            className={cn("flex items-center", getActiveClasses(editor, ["bulletList", "orderedList"], from))}
            title="Bullet List">
            <ListBulletIcon className="h-4 w-4" />
            <CaretDownIcon className="h-3 w-3 opacity-50" />
          </button>
        }
        content={
          <DropdownMenuContent className="z-50 rounded-md border bg-white p-1 text-xs shadow-xl">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, ["bulletList"], from),
              )}>
              <ListBulletIcon className="h-4 w-4" /> Unordered List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, ["orderedList"], from),
              )}>
              <ValueIcon className="h-4 w-4" />
              Ordered List
            </DropdownMenuItem>
          </DropdownMenuContent>
        }
        from={from}
      />

      <_DropdownMenu
        from={from}
        trigger={
          <button
            type="button"
            className={cn(
              "flex items-center",
              getActiveClasses(
                editor,
                editor.isActive({ textAlign: "center" }) || editor.isActive({ textAlign: "right" }),
                from,
              ),
            )}
            title="Text Alignment">
            <TextAlignLeftIcon className="h-4 w-4" />
            <CaretDownIcon className="h-3 w-3 opacity-50" />
          </button>
        }
        content={
          <DropdownMenuContent className="z-50 rounded-md border bg-white p-1 text-xs shadow-xl">
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "left" }), from),
              )}>
              <TextAlignLeftIcon className="h-4 w-4" /> Align Left
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "center" }), from),
              )}>
              <TextAlignCenterIcon className="h-4 w-4" /> Align Center
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
              className={cn(
                "flex cursor-pointer items-center gap-x-1 outline-none hover:outline-none",
                getActiveClasses(editor, editor.isActive({ textAlign: "right" }), from),
              )}>
              <TextAlignRightIcon className="h-4 w-4" /> Align Right
            </DropdownMenuItem>
          </DropdownMenuContent>
        }
      />
      {!editor.isActive("link") ? (
        <button
          type="button"
          onClick={addLink}
          className={cn("", getActiveClasses(editor, ["link"], from))}
          title="Add Link">
          <Link2Icon className="h-3.5 w-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={removeLink}
          className={cn("rounded bg-primary/10 p-1 text-primary")}
          title="Remove Link"
          disabled={!editor.isActive("link")}>
          <LinkBreak2Icon className="h-3.5 w-3.5" />
        </button>
      )}
      {onExpand && (
        <>
          <div className="mx-1 h-5 w-px self-center bg-border" />
          <button type="button" onClick={onExpand} className="" title="Open in full screen mode">
            <EnterFullScreenIcon className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
};

/**
 * RTE Modal Component
 */
const RTEModal = ({
  isOpen,
  onClose,
  editor,
  rteElement,
}: {
  editor: Editor;
  isOpen: boolean;
  onClose: () => void;
  rteElement: React.ReactNode;
}) => {
  const pageExternalData = usePageExternalData();

  const handlePathSelect = (path: string) => {
    if (!editor) return;

    // Create the placeholder
    const placeholder = `{{${path}}}`;

    // Focus the editor first
    editor.commands.focus();

    // Check if there's a selection
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;

    if (hasSelection) {
      // If there's a selection, replace it with the placeholder
      editor.chain().deleteSelection().insertContent(placeholder).run();
    } else {
      // No selection, just insert at cursor position
      // Get the text around the cursor to determine spacing
      const { state } = editor;
      const cursorPos = state.selection.from;

      // Get text before and after cursor for smart spacing
      const textBefore = state.doc.textBetween(Math.max(0, cursorPos - 1), cursorPos);
      const textAfter = state.doc.textBetween(cursorPos, Math.min(cursorPos + 1, state.doc.content.size));

      // Determine if we need spacing before the placeholder
      let prefix = "";
      if (cursorPos > 0 && textBefore !== " " && !/[.,!?;:]/.test(textBefore)) {
        prefix = " ";
      }

      // Determine if we need spacing after the placeholder
      let suffix = "";
      if (textAfter && textAfter !== " " && !/[.,!?;:]/.test(textAfter)) {
        suffix = " ";
      }

      // Insert the placeholder with smart spacing
      editor
        .chain()
        .insertContent(prefix + placeholder + suffix)
        .run();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-8">
            <span>Rich Text Editor</span>
            {pageExternalData && Object.keys(pageExternalData).length > 0 && (
              <div className="flex items-center">
                <span className="mr-2 text-sm text-muted-foreground">Add field:</span>
                <div className="rte-path-selector">
                  <NestedPathSelector data={pageExternalData} onSelect={handlePathSelect} />
                </div>
              </div>
            )}
          </DialogTitle>
        </DialogHeader>
        {rteElement}
        <div className="mt-4 flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/**
 * Rich Text Editor Field Component
 */
const RichTextEditorFieldComp = ({ blockId, id, placeholder, value, onChange, onBlur }: WidgetProps) => {
  const rteRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const editor = useRTEditor({
    blockId,
    value,
    placeholder,
    onBlur: ({ editor }) => {
      const html = editor?.getHTML();
      onBlur(id, html);
    },
    onUpdate: ({ editor }) => {
      const html = editor?.getHTML();
      onChange(html);
    },
  });

  useEffect(() => {
    // This is critical for data binding to work - JSONForm.tsx looks for this property
    // to access the editor instance and insert data binding placeholders
    if (rteRef.current && editor) {
      rteRef.current.__chaiRTE = editor;
    }
  }, [blockId, editor]);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const rteElement = (
    <div id={`chai-rte-${id}`} ref={rteRef} className="mt-1 rounded-md border border-input">
      <MenuBar editor={editor} onExpand={() => setIsModalOpen(true)} />
      <EditorContent
        key={id}
        editor={editor}
        id={id}
        placeholder={placeholder}
        className={`overflow-auto ${isModalOpen ? "max-h-[500px] min-h-[400px]" : "max-h-[200px] min-h-[100px]"}`}
      />
    </div>
  );

  return (
    <>
      {isModalOpen && (
        <RTEModal isOpen={isModalOpen} onClose={handleModalClose} editor={editor} rteElement={rteElement} />
      )}
      {!isModalOpen ? <div className="relative">{rteElement}</div> : <div>Open in modal</div>}
    </>
  );
};

const RichTextEditorField = (props: WidgetProps) => {
  const { editingBlockId } = useInlineEditing();
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const selectedBlock = useSelectedBlock() as ChaiBlock;
  const blockId = selectedBlock?._id;

  useEffect(() => {
    setCurrentBlockId(blockId);
  }, [blockId]);

  return currentBlockId && currentBlockId !== editingBlockId ? (
    <RichTextEditorFieldComp key={currentBlockId} {...props} blockId={currentBlockId} />
  ) : null;
};

export { RichTextEditorField as RTEField };

export const useRTEditor = ({
  blockId,
  value = "",
  onUpdate = () => {},
  onBlur = () => {},
  placeholder = "",
  from = "settings",
  style = {},
}: {
  blockId: string;
  value: string;
  onUpdate?: (arg: { editor: Editor; event: Event }) => void;
  onBlur: (arg: { editor: Editor; event: FocusEvent }) => void;
  placeholder?: string;
  from?: "settings" | "canvas";
  style?: React.CSSProperties;
}) => {
  return useEditor(
    {
      extensions: [
        StarterKit,
        TextStyle,
        Color.configure({
          types: ["textStyle"],
        }),
        Highlight.configure({
          multicolor: true,
          HTMLAttributes: {
            class: "highlight",
          },
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-primary underline",
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
          alignments: ["left", "center", "right"],
          defaultAlignment: "left",
        }),
        Underline,
        Placeholder.configure({
          placeholder: placeholder || "Enter text here",
          emptyEditorClass:
            "cursor-text before:content-[attr(data-placeholder)] before:absolute before:opacity-50 before:pointer-events-none",
        }),
      ],
      content: value || "",
      onUpdate: onUpdate as any,
      onBlur: onBlur as any,
      editorProps: {
        attributes: {
          ...((style ? { style } : {}) as any),
          class:
            from === "canvas"
              ? ""
              : "prose prose-sm focus:outline-none min-h-max p-1 prose-p:m-0 prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
        },
      },
    },
    [blockId],
  );
};
