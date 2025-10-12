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
  CheckIcon,
} from "@radix-ui/react-icons";
import React, { cloneElement, useEffect, useRef, useState } from "react";
import { DropdownMenu, Input } from "@/ui";
import { DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/ui/shadcn/components/ui/dropdown-menu";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { HexAlphaColorPicker } from "react-colorful";
import { useDebouncedState } from "@react-hookz/web";
import { ChaiBlock } from "@/types/common";
import { useInlineEditing, useSelectedBlock } from "../hooks";

const getActiveClasses = (editor: any, keys: string[] | boolean, from: string) => {
  const isFromSettings = from === "settings";
  const isActive = typeof keys === "boolean" ? keys : keys.some((key) => editor.isActive(key));
  return {
    "rounded p-1": true,
    "hover:bg-gray-200": isFromSettings && !isActive,
    "hover:bg-gray-700": !isFromSettings && !isActive,
    "bg-primary text-white": isActive && isFromSettings,
    "bg-green-900 text-white": isActive && !isFromSettings,
  };
};

const _DropdownMenu = ({
  trigger,
  content,
  from,
}: {
  trigger: React.ReactNode;
  content: React.ReactNode;
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
        {isOpen && content}
      </DropdownMenu>
    </>
  );
};

// Common Color Picker Component
const ColorPickerContent = ({
  color,
  title,
  onChange,
  onRemove,
  onClose,
}: {
  color: string;
  title: string;
  onChange: (color: string, isInput?: boolean) => void;
  onRemove: () => void;
  onClose: () => void;
}) => (
  <div id="rte-widget-color-picker">
    <div className="mb-2 text-xs font-medium">{title}</div>
    <HexAlphaColorPicker color={color} onChange={onChange} style={{ width: "200px", height: "200px" }} />
    <div className="mt-2 flex items-center gap-2">
      <Input
        type="text"
        value={color || "#000000f2"}
        onChange={(e) => onChange(e.target.value, true)}
        className="!h-7 !w-[85px] !p-0 text-center font-mono text-xs font-medium uppercase"
        placeholder="#000000"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="h-7 w-max px-2 py-1 text-xs"
        onClick={() => {
          onRemove();
          onClose();
        }}>
        Remove
      </Button>
      <CheckIcon className="h-4 w-4 rounded-full border border-gray-500" />
    </div>
  </div>
);

// Text Color Picker Component
const TextColorPicker = ({ editor, value, from }: { editor: any; value?: string; from?: string }) => {
  const currentColor = editor?.getAttributes("textStyle")?.color;
  const [color, setColor] = useState(value || currentColor);
  const [debouncedColor, setDebouncedColor] = useDebouncedState(color, 500);

  const handleColorChange = (newColor: string, isInput?: boolean) => {
    setColor(newColor);
    if (isInput) {
      setDebouncedColor(newColor);
    } else {
      editor?.chain().focus().setColor(newColor).run();
    }
  };

  useEffect(() => {
    if (debouncedColor?.includes("#") && debouncedColor?.length >= 3) {
      editor?.chain().focus().setColor(debouncedColor).run();
    }
  }, [debouncedColor]);

  return (
    <_DropdownMenu
      from={from}
      trigger={
        <button
          type="button"
          className={cn("flex items-center", getActiveClasses(editor, Boolean(currentColor), from))}
          title="Text Color">
          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 32 32">
            <g strokeWidth="0"></g>
            <g strokeLinecap="round" strokeLinejoin="round"></g>
            <g>
              <path d="M22,21h2L17,4H15L8,21h2l1.61-4h8.74Zm-9.57-6,3.44-8.37h.26L19.54,15Z"></path>
              <rect x="6" y="24" width="20" height="4"></rect>
            </g>
          </svg>
          <CaretDownIcon className="h-3 w-3 opacity-50" />
          {currentColor && (
            <div className="absolute bottom-1 left-1 h-0.5 w-3 rounded" style={{ backgroundColor: currentColor }} />
          )}
        </button>
      }
      content={
        <DropdownMenuContent className="z-50 rounded-md border bg-white p-3 shadow-xl">
          <ColorPickerContent
            color={color}
            title="Text Color"
            onChange={handleColorChange}
            onRemove={() => {
              editor?.chain().focus().unsetColor().run();
              setColor("#000000");
            }}
            onClose={() => {}}
          />
        </DropdownMenuContent>
      }
    />
  );
};

// Highlight Color Picker Component
const HighlightColorPicker = ({ editor, value, from }: { editor: any; value?: string; from?: string }) => {
  const currentColor = editor?.getAttributes("highlight")?.color;
  const [color, setColor] = useState(value || currentColor);
  const [debouncedColor, setDebouncedColor] = useDebouncedState(color, 500);
  const isHighlightActive = editor?.isActive("highlight");

  const handleColorChange = (newColor: string, isInput?: boolean) => {
    setColor(newColor);
    if (isInput) {
      setDebouncedColor(newColor);
    } else {
      editor?.chain().focus().setHighlight({ color: newColor }).run();
    }
  };

  useEffect(() => {
    if (currentColor) setColor(currentColor);
  }, [currentColor]);

  useEffect(() => {
    if (debouncedColor?.includes("#") && debouncedColor?.length >= 3) {
      editor?.chain().focus().setHighlight({ color: debouncedColor }).run();
    }
  }, [debouncedColor]);

  return (
    <_DropdownMenu
      from={from}
      trigger={
        <button
          type="button"
          className={cn("flex items-center", getActiveClasses(editor, isHighlightActive, from))}
          title="Background Highlight">
          <svg className="h-[16px] w-[16px]" fill="currentColor" viewBox="0 0 24 24">
            <g strokeWidth="0"></g>
            <g strokeLinecap="round" strokeLinejoin="round"></g>
            <g>
              <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                <g fill="currentColor" fillRule="nonzero">
                  <path
                    d="M20.2585648,2.00438474 C20.6382605,2.00472706 20.9518016,2.28716326 21.0011348,2.65328337 L21.0078899,2.75506004 L21.0038407,7.25276883 C21.0009137,8.40908568 20.1270954,9.36072944 19.0029371,9.48671858 L19.0024932,11.7464847 C19.0024932,12.9373487 18.0773316,13.9121296 16.906542,13.9912939 L16.7524932,13.9964847 L16.501,13.9963847 L16.5017549,16.7881212 C16.5017549,17.6030744 16.0616895,18.349347 15.3600767,18.7462439 L15.2057929,18.8258433 L8.57108142,21.9321389 C8.10484975,22.1504232 7.57411944,21.8450614 7.50959937,21.3535767 L7.50306874,21.2528982 L7.503,13.9963847 L7.25,13.9964847 C6.05913601,13.9964847 5.08435508,13.0713231 5.00519081,11.9005335 L5,11.7464847 L5.00043957,9.4871861 C3.92882124,9.36893736 3.08392302,8.49812196 3.0058865,7.41488149 L3,7.25086975 L3,2.75438506 C3,2.3401715 3.33578644,2.00438474 3.75,2.00438474 C4.12969577,2.00438474 4.44349096,2.28653894 4.49315338,2.6526145 L4.5,2.75438506 L4.5,7.25086975 C4.5,7.63056552 4.78215388,7.94436071 5.14822944,7.99402313 L5.25,8.00086975 L18.7512697,8.00087075 C19.1315998,8.00025031 19.4461483,7.71759877 19.4967392,7.3518545 L19.5038434,7.25019537 L19.5078902,2.75371008 C19.508263,2.33949668 19.8443515,2.00401258 20.2585648,2.00438474 Z M15.001,13.9963847 L9.003,13.9963847 L9.00306874,20.0736262 L14.5697676,17.4673619 C14.8004131,17.3593763 14.9581692,17.1431606 14.9940044,16.89581 L15.0017549,16.7881212 L15.001,13.9963847 Z M17.502,9.50038474 L6.5,9.50038474 L6.5,11.7464847 C6.5,12.1261805 6.78215388,12.4399757 7.14822944,12.4896381 L7.25,12.4964847 L16.7524932,12.4964847 C17.1321889,12.4964847 17.4459841,12.2143308 17.4956465,11.8482552 L17.5024932,11.7464847 L17.502,9.50038474 Z"
                    id="🎨-Color"></path>
                </g>
              </g>
            </g>
          </svg>
          <CaretDownIcon className="h-3 w-3 opacity-50" />
          {isHighlightActive && currentColor && (
            <div className="absolute bottom-1 left-1 h-0.5 w-3 rounded" style={{ backgroundColor: currentColor }} />
          )}
        </button>
      }
      content={
        <DropdownMenuContent className="z-50 rounded-md border bg-white p-3 shadow-xl">
          <ColorPickerContent
            color={color}
            title="Background Highlight"
            onChange={handleColorChange}
            onRemove={() => editor?.chain().focus().unsetHighlight().run()}
            onClose={() => {}}
          />
        </DropdownMenuContent>
      }
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
      <HighlightColorPicker editor={editor} from={from} />

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
              : "prose prose-sm focus:outline-none min-h-max p-1 dark:prose-invert prose-p:m-0 prose-blockquote:m-2 prose-blockquote:ml-4 prose-ul:m-0 prose-ol:m-0 prose-li:m-0",
        },
      },
    },
    [blockId],
  );
};
